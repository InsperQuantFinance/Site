'use client';

import { useMemo, useState } from 'react';
import Alternador from '@/components/fundo/Alternador';
import { useDadosFundo } from '@/components/fundo/DadosFundo';
import GraficoLinhas from '@/components/fundo/GraficoLinhas';
import { formatarVariacao } from '@/lib/formato-fundo';
import { periodosDisponiveis, recortar } from '@/lib/periodos-fundo';

/** Patrimônio total ao longo do tempo, com a escolha do período. */
export default function PainelPatrimonio() {
  const { pontos } = useDadosFundo();
  const opcoes = useMemo(() => periodosDisponiveis(pontos), [pontos]);
  const [periodo, setPeriodo] = useState('total');
  const r = useMemo(() => recortar(pontos, periodo), [pontos, periodo]);
  const series = useMemo(() => [{
    id: 'patrimonio',
    rotulo: 'Patrimônio',
    cor: 'var(--azul)',
    pontos: r.linhas.map((p) => ({ t: p.t, y: p.patrimonio })),
  }], [r]);

  return (
    <div>
      <div className="fundo-controles">
        <Alternador rotulo="Período do gráfico" opcoes={opcoes} valor={periodo} aoMudar={setPeriodo} />
        <p className="fundo-variacao">
          <strong>{formatarVariacao(r.variacao)}</strong> · {r.intervalo}
        </p>
      </div>
      <GraficoLinhas
        key={periodo}
        series={series}
        formato="moeda"
        escalaX={r.escalaX}
        rotuloX={r.rotuloX}
        referencia={r.id === 'dia' && r.base ? { y: r.base.patrimonio, rotulo: 'Fechamento anterior' } : null}
        rotuloAcessivel={`Patrimônio do fundo, período: ${r.rotulo.toLowerCase()} (${r.intervalo})`}
      />
    </div>
  );
}
