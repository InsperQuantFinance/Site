'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  formatarAlocacao,
  formatarDia,
  formatarDiaAno,
  formatarDiaHora,
  formatarHora,
  formatarMes,
  formatarMoeda,
  formatarEixoMoeda,
  formatarResultado,
} from '@/lib/formato-fundo';

/**
 * Gráfico de linhas (ou áreas empilhadas) em SVG, sem biblioteca (o site não
 * tinha nenhuma, e dois gráficos não justificam 100 kB a mais no bundle).
 *
 *   series      [{ id, rotulo, cor, encerrada?, pontos: [{ t (ms), y }] }]
 *   formato     'moeda' (valores) | 'resultado' (lucro/prejuízo, com linha do zero)
 *   escalaX     'tempo' (proporcional ao relógio) | 'ordinal' (um passo por ponto:
 *               noites e fins de semana não ocupam espaço)
 *   rotuloX     'hora' | 'dia' | 'mes'
 *   empilhado   áreas empilhadas a partir do zero; o topo é a soma (o tooltip
 *               mostra também a fatia de cada faixa no total)
 *   referencia  { y, rotulo } linha tracejada horizontal (ex.: fechamento anterior)
 *
 * Linhas de 2px, grade discreta, crosshair com tooltip no hover/toque e setas
 * do teclado. Com 2 a 4 séries o nome vai também na ponta (telas largas);
 * a cor nunca é a única pista.
 */

const ALTURA = 300;
const M = { topo: 14, base: 30 };
const ROTULOS_X = { hora: formatarHora, dia: formatarDia, mes: formatarMes };

/** Largura de um texto do eixo (11px, fonte do site); sem canvas, estimativa. */
function medirTexto(texto, elemento) {
  try {
    const ctx = (medirTexto.canvas ??= document.createElement('canvas')).getContext('2d');
    const fonte = elemento ? getComputedStyle(elemento).getPropertyValue('--sans').trim() : '';
    ctx.font = `11px ${fonte || 'sans-serif'}`;
    return ctx.measureText(texto).width;
  } catch {
    return texto.length * 6.2;
  }
}

function passoBonito(bruto) {
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const f = bruto / pot;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * pot;
}

function marcasY(min, max, quantas = 4) {
  const passo = passoBonito((max - min) / quantas || Math.abs(max) * 0.01 || 1);
  const ini = Math.floor(min / passo) * passo;
  const fim = Math.ceil(max / passo) * passo;
  const out = [];
  for (let v = ini; v <= fim + passo / 2; v += passo) out.push(Number(v.toFixed(6)));
  return out;
}

