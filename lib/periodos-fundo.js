import { formatarDia, formatarDiaAno } from '@/lib/formato-fundo';

/**
 * Janelas de tempo dos gráficos do fundo. Funções puras, usadas no navegador
 * sobre os `pontos` de lib/fundo.js:
 *   { t, data, tipo, patrimonio, cota, est: { [numero]: { alocacao, resultado } } }
 *
 * Dia e Semana usam os pontos de 15 em 15 min; Mês, um por hora; Ano e Total, um
 * por dia (o fechamento, que é o valor oficial da cota).
 */

export const PERIODOS = [
  { id: 'dia', rotulo: 'Dia' },
  { id: 'semana', rotulo: 'Semana', dias: 7 },
  { id: 'mes', rotulo: 'Mês', dias: 30 },
  { id: 'ano', rotulo: 'Ano', dias: 365 },
  { id: 'total', rotulo: 'Total' },
];

/** 'AAAA-MM-DD' + n dias. */
export function somarDias(data, n) {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Um ponto por dia: o fechamento; sem ele (dia corrente), o último intradia. */
export function diarios(pontos) {
  const porData = new Map();
  for (const p of pontos) {
    const atual = porData.get(p.data);
    const melhor = !atual
      || (p.tipo === 'fechamento' && (atual.tipo !== 'fechamento' || p.t > atual.t))
      || (atual.tipo !== 'fechamento' && p.t > atual.t);
    if (melhor) porData.set(p.data, p);
  }
  return [...porData.values()].sort((a, b) => a.t - b.t);
}

/** Um ponto por hora (o último de cada hora). */
export function porHora(pontos) {
  const out = [];
  for (const p of pontos) {
    const ultimo = out[out.length - 1];
    if (ultimo && Math.floor(ultimo.t / 3600e3) === Math.floor(p.t / 3600e3)) out[out.length - 1] = p;
    else out.push(p);
  }
  return out;
}

/**
 * Períodos que valem a pena mostrar: Dia e Semana só com pontos intradia;
 * Mês e Ano só quando o histórico já passou deles (senão seriam iguais ao Total).
 */
export function periodosDisponiveis(pontos) {
  if (!pontos.length) return [];
  const ultimaData = pontos[pontos.length - 1].data;
  const primeiraData = pontos[0].data;
  const intradia = pontos.filter((p) => p.tipo === 'intradia');
  return PERIODOS.filter((per) => {
    if (per.id === 'dia') return intradia.filter((p) => p.data === ultimaData).length >= 2;
    if (per.id === 'semana') {
      const ini = somarDias(ultimaData, -(per.dias - 1));
      return intradia.some((p) => p.data >= ini) && pontos.some((p) => p.data >= ini && p.data < ultimaData);
    }
    if (per.dias) return primeiraData < somarDias(ultimaData, -(per.dias - 1));
    return true;
  });
}

/**
 * Recorta os pontos para um período.
 *   linhas    pontos do gráfico
 *   base      último fechamento antes da janela (null se a janela pega o início)
 *   variacao  retorno da cota no período (sem base: desde a cota inicial, 1,0)
 *   escalaX   'tempo' | 'ordinal' (Semana: noites e fins de semana não ocupam espaço)
 *   rotuloX   'hora' | 'dia' | 'mes'
 *   intervalo texto curto, ex. "29 out – 04 nov 2026"
 */
export function recortar(pontos, id) {
  const ultimo = pontos[pontos.length - 1];
  const ultimaData = ultimo.data;
  const porDia = diarios(pontos);
  const per = PERIODOS.find((p) => p.id === id) ?? PERIODOS[PERIODOS.length - 1];

  let inicio;
  let linhas;
  if (per.id === 'dia') {
    inicio = ultimaData;
    linhas = pontos.filter((p) => p.data === ultimaData);
  } else if (per.id === 'semana') {
    inicio = somarDias(ultimaData, -(per.dias - 1));
    linhas = pontos.filter((p) => p.data >= inicio);
  } else if (per.id === 'mes') {
    inicio = somarDias(ultimaData, -(per.dias - 1));
    linhas = porHora(pontos.filter((p) => p.data >= inicio));
  } else {
    inicio = per.dias ? somarDias(ultimaData, -(per.dias - 1)) : porDia[0].data;
    linhas = porDia.filter((p) => p.data >= inicio);
  }

  let base = null;
  for (let i = porDia.length - 1; i >= 0; i--) {
    if (porDia[i].data < inicio && porDia[i].tipo === 'fechamento') { base = porDia[i]; break; }
  }
  const variacao = Number.isFinite(ultimo.cota) ? ultimo.cota / (base?.cota ?? 1) - 1 : null;

  const primeiro = linhas[0];
  const anos = (ultimo.t - primeiro.t) / (365 * 864e5);
  let intervalo;
  if (per.id === 'dia') intervalo = formatarDiaAno(ultimo.t);
  else if (per.id === 'total') intervalo = `desde ${formatarDiaAno(primeiro.t)}`;
  else {
    const mesmoAno = formatarDiaAno(primeiro.t).slice(-4) === formatarDiaAno(ultimo.t).slice(-4);
    intervalo = `${mesmoAno ? formatarDia(primeiro.t) : formatarDiaAno(primeiro.t)} – ${formatarDiaAno(ultimo.t)}`;
  }

  return {
    id: per.id,
    rotulo: per.rotulo,
    linhas,
    base,
    variacao,
    intervalo,
    escalaX: per.id === 'semana' || per.id === 'mes' ? 'ordinal' : 'tempo',
    rotuloX: per.id === 'dia' ? 'hora' : anos > 0.5 ? 'mes' : 'dia',
  };
}

/**
 * Retorno de cada estratégia, encadeado ponto a ponto (time-weighted): em cada
 * intervalo, o ganho em R$ dividido pelo capital que ela tinha no ponto
 * anterior (fatia × patrimônio). Assim estratégias com fatias muito diferentes,
 * ou cuja fatia mudou no caminho, ficam comparáveis.
 *
 * Devolve Map numero -> Map(t -> fator acumulado), com fator 1 = 0%.
 * O retorno entre dois pontos a e b é fator(b) / fator(a) - 1.
 */
export function fatoresRetorno(pontos) {
  const numeros = new Set();
  for (const p of pontos) for (const n of Object.keys(p.est)) numeros.add(Number(n));
  const saida = new Map();
  for (const n of numeros) {
    const fatores = new Map();
    let fator = 1;
    let resAnterior = null;
    let capAnterior = 0;
    let ultimoCap = 0;
    pontos.forEach((p, i) => {
      const e = p.est[n];
      if (!e) return;
      const capAtual = e.alocacao * p.patrimonio;
      let cap;
      let ganho;
      if (resAnterior === null) {
        // estreia: o capital é a fatia sobre o patrimônio do ponto anterior
        cap = e.alocacao * (i > 0 ? pontos[i - 1].patrimonio : p.patrimonio);
        ganho = e.resultado;
      } else {
        // encerrando (fatia 0 enquanto zera posições): usa o último capital que teve
        cap = capAnterior > 0 ? capAnterior : ultimoCap;
        ganho = e.resultado - resAnterior;
      }
      if (cap > 0) fator *= 1 + ganho / cap;
      fatores.set(p.t, fator);
      resAnterior = e.resultado;
      capAnterior = capAtual;
      if (capAtual > 0) ultimoCap = capAtual;
    });
    saida.set(n, fatores);
  }
  return saida;
}
