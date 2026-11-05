'use client';

import { useMemo, useState } from 'react';
import Alternador from '@/components/fundo/Alternador';
import { useDadosFundo } from '@/components/fundo/DadosFundo';
import GraficoLinhas from '@/components/fundo/GraficoLinhas';
import {
  corEstrategia,
  formatarAlocacao,
  formatarMoeda,
  formatarResultado,
} from '@/lib/formato-fundo';
import { periodosDisponiveis, recortar } from '@/lib/periodos-fundo';

const MEDIDAS = [
  { id: 'resultado', rotulo: 'Resultado' },
  { id: 'alocado', rotulo: 'Patrimônio alocado' },
];
const COR_LIVRE = '#6b6e75'; // "Não alocado": cinza, fora da paleta das estratégias

/**
 * Estratégias: resultado no período (linhas, a partir do zero no começo da
 * janela) ou o patrimônio que cada uma administra (áreas empilhadas, cuja
 * soma é o patrimônio do fundo). Nunca as posições.
 */
export default function PainelEstrategias() {
  const { pontos, estrategias } = useDadosFundo();
  const opcoes = useMemo(() => periodosDisponiveis(pontos), [pontos]);
  const [periodo, setPeriodo] = useState('total');
  const [medida, setMedida] = useState('resultado');
  const [verEncerradas, setVerEncerradas] = useState(false);
  const r = useMemo(() => recortar(pontos, periodo), [pontos, periodo]);

  // estratégias com algum dado na janela, com o resultado do período
  const linhasTabela = useMemo(() => estrategias.map((e) => {
    const n = e.numero;
    const naJanela = r.linhas.filter((p) => p.est[n]);
    const inicial = r.base?.est[n]?.resultado ?? 0;
    const ult = naJanela[naJanela.length - 1];
    return { ...e, naJanela, inicial, noPeriodo: ult ? ult.est[n].resultado - inicial : null };
  }), [estrategias, r]);

  const series = useMemo(() => {
    if (medida === 'resultado') {
      return linhasTabela.filter((e) => e.naJanela.length).map((e) => {
        const pontosLinha = e.naJanela.map((p) => ({ t: p.t, y: p.est[e.numero].resultado - e.inicial }));
        // criada dentro da janela: a linha larga do zero, no registro anterior à estreia
        const i = r.linhas.indexOf(e.naJanela[0]);
        if (i > 0 && !r.linhas[i - 1].est[e.numero]) pontosLinha.unshift({ t: r.linhas[i - 1].t, y: 0 });
        return {
          id: String(e.numero),
          rotulo: e.rotulo,
          cor: corEstrategia(e.numero),
          encerrada: !e.ativa,
          pontos: pontosLinha,
        };
      });
    }
    const comFatia = linhasTabela.filter((e) => e.naJanela.some((p) => p.est[e.numero].alocacao > 0));
    const lista = comFatia.map((e) => ({
      id: String(e.numero),
      rotulo: e.rotulo,
      cor: corEstrategia(e.numero),
      pontos: r.linhas.map((p) => ({ t: p.t, y: (p.est[e.numero]?.alocacao ?? 0) * p.patrimonio })),
    }));
    const livre = r.linhas.map((p) => {
      const soma = Object.values(p.est).reduce((s, x) => s + x.alocacao, 0);
      return { t: p.t, y: Math.max(0, (1 - soma) * p.patrimonio) };
    });
    if (livre.some((q, i) => q.y > 0.005 * r.linhas[i].patrimonio)) {
      lista.push({ id: 'livre', rotulo: 'Não alocado', cor: COR_LIVRE, pontos: livre });
    }
    return lista;
  }, [medida, linhasTabela, r]);

  const patrimonio = pontos[pontos.length - 1].patrimonio;
  const mostrarPeriodo = r.id !== 'total';
  // só quem existiu no período; a alocação é sempre a de agora (encerrada = 0)
  const visiveisNaTabela = linhasTabela.filter((e) => e.naJanela.length);
  // ativas primeiro; as encerradas ficam recolhidas numa linha própria
  const ativasNaTabela = visiveisNaTabela.filter((e) => e.ativa);
  const encerradasNaTabela = visiveisNaTabela.filter((e) => !e.ativa);
  const colunas = mostrarPeriodo ? 4 : 3;

  return (
    <div>
      <div className="fundo-controles">
        <Alternador rotulo="O que mostrar" opcoes={MEDIDAS} valor={medida} aoMudar={setMedida} />
        <Alternador rotulo="Período do gráfico" opcoes={opcoes} valor={periodo} aoMudar={setPeriodo} />
      </div>
      <p className="fundo-nota" style={{ margin: '0 0 20px' }}>
        {medida === 'resultado'
          ? `Resultado de cada estratégia no período (${r.intervalo}), em reais e já descontados os custos.`
          : `Quanto do patrimônio cada estratégia administra (${r.intervalo}). A soma das faixas é o patrimônio do fundo.`}
      </p>

      <GraficoLinhas
        key={`${medida}-${periodo}`}
        series={series}
        formato={medida === 'resultado' ? 'resultado' : 'moeda'}
        empilhado={medida === 'alocado'}
        escalaX={r.escalaX}
        rotuloX={r.rotuloX}
        rotuloAcessivel={medida === 'resultado'
          ? `Resultado de cada estratégia, ${r.intervalo}`
          : `Patrimônio alocado em cada estratégia, ${r.intervalo}`}
      />

      <div className="fundo-tabela-caixa">
        <table className="fundo-tabela">
          <thead>
            <tr>
              <th scope="col">Estratégia</th>
              <th scope="col" className="num">Patrimônio alocado</th>
              {mostrarPeriodo && <th scope="col" className="num">Resultado no período</th>}
              <th scope="col" className="num">Resultado acumulado</th>
            </tr>
          </thead>
          <tbody>
            {ativasNaTabela.map((e) => <LinhaEstrategia key={e.numero} e={e} patrimonio={patrimonio}
                                                        mostrarPeriodo={mostrarPeriodo} />)}
            {encerradasNaTabela.length > 0 && (
              <tr className="fundo-tabela__grupo">
                <td colSpan={colunas}>
                  <button
                    type="button"
                    className="fundo-tabela__alternar"
                    aria-expanded={verEncerradas}
                    aria-controls="fundo-encerradas"
                    onClick={() => setVerEncerradas((v) => !v)}
                  >
                    <span className="fundo-tabela__seta" aria-hidden="true">{verEncerradas ? '▾' : '▸'}</span>
                    Estratégias encerradas ({encerradasNaTabela.length})
                  </button>
                </td>
              </tr>
            )}
          </tbody>
          {encerradasNaTabela.length > 0 && (
            <tbody id="fundo-encerradas" hidden={!verEncerradas}>
              {encerradasNaTabela.map((e) => <LinhaEstrategia key={e.numero} e={e} patrimonio={patrimonio}
                                                              mostrarPeriodo={mostrarPeriodo} />)}
            </tbody>
          )}
        </table>
      </div>
      {verEncerradas && encerradasNaTabela.length > 0 && (
        <p className="fundo-nota">Estratégias encerradas mantêm o resultado que acumularam até sair do fundo.</p>
      )}
    </div>
  );
}

function LinhaEstrategia({ e, patrimonio, mostrarPeriodo }) {
  return (
    <tr className={e.ativa ? undefined : 'fundo-tabela__inativa'}>
      <td>
        <span className="fundo-legenda__amostra" style={{ background: corEstrategia(e.numero) }} aria-hidden="true" />
        {e.rotulo}
        {!e.ativa && <span className="fundo-tabela__nota"> · encerrada</span>}
      </td>
      <td className="num">
        {formatarMoeda(e.ativa ? e.alocacao * patrimonio : 0)}
        <span className="fundo-tabela__nota"> · {formatarAlocacao(e.ativa ? e.alocacao : 0)}</span>
      </td>
      {mostrarPeriodo && <td className="num">{formatarResultado(e.noPeriodo)}</td>}
      <td className="num">{formatarResultado(e.resultado)}</td>
    </tr>
  );
}