export default function GraficoLinhas({
  series,
  formato = 'moeda',
  escalaX = 'tempo',
  rotuloX = 'dia',
  empilhado = false,
  referencia = null,
  rotuloAcessivel,
}) {
  const caixa = useRef(null);
  const [largura, setLargura] = useState(0);
  const [foco, setFoco] = useState(null); // índice em `tempos`

  useEffect(() => {
    if (!caixa.current) return undefined;
    const obs = new ResizeObserver(([e]) => setLargura(Math.floor(e.contentRect.width)));
    obs.observe(caixa.current);
    return () => obs.disconnect();
  }, []);

  const visiveis = useMemo(() => series.filter((s) => s.pontos.length), [series]);
  // no celular os rótulos na ponta comeriam 1/3 da largura; a legenda basta
  const rotularPonta = visiveis.length >= 2 && visiveis.length <= 4 && largura >= 560;
  const dir = rotularPonta ? 132 : 18;
  const fmtX = ROTULOS_X[rotuloX] ?? formatarDia;

  const g = useMemo(() => {
    if (!largura || !visiveis.length) return null;
    const tempos = [...new Set(visiveis.flatMap((s) => s.pontos.map((p) => p.t)))].sort((a, b) => a - b);
    const n = tempos.length;

    // empilhado: base e topo de cada faixa em cada instante
    let faixas = null;
    if (empilhado) {
      const acum = new Array(n).fill(0);
      faixas = visiveis.map((s) => {
        const valor = new Map(s.pontos.map((p) => [p.t, p.y]));
        return tempos.map((t, i) => {
          const v = valor.get(t) ?? 0;
          const b = acum[i];
          acum[i] = b + v;
          return { t, b, topo: b + v, v };
        });
      });
    }

    const valores = empilhado
      ? faixas[faixas.length - 1].map((f) => f.topo)
      : visiveis.flatMap((s) => s.pontos.map((p) => p.y));
    let yMin = Math.min(...valores);
    let yMax = Math.max(...valores);
    if (referencia) { yMin = Math.min(yMin, referencia.y); yMax = Math.max(yMax, referencia.y); }
    if (formato === 'resultado' || empilhado) { yMin = Math.min(yMin, 0); yMax = Math.max(yMax, 0); }
    if (yMin === yMax) { yMin -= Math.abs(yMin) * 0.005 || 1; yMax += Math.abs(yMax) * 0.005 || 1; }
    const folga = (yMax - yMin) * 0.08;
    // áreas sempre partem do zero: a altura é o valor
    const ticks = marcasY(empilhado ? 0 : yMin - folga, yMax + folga);
    const dMin = ticks[0];
    const dMax = ticks[ticks.length - 1];

    // margem esquerda do tamanho do maior rótulo do eixo Y
    const passo = ticks.length > 1 ? ticks[1] - ticks[0] : 1;
    const esq = Math.ceil(Math.max(...ticks.map((v) => medirTexto(formatarEixoMoeda(v, passo), caixa.current)))) + 14;
    const w = largura - esq - dir;
    const h = ALTURA - M.topo - M.base;
    let tMin = tempos[0];
    let tMax = tempos[n - 1];
    if (tMin === tMax) { tMin -= 3600e3; tMax += 3600e3; }
    const indice = new Map(tempos.map((t, i) => [t, i]));
    const x = escalaX === 'ordinal' && n > 1
      ? (t) => esq + (indice.get(t) / (n - 1)) * w
      : (t) => esq + ((t - tMin) / (tMax - tMin)) * w;
    const y = (v) => M.topo + (1 - (v - dMin) / (dMax - dMin)) * h;

    // eixo X: no ordinal, o começo de cada dia; senão, os próprios pontos.
    // No máximo ~1 rótulo a cada 110px, sem repetir texto (vários pontos no mesmo mês).
    const candidatos = escalaX === 'ordinal'
      ? tempos.filter((t, i) => i === 0 || formatarDia(t) !== formatarDia(tempos[i - 1]))
      : tempos;
    const nX = Math.max(2, Math.min(7, Math.floor(w / 110)));
    const escolhidos = candidatos.length <= nX
      ? candidatos
      : Array.from({ length: nX }, (_, i) => candidatos[Math.round((i * (candidatos.length - 1)) / (nX - 1))]);
    const marcasX = [];
    for (const t of escolhidos) {
      const texto = fmtX(t);
      if (!marcasX.length || marcasX[marcasX.length - 1].texto !== texto) marcasX.push({ t, texto });
    }

    return { tempos, faixas, ticks, x, y, w, h, esq, marcasX };
  }, [largura, visiveis, formato, dir, empilhado, referencia, escalaX, fmtX]);

  const fmtY = formato === 'resultado' ? formatarResultado : formatarMoeda;
  const passoY = g && g.ticks.length > 1 ? g.ticks[1] - g.ticks[0] : 1;
  const fmtEixo = (v) => formatarEixoMoeda(v, passoY);
  const fmtFoco = rotuloX === 'hora' || escalaX === 'ordinal' ? formatarDiaHora : formatarDiaAno;

  function pontoEm(s, t) {
    // último ponto da série até o instante t; nada depois do fim dela
    if (t > s.pontos[s.pontos.length - 1].t) return null;
    let melhor = null;
    for (const p of s.pontos) if (p.t <= t) melhor = p;
    return melhor;
  }

  function aoMover(evento) {
    if (!g) return;
    const r = evento.currentTarget.getBoundingClientRect();
    const px = evento.clientX - r.left;
    let i = 0;
    let dist = Infinity;
    g.tempos.forEach((t, k) => {
      const d = Math.abs(g.x(t) - px);
      if (d < dist) { dist = d; i = k; }
    });
    setFoco(i);
  }

  function aoTeclar(evento) {
    if (!g) return;
    const ult = g.tempos.length - 1;
    if (evento.key === 'ArrowLeft') setFoco((f) => Math.max(0, (f ?? ult) - 1));
    else if (evento.key === 'ArrowRight') setFoco((f) => Math.min(ult, (f ?? ult) + 1));
    else if (evento.key === 'Escape') setFoco(null);
    else return;
    evento.preventDefault();
  }

  // rótulos na ponta, empurrados para não se sobreporem
  const pontas = useMemo(() => {
    if (!g || !rotularPonta) return [];
    const fim = g.tempos[g.tempos.length - 1];
    const lista = empilhado
      ? visiveis.map((s, k) => {
        const f = g.faixas[k][g.faixas[k].length - 1];
        return f.v > 0 ? { s, py: g.y((f.b + f.topo) / 2) } : null;
      }).filter(Boolean)
      : visiveis.filter((s) => s.pontos[s.pontos.length - 1].t === fim).map((s) => {
        const p = s.pontos[s.pontos.length - 1];
        return { s, py: g.y(p.y) };
      });
    lista.forEach((item) => { item.ly = item.py; });
    lista.sort((a, b) => a.py - b.py);
    for (let i = 1; i < lista.length; i++) {
      if (lista[i].ly - lista[i - 1].ly < 16) lista[i].ly = lista[i - 1].ly + 16;
    }
    return lista;
  }, [g, visiveis, rotularPonta, empilhado]);

  const tFoco = g && foco !== null ? g.tempos[foco] : null;
  const xFoco = tFoco !== null ? g.x(tFoco) : 0;

  // valores do tooltip; no empilhado, de cima para baixo (como na tela) + total
  let linhasTooltip = [];
  if (tFoco !== null) {
    linhasTooltip = visiveis.map((s, k) => {
      if (empilhado) return g.faixas[k][foco].v > 0 ? { s, v: g.faixas[k][foco].v } : null;
      const p = pontoEm(s, tFoco);
      return p ? { s, v: p.y } : null;
    }).filter(Boolean);
    if (empilhado) linhasTooltip.reverse();
  }
  const totalFoco = linhasTooltip.reduce((soma, l) => soma + l.v, 0);
  const anchorX = (x) => (x - g.esq < 30 ? 'start' : g.esq + g.w - x < 30 ? 'end' : 'middle');
  const caminho = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('');

  return (
    <div>
      {(visiveis.length >= 2 || referencia) && (
        <ul className="fundo-legenda" aria-label="Legenda">
          {visiveis.length >= 2 && visiveis.map((s) => (
            <li key={s.id}>
              <span className="fundo-legenda__amostra" style={{ background: s.cor }} aria-hidden="true" />
              {s.rotulo}
              {s.encerrada && <span className="fundo-legenda__nota">&nbsp;· encerrada</span>}
            </li>
          ))}
          {referencia && (
            <li>
              <span className="fundo-legenda__amostra fundo-legenda__amostra--tracejada" aria-hidden="true" />
              {referencia.rotulo}: {formatarMoeda(referencia.y)}
            </li>
          )}
        </ul>
      )}

      <div ref={caixa} className="fundo-grafico" style={{ height: ALTURA }}>
        {g && (
          <svg
            width={largura}
            height={ALTURA}
            role="img"
            aria-label={rotuloAcessivel}
            tabIndex={0}
            onPointerMove={aoMover}
            onPointerDown={aoMover}
            onPointerLeave={() => setFoco(null)}
            onKeyDown={aoTeclar}
            onBlur={() => setFoco(null)}
            style={{ display: 'block', touchAction: 'pan-y', outline: 'none' }}
          >
            {g.ticks.map((v) => (
              <g key={v}>
                <line x1={g.esq} x2={g.esq + g.w} y1={g.y(v)} y2={g.y(v)}
                      stroke={formato === 'resultado' && v === 0 ? 'var(--linha-forte)' : 'var(--linha)'} />
                <text x={g.esq - 10} y={g.y(v)} dy="0.32em" textAnchor="end" className="fundo-eixo">
                  {fmtEixo(v)}
                </text>
              </g>
            ))}

            {g.marcasX.map(({ t, texto }) => (
              <text key={t} x={g.x(t)} y={ALTURA - 8} className="fundo-eixo" textAnchor={anchorX(g.x(t))}>
                {texto}
              </text>
            ))}

            {referencia && (
              <g>
                <line x1={g.esq} x2={g.esq + g.w} y1={g.y(referencia.y)} y2={g.y(referencia.y)}
                      stroke="var(--texto-3)" strokeDasharray="2 4" />
              </g>
            )}

            {empilhado ? (
              <>
                {g.faixas.map((f, k) => (
                  <path
                    key={visiveis[k].id}
                    fill={visiveis[k].cor}
                    fillOpacity={0.88}
                    d={`${caminho(f.map((p) => [g.x(p.t), g.y(p.topo)]))}L${
                      [...f].reverse().map((p) => `${g.x(p.t).toFixed(1)},${g.y(p.b).toFixed(1)}`).join('L')}Z`}
                  />
                ))}
                {/* 2px da cor do fundo entre as faixas */}
                {g.faixas.slice(0, -1).map((f, k) => (
                  <path key={`v${visiveis[k].id}`} fill="none" stroke="var(--fundo-superficie)" strokeWidth={2}
                        d={caminho(f.map((p) => [g.x(p.t), g.y(p.topo)]))} />
                ))}
              </>
            ) : (
              <>
                {visiveis.map((s) => (s.pontos.length > 1 ? (
                  <path key={s.id} fill="none" stroke={s.cor} strokeWidth={2}
                        strokeLinejoin="round" strokeLinecap="round"
                        d={caminho(s.pontos.map((p) => [g.x(p.t), g.y(p.y)]))} />
                ) : null))}
                {/* último ponto de cada série, com anel na cor do fundo; série encerrada: ponto vazado */}
                {visiveis.map((s) => {
                  const p = s.pontos[s.pontos.length - 1];
                  return s.encerrada
                    ? <circle key={s.id} cx={g.x(p.t)} cy={g.y(p.y)} r={3.5} fill="var(--fundo-superficie)"
                              stroke={s.cor} strokeWidth={2} />
                    : <circle key={s.id} cx={g.x(p.t)} cy={g.y(p.y)} r={4} fill={s.cor}
                              stroke="var(--fundo-superficie)" strokeWidth={2} />;
                })}
              </>
            )}

            {pontas.map(({ s, py, ly }) => (
              <g key={s.id}>
                {Math.abs(ly - py) > 1 && (
                  <line x1={g.esq + g.w + 6} x2={g.esq + g.w + 12} y1={py} y2={ly} stroke="var(--linha-forte)" />
                )}
                <text x={g.esq + g.w + 14} y={ly} dy="0.32em" className="fundo-ponta">
                  {s.rotulo.length > 16 ? `${s.rotulo.slice(0, 15)}…` : s.rotulo}
                  {s.rotulo.length > 16 && <title>{s.rotulo}</title>}
                </text>
              </g>
            ))}

            {tFoco !== null && (
              <g pointerEvents="none">
                <line x1={xFoco} x2={xFoco} y1={M.topo} y2={M.topo + g.h} stroke="var(--texto-3)" strokeDasharray="3 3" />
                {visiveis.map((s, k) => {
                  const p = empilhado ? { t: tFoco, y: g.faixas[k][foco].topo } : pontoEm(s, tFoco);
                  if (!p || (empilhado && g.faixas[k][foco].v <= 0)) return null;
                  return <circle key={s.id} cx={g.x(p.t)} cy={g.y(p.y)} r={4.5} fill={s.cor}
                                 stroke="var(--fundo-superficie)" strokeWidth={2} />;
                })}
              </g>
            )}

            {/* área de captura maior que as linhas */}
            <rect x={g.esq} y={0} width={g.w} height={ALTURA} fill="transparent" />
          </svg>
        )}

        {tFoco !== null && (
          <div
            className="fundo-tooltip"
            role="status"
            style={{
              left: xFoco > largura / 2 ? undefined : xFoco + 14,
              right: xFoco > largura / 2 ? largura - xFoco + 14 : undefined,
            }}
          >
            <div className="fundo-tooltip__quando">{fmtFoco(tFoco)}</div>
            {linhasTooltip.map(({ s, v }) => (
              <div key={s.id} className="fundo-tooltip__linha">
                <span className="fundo-legenda__amostra" style={{ background: s.cor }} aria-hidden="true" />
                {visiveis.length > 1 && <span>{s.rotulo}</span>}
                <strong>{fmtY(v)}</strong>
                {empilhado && <span className="fundo-tooltip__fatia">{totalFoco ? formatarAlocacao(v / totalFoco) : '—'}</span>}
              </div>
            ))}
            {empilhado && linhasTooltip.length > 1 && (
              <div className="fundo-tooltip__linha fundo-tooltip__total">
                <span>Total</span>
                <strong>{fmtY(totalFoco)}</strong>
                <span className="fundo-tooltip__fatia">{formatarAlocacao(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
