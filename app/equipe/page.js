import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import CartaoPessoa from '@/components/landing/CartaoPessoa';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { agruparEquipe, carregarEquipe, rotuloDoCargo } from '@/lib/equipe';

export const metadata = {
  title: 'Equipe · IQF Insper',
  description:
    'Quem faz o Insper Quantitative Finance: a diretoria e os membros efetivados da liga de finanças quantitativas do Insper.',
  // Canonical próprio: sem ele, a mesma página acessada com parâmetro
  // de campanha (?utm_source=...) vira uma URL concorrente na busca.
  alternates: { canonical: '/equipe' },
  // OpenGraph próprio. Sem isto toda página compartilhada no WhatsApp
  // ou no LinkedIn aparecia com o título da home.
  openGraph: { title: 'Equipe · IQF Insper', description: 'Quem faz o Insper Quantitative Finance: a diretoria e os membros efetivados da liga de finanças quantitativas do Insper.', url: '/equipe', type: 'website' },
};

// A página é estática e revalida junto com o resto do site. Nada aqui lê
// cookie: a view equipe_publica é legível pelo anônimo.
export const revalidate = 600;

export default async function PaginaEquipe() {
  const membros = await carregarEquipe();
  const grupos = agruparEquipe(membros);
  // O presidente abre a página sozinho; o resto da diretoria entra na grade.
  const presidente = membros.find((m) => m.cargo === 'presidente') ?? null;

  return (
    <>
      <Header />
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Equipe" />

        <section className="secao secao--claro" style={{ borderBottom: 'none' }}>
          <div className="container">
            {grupos.length > 0 ? (
              grupos.map((g) => {
                // Na Diretoria o presidente já saiu em destaque acima: tirá-lo
                // da grade evita que ele apareça duas vezes.
                const naGrade =
                  g.chave === 'diretoria' && presidente
                    ? g.pessoas.filter((p) => p.id !== presidente.id)
                    : g.pessoas;

                return (
                  <div key={g.chave} className="grupo-equipe">
                    <h2 className="grupo-equipe__titulo">{g.label}</h2>

                    {g.chave === 'diretoria' && presidente && (
                      <CartaoPessoa
                        pessoa={presidente}
                        rotulo={rotuloDoCargo(presidente.cargo)}
                        destaque
                      />
                    )}

                    <div className="grade-pessoas">
                      {naGrade.map((p) => (
                        <CartaoPessoa key={p.id} pessoa={p} rotulo={rotuloDoCargo(p.cargo)} />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Quadro vazio não é erro: é o estado antes de alguém ligar o
                 `publico` no perfil. Dizer isso é melhor que uma grade vazia. */
              <div style={{ maxWidth: '56ch' }}>
                <p className="p-corpo" style={{ margin: '0 0 24px' }}>
                  O quadro de membros ainda não está publicado. Cada pessoa autoriza a própria aparição pela área de
                  membros — assim que as autorizações entrarem, a lista aparece aqui.
                </p>
                <a className="btn btn--vazado" href="/processo-seletivo">Quero entrar</a>
              </div>
            )}
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
