/**
 * Formatação dos números do fundo. Importável dos dois lados (servidor e
 * navegador): sem imports nem env. Locale e fuso fixos, para o HTML do servidor
 * e o do navegador saírem iguais (o servidor da Vercel roda em UTC).
 */

const FUSO = 'America/Sao_Paulo';

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const moedaCentavos = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const pct = new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const diaMes = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: 'short' });
const diaMesAno = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, day: '2-digit', month: 'short', year: 'numeric' });
const hora = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' });
const mesAno = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, month: 'short', year: 'numeric' });

export const formatarMoeda = (v) => moeda.format(v);
export const formatarMoedaCentavos = (v) => moedaCentavos.format(v);
/**
 * Rótulo de eixo, curto mas sem ambiguidade: as casas decimais acompanham o
 * passo entre as marcas (com passo de R$ 5 mil, "R$ 1,02 mi" repetiria).
 */
export function formatarEixoMoeda(v, passo) {
  if (v === 0) return 'R$ 0';
  const abs = Math.abs(v);
  const sinal = v < 0 ? '−' : '';
  const [div, sufixo] = abs >= 1e6 && passo >= 1e5 ? [1e6, ' mi'] : abs >= 1e3 ? [1e3, ' mil'] : [1, ''];
  // tantas casas quantas o passo tiver (0,25 mi -> 2 casas; 5 mil -> 0)
  const casas = Math.min(3, (String(Number((passo / div).toFixed(6))).split('.')[1] ?? '').length);
  const n = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
  return `${sinal}R$ ${n.format(abs / div)}${sufixo}`;
}
/** Com sinal: +1,23% / −0,45%. */
export function formatarVariacao(v) {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  const s = pct.format(Math.abs(v));
  if (Math.abs(v) < 0.00005) return pct.format(0);
  return `${v > 0 ? '+' : '−'}${s}`;
}
export function formatarResultado(v) {
  if (Math.abs(v) < 0.5) return moeda.format(0);
  return `${v > 0 ? '+' : '−'}${moeda.format(Math.abs(v))}`;
}
/** Fatia do patrimônio: 50,00% */
export const formatarAlocacao = (v) => pct.format(v);
export const formatarDia = (t) => diaMes.format(t).replace('.', '').replace(' de ', ' ');
export const formatarDiaAno = (t) => diaMesAno.format(t).replace('.', '').replaceAll(' de ', ' ');
export const formatarHora = (t) => hora.format(t);
/** "nov 2026" */
export const formatarMes = (t) => mesAno.format(t).replace('.', '').replaceAll(' de ', ' ');
export const formatarDiaHora = (t) => `${formatarDiaAno(t)}, ${formatarHora(t)}`;

/**
 * Cores das estratégias, pela ordem do número (Estratégia 1 = posição 0).
 * Paleta categórica validada contra o fundo escuro do site (#050506 e
 * #0A0B0D): faixa de luminosidade, saturação, separação para daltonismo e
 * contraste >= 3:1. A cor segue a estratégia, nunca a posição na lista.
 * Da 9ª em diante: cinza, e a identificação fica por legenda e tabela.
 */
const CORES = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];
export const corEstrategia = (numero) => CORES[numero - 1] ?? '#8a8a86';
