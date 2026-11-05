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
 * última semana (o que os períodos Dia e Semana usam; lib/periodos-fundo.js).
 */

const PAGINA = 1000; // teto de linhas por resposta do PostgREST
const TIMEOUT_MS = 8000;

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

    // Fechamentos de todos os dias + tudo da última semana (onde estão os intradia).
    const filtro = `tipo.eq.fechamento,data.gte.${somarDias(ultimaData, -6)}`;
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
  const pontos = [...porRegistro.values()].sort((a, b) => a.t - b.t);
  if (!pontos.length) return null;

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
