import Image from 'next/image';
import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { EVENTOS, LINKS_SOCIAIS } from '@/lib/conteudo-liga';
import { buscarPostsInstagram } from '@/lib/instagram';

export const metadata = {
  title: 'Eventos · IQF Insper',
  description:
    'Quant Connect, painéis dentro das gestoras e treinamentos internos: o que a liga de finanças quantitativas do Insper realiza ao longo do ano.',
  // Canonical próprio: sem ele, a mesma página acessada com parâmetro
  // de campanha (?utm_source=...) vira uma URL concorrente na busca.
  alternates: { canonical: '/eventos' },
  // OpenGraph próprio. Sem isto toda página compartilhada no WhatsApp
  // ou no LinkedIn aparecia com o título da home.
  openGraph: { title: 'Eventos · IQF Insper', description: 'Quant Connect, painéis dentro das gestoras e treinamentos internos: o que a liga de finanças quantitativas do Insper realiza ao longo do ano.', url: '/eventos', type: 'website' },
};

// Mesmo intervalo da home: quem manda aqui é o cache do Instagram.
export const revalidate = 600;

export default async function PaginaEventos() {
  const instagram = await buscarPostsInstagram({ limite: 9 });
  const posts = instagram.posts ?? [];

  return (
    <>
      <Header />
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Eventos" />

        <section className="secao secao--claro">
          <div className="container">
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Agenda realizada</div>
            <h2 className="h-secao" style={{ margin: '0 0 56px', maxWidth: '24ch' }}>
              O que já aconteceu
            </h2>

            {EVENTOS.map((ev, i) => {
              const texto = (
                <div>
                  <div className="eyebrow" style={{ color: 'var(--azul)', marginBottom: 14 }}>{ev.tag}</div>
                  <h3 style={{ fontSize: 32, lineHeight: 1.2, margin: '0 0 18px' }}>{ev.titulo}</h3>
                  {ev.paragrafos.map((p, j) => (
                    <p
                      key={j}
                      style={{
                        margin: j === ev.paragrafos.length - 1 ? 0 : '0 0 16px',
                        fontSize: 16,
                        lineHeight: 1.7,
                        color: j === 0 ? 'var(--texto-2)' : 'var(--texto-3)',
                        maxWidth: '52ch',
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              );

              const midia = (
                <div style={{ display: 'grid', gap: 14 }}>
                  {ev.fotos.map((f) => (
                    <div key={f.src} className="photo" style={{ aspectRatio: ev.proporcao }}>
                      <Image src={f.src} alt={f.alt} fill sizes="(max-width: 900px) 100vw, 50vw"
                             placeholder="blur" />
                    </div>
                  ))}
                </div>
              );

              return (
                <div
                  key={ev.titulo}
                  className="duas-colunas"
                  style={{ alignItems: 'center', marginBottom: i === EVENTOS.length - 1 ? 0 : 72 }}
                >
                  {ev.textoPrimeiro ? texto : midia}
                  {ev.textoPrimeiro ? midia : texto}
                </div>
              );
            })}
          </div>
        </section>

        {/* O Instagram entra como registro corrente, depois do que é editorial.
            Sem token ou com o cache vazio a seção inteira some — um bloco
            "nenhuma publicação" não acrescenta nada a quem está lendo. */}
        {posts.length > 0 && (
          <section className="secao secao--grafite" style={{ borderBottom: 'none' }}>
            <div className="container">
              <div className="cabecalho-ultimas">
                <div>
                  <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>No Instagram</div>
                  <h2 className="h-secao" style={{ margin: 0 }}>Dia a dia da liga</h2>
                </div>
                <a className="btn btn--vazado" href={LINKS_SOCIAIS.instagram} target="_blank" rel="noopener">
                  Seguir @insperquant
                </a>
              </div>

              <div className="grade-posts">
                {posts.slice(0, 6).map((post) => (
                  <a key={post.id} href={post.permalink} target="_blank" rel="noopener" className="cartao-post">
                    <div className="photo" style={{ aspectRatio: '1 / 1', border: 'none' }}>
                      {/* unoptimized: a URL do CDN da Meta expira, e o cache do
                          Next acabaria servindo um link morto. */}
                      <Image src={post.imagem} alt="" fill sizes="(max-width: 900px) 100vw, 33vw" unoptimized />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Rodape />
    </>
  );
}
