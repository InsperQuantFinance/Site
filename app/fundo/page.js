import Header from '@/components/landing/Header';
import { DadosFundo } from '@/components/fundo/DadosFundo';
import PainelEstrategias from '@/components/fundo/PainelEstrategias';
import PainelPatrimonio from '@/components/fundo/PainelPatrimonio';
import { Rodape } from '@/components/landing/Secoes';
import { carregarFundo } from '@/lib/fundo';
import { formatarDiaHora, formatarMoeda, formatarVariacao } from '@/lib/formato-fundo';
import './fundo.css';

export const metadata = {
  title: 'Fundo · IQF',
  description:
    'O fundo fictício da liga: R$ 1 milhão virtuais operados pelas estratégias dos membros, atualizado a cada 15 minutos.',
};

// A VM manda dados a cada 15 min e a rota de recebimento antecipa a
// revalidação; isto é o teto, caso a antecipação falhe.
export const revalidate = 900;

function Cartao({ rotulo, valor, detalhe }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 10 }}>{rotulo}</div>
      <div className="fundo-cartao__valor">{valor}</div>
      {detalhe && <div className="fundo-cartao__detalhe">{detalhe}</div>}
    </div>
  );
}

function SemDados() {
  return (
    <section className="secao">
      <div className="container" style={{ maxWidth: 640 }}>
        <p className="p-corpo" style={{ margin: 0 }}>
          Os números do fundo aparecem aqui assim que a primeira atualização chegar. Volte em alguns minutos.
        </p>
      </div>
    </section>
  );
}

export default async function PaginaFundo() {
  const fundo = await carregarFundo();
  const estrategias = fundo?.estrategias ?? [];

  return (
    <>
      <Header />

      <main>
        <section className="secao secao--mesh secao--mesh-azul" style={{ padding: '150px var(--gutter) 72px' }}>
          <div className="container">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Fundo IQF · fictício</div>
            <h1 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '22ch' }}>
              As estratégias da liga, operando todos os dias
            </h1>
            <p className="p-corpo" style={{ maxWidth: '62ch', margin: 0 }}>
              <strong>Este é um fundo fictício: nenhum dinheiro real está envolvido.</strong> São R$ 1 milhão virtuais
              numa conta de simulação da B3. Os membros escrevem as estratégias em Python, e elas operam sozinhas em
              todo pregão.
            </p>
            {fundo && (
              <nav className="fundo-atalhos eyebrow" aria-label="Nesta página">
                <a href="#patrimonio">Patrimônio</a>
                {estrategias.length > 0 && <a href="#estrategias">Estratégias</a>}
                <a href="#como-ler">Como ler</a>
              </nav>
            )}
          </div>
        </section>

        {!fundo ? <SemDados /> : (
          <DadosFundo pontos={fundo.pontos} estrategias={estrategias}>
            <section className="secao">
              <div className="container">
                <div className="grade-hairline grade-4 fundo-cartoes">
                  <Cartao rotulo="Patrimônio" valor={formatarMoeda(fundo.patrimonio)} />
                  <Cartao rotulo="Desde o início" valor={formatarVariacao(fundo.retorno)} detalhe="retorno da cota" />
                  <Cartao rotulo="No dia" valor={formatarVariacao(fundo.variacaoDia)}
                          detalhe="contra o fechamento anterior" />
                  <Cartao rotulo="Atualizado em" valor={formatarDiaHora(fundo.atualizadoEm)}
                          detalhe="a cada 15 min, no pregão" />
                </div>

                <h2 id="patrimonio" className="eyebrow" style={{ margin: '64px 0 20px' }}>Patrimônio</h2>
                <PainelPatrimonio />
              </div>
            </section>

            {estrategias.length > 0 && (
              <section id="estrategias" className="secao secao--carvao">
                <div className="container">
                  <h2 className="eyebrow" style={{ marginBottom: 16 }}>Estratégias</h2>
                  <p className="p-corpo" style={{ maxWidth: '62ch', margin: '0 0 32px' }}>
                    Cada estratégia administra uma fatia do patrimônio. Veja quanto cada uma rendeu ou quanto do
                    fundo está com cada uma, no período que quiser.
                  </p>
                  <PainelEstrategias />
                </div>
              </section>
            )}

            <section id="como-ler" className="secao">
              <div className="container" style={{ maxWidth: 760 }}>
                <h2 className="eyebrow" style={{ marginBottom: 16 }}>Como ler</h2>
                <ul className="fundo-notas">
                  <li>As ordens saem uma vez por dia, às 10:30. Fora disso, o patrimônio só muda com o preço dos ativos.</li>
                  <li>Dia e Semana mostram os pontos de 15 em 15 minutos do pregão; Mês, um ponto por hora; Ano e Total, o
                    fechamento de cada dia, que é o valor oficial da cota. Em Semana e Mês, noites e fins de semana não
                    ocupam espaço no gráfico. Mês e Ano aparecem quando o fundo tiver mais de um mês e de um ano.</li>
                  <li>A variação ao lado do período é o retorno da cota: do fechamento anterior ao período até agora.</li>
                  <li>O retorno de cada estratégia é calculado sobre o patrimônio que ela administra, encadeado ponto a
                    ponto como a cota do fundo. Assim uma estratégia com 10% do fundo e outra com 50% ficam comparáveis,
                    mesmo que a fatia mude no caminho.</li>
                  <li>Numa conta de simulação as ordens são executadas sem fila e sem mover o preço, o que deixa o resultado
                    um pouco melhor do que seria no mercado real. Os custos de operação são estimados e descontados.</li>
                  <li>Os ativos que cada estratégia opera não são divulgados.</li>
                </ul>
              </div>
            </section>
          </DadosFundo>
        )}
      </main>

      <Rodape />
    </>
  );
}
