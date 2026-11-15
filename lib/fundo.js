import { diaEMinuto } from '@/lib/formato-fundo';
import { somarDias } from '@/lib/periodos-fundo';
import { criarClienteEstatico } from '@/lib/supabase/server';

/**
 * Dados da página pública /fundo.
 *
 * Lê só as views fundo_publico_* (supabase/migracao-fundo.sql), que o anon
 * enxerga: patrimônio, cota e o resultado de cada estratégia pelo RÓTULO
 * ("Estratégia N" ou o nome público). O id interno das estratégias e as
 * posições não existem nessas views.
 *
 * Vêm os fechamentos de todos os dias e os pontos de 15 em 15 min só da
 * último mês: 15 em 15 min na última semana (Dia e Semana) e um por hora antes
 * disso (Mês). Ver lib/periodos-fundo.js.
 */

const PAGINA = 1000; // teto de linhas por resposta do PostgREST
const TIMEOUT_MS = 8000;
const DIAS_INTRADIA = 31; // dias com pontos intradiários (Mês de hora em hora)

/** Busca todas as linhas, página por página (o PostgREST corta em 1000). */
async function buscarTudo(montarConsulta) {
  const linhas = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await montarConsulta()
      .range(de, de + PAGINA - 1)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    if (error) throw error;
    linhas.push(...(data ?? []));
    if (!data || data.length < PAGINA) return linhas;
  }
}

/**
 * Carrega e organiza os dados. Devolve null quando ainda não há nada publicado
 * ou quando o banco não responde — a página mostra um aviso nos dois casos.
 */
export async function carregarFundo() {
  try {
    const supabase = criarClienteEstatico();

    const { data: ultimo, error } = await supabase
      .from('fundo_publico_serie')
      .select('data')
      .order('ts', { ascending: false })
      .limit(1)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    if (error) throw error;
    if (!ultimo?.length) return null;
    const ultimaData = ultimo[0].data;

    // Fechamentos de todos os dias + os pontos intradiários do último mês.
    const filtro = `tipo.eq.fechamento,data.gte.${somarDias(ultimaData, -(DIAS_INTRADIA - 1))}`;
    const [serie, estrategias] = await Promise.all([
      buscarTudo(() => supabase.from('fundo_publico_serie')
        .select('ts, tipo, data, patrimonio, cota').or(filtro).order('ts')),
      buscarTudo(() => supabase.from('fundo_publico_estrategias')
        .select('ts, tipo, data, numero, rotulo, alocacao, resultado').or(filtro)
        .order('ts').order('numero')),
    ]);
    return montarDados(serie, estrategias);
  } catch (e) {
    console.warn('[fundo] dados indisponíveis:', e?.message ?? e);
    return null;
  }
}

const tempo = (ts) => Date.parse(ts);
// menos casas = HTML menor (a série inteira vai para o navegador)
const arred = (v, casas) => Number(Number(v).toFixed(casas));

/**
 * Junta as duas views num ponto por registro. Função pura (sem banco), para
 * dar para testar com dados de exemplo.
 *
 *   pontos       [{ t, data, tipo, patrimonio, cota, est: { [numero]: { alocacao, resultado } } }]
 *   estrategias  [{ numero, rotulo, alocacao, resultado, ativa }]  (situação atual)
 */
export function montarDados(serie, estrategias) {
  const chave = (r) => `${r.tipo}|${tempo(r.ts)}`;
  const porRegistro = new Map();
  for (const r of serie) {
    porRegistro.set(chave(r), {
      t: tempo(r.ts),
      data: r.data,
      tipo: r.tipo,
      patrimonio: arred(r.patrimonio, 2),
      cota: arred(r.cota, 8),
      est: {},
    });
  }
  // Entram todos os momentos com negócio: abertura, pregão, call de fechamento e
  // after-market (o fundo só publica um ponto quando o valor muda). Depois das 18h15 a
  // B3 não negocia nada; pontos assim (de versões antigas do fundo) saem nos dias que
  // têm fechamento, que é o valor oficial e usa o preço do call, nunca o do after-market.
  const comFechamento = new Set([...porRegistro.values()].filter((p) => p.tipo === 'fechamento')
    .map((p) => p.data));
  const todos = [...porRegistro.values()].filter((p) => !(p.tipo === 'intradia'
    && comFechamento.has(p.data) && diaEMinuto(p.t).min > 18 * 60 + 15)).sort((a, b) => a.t - b.t);
  if (!todos.length) return null;
  // Antes da última semana, um ponto intradiário por hora basta (o Mês é de hora em
  // hora) e deixa o HTML menor. Fechamentos ficam todos.
  const limiteDetalhe = somarDias(todos[todos.length - 1].data, -7);
  const ultimoDaHora = new Map();
  for (const p of todos) {
    if (p.tipo === 'intradia' && p.data < limiteDetalhe) ultimoDaHora.set(Math.floor(p.t / 3600e3), p);
  }
  const pontos = todos.filter((p) => p.tipo !== 'intradia' || p.data >= limiteDetalhe
    || ultimoDaHora.get(Math.floor(p.t / 3600e3)) === p);

  // o número é fixo para cada estratégia (a cor também); o rótulo mais recente vale
  const rotulos = new Map();
  for (const r of [...estrategias].sort((a, b) => tempo(a.ts) - tempo(b.ts))) {
    const p = porRegistro.get(chave(r));
    if (!p) continue;
    const n = Number(r.numero);
    p.est[n] = { alocacao: arred(r.alocacao, 4), resultado: arred(r.resultado, 2) };
    rotulos.set(n, r.rotulo);
  }

  const ultimo = pontos[pontos.length - 1];

  // variação do dia: contra o último fechamento antes do dia corrente
  let base = null;
  for (let i = pontos.length - 1; i >= 0; i--) {
    if (pontos[i].tipo === 'fechamento' && pontos[i].data < ultimo.data) { base = pontos[i]; break; }
  }

  const listaEstrategias = [...rotulos.keys()].sort((a, b) => a - b).map((n) => {
    let atual = null;
    for (let i = pontos.length - 1; i >= 0 && !atual; i--) atual = pontos[i].est[n] ?? null;
    return {
      numero: n,
      rotulo: rotulos.get(n),
      alocacao: atual.alocacao,
      resultado: atual.resultado,
      // fora do último registro (ou com fatia zero) = estratégia removida do fundo
      ativa: Boolean(ultimo.est[n]) && ultimo.est[n].alocacao > 0,
    };
  });

  return {
    atualizadoEm: ultimo.t,
    patrimonio: ultimo.patrimonio,
    // a cota começou em 1,0 (config do fundo), então cota - 1 é o retorno acumulado
    retorno: Number.isFinite(ultimo.cota) ? ultimo.cota - 1 : null,
    variacaoDia: base ? ultimo.cota / base.cota - 1 : null,
    pontos,
    estrategias: listaEstrategias,
  };
}
