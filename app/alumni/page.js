import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import CartaoPessoa from '@/components/landing/CartaoPessoa';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { carregarAlumni } from '@/lib/equipe';

export const metadata = {
  title: 'Alumni · IQF Insper',
  description:
    'Ex-membros do Insper Quantitative Finance e por onde passaram depois da liga.',
  // Canonical próprio: sem ele, a mesma página acessada com parâmetro
  // de campanha (?utm_source=...) vira uma URL concorrente na busca.
  alternates: { canonical: '/alumni' },
  // OpenGraph próprio. Sem isto toda página compartilhada no WhatsApp
  // ou no LinkedIn aparecia com o título da home.
  openGraph: { title: 'Alumni · IQF Insper', description: 'Ex-membros do Insper Quantitative Finance e por onde passaram depois da liga.', url: '/alumni', type: 'website' },
};

export const revalidate = 600;

export default async function PaginaAlumni() {
  const alumni = await carregarAlumni();

  // Agrupa por turma de saída: é a leitura que interessa aqui — quem saiu
  // junto, e quanto tempo a liga já tem de histórico.
  const turmas = new Map();
  alumni.forEach((p) => {
    const chave = p.turma || 'Sem turma registrada';
    if (!turmas.has(chave)) turmas.set(chave, []);
    turmas.get(chave).push(p);
  });

  return (
    <>
      <Header />
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Alumni" />

        <section className="secao secao--claro" style={{ borderBottom: 'none' }}>
          <div className="container">
            {turmas.size > 0 ? (
              [...turmas.entries()].map(([turma, pessoas]) => (
                <div key={turma} className="grupo-equipe">
                  <h2 className="grupo-equipe__titulo">{turma}</h2>
                  <div className="grade-pessoas">
                    {pessoas.map((p) => (
                      <CartaoPessoa key={p.id} pessoa={p} rotulo={null} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ maxWidth: '56ch' }}>
                <p className="p-corpo" style={{ margin: 0 }}>
                  Ainda não há alumni publicados. A lista se forma sozinha: quando um membro é marcado como inativo na
                  área de membros e autorizou aparecer no site, ele passa a constar aqui.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
