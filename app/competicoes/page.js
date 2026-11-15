import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { COMPETICOES } from '@/lib/conteudo-liga';

export const metadata = {
  title: 'Competições · IQF',
  description:
    'Os resultados da liga em competição: Quantamental Challenge e Desafio Quant AI, da Itaú Asset, e o Challenge da Vault Capital.',
};

// Conteúdo escrito à mão, sem banco: a página é estática por completo.
export const dynamic = 'force-static';

export default function PaginaCompeticoes() {
  // Encerradas primeiro, em andamento no fim: a página abre pelo que a liga
  // já provou, não pelo que ainda está rodando.
  const encerradas = COMPETICOES.filter((c) => c.resultado !== 'Em andamento');
  const emAndamento = COMPETICOES.filter((c) => c.resultado === 'Em andamento');

  return (
    <>
      <Header />
      {/* Sem isto os blocos marcados com data-reveal nascem em opacity:0 e
          nunca são revelados — o observer mora neste componente. */}
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Competições" />

        {/* A tira de resultados é a mesma linguagem da faixa do hero: número
            grande em serifada, rótulo em versalete, células separadas por fio. */}
        <section className="secao secao--claro">
          <div className="container">
            {/* As colunas acompanham a contagem — sem isto a 4ª célula fica
                vazia enquanto houver só três resultados. Vai por custom
                property, e não por grid-template-columns inline, senão a
                media query de 900px (que empilha em 2) nunca ganharia. */}
            <div className="marcas" style={{ marginTop: 0, '--marcas-cols': Math.min(encerradas.length, 4) }}>
              {encerradas.map((c) => (
                <div key={c.id} data-reveal>
                  <div className="marcas__valor">{c.resultado}</div>
                  <p className="marcas__texto">
                    no {c.nome} {c.ano}, da {c.promotor}
                    {c.equipe ? `, com o ${c.equipe}` : ''}.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="secao secao--claro-2">
          <div className="container">
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Histórico</div>
            <h2 className="h-secao" style={{ margin: '0 0 56px', maxWidth: '26ch' }}>
              Cada edição, por extenso
            </h2>

            <div className="lista-competicoes">
              {[...encerradas, ...emAndamento].map((c) => (
                <article key={c.id} data-reveal>
                  <div>
                    <div className="competicao__ano">{c.ano}</div>
                    <div className="eyebrow" style={{ marginTop: 6 }}>{c.promotor}</div>
                  </div>
                  <div>
                    <h3 className="competicao__nome">{c.nome}</h3>
                    <div className="competicao__meta">
                      <span className="selo selo--gestao">{c.resultado}</span>
                      {c.equipe && <span className="competicao__equipe">equipe {c.equipe}</span>}
                    </div>
                    <p className="competicao__texto">{c.descricao}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="secao secao--acento" style={{ borderBottom: 'none' }}>
          <div className="container" style={{ maxWidth: 680 }}>
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Processo seletivo</div>
            <h2 className="h-secao" style={{ margin: '0 0 32px' }}>Quer disputar a próxima?</h2>
            <a className="btn btn--solido" href="/processo-seletivo">Quero entrar</a>
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
