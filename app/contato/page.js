import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import FormularioContato from '@/components/landing/FormularioContato';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { LINKS_SOCIAIS } from '@/lib/conteudo-liga';

export const metadata = {
  title: 'Contato · IQF Insper',
  description:
    'Fale com a diretoria do Insper Quantitative Finance: processo seletivo, patrocínio, mentoria de projetos e palestras.',
  // Canonical próprio: sem ele, a mesma página acessada com parâmetro
  // de campanha (?utm_source=...) vira uma URL concorrente na busca.
  alternates: { canonical: '/contato' },
  // OpenGraph próprio. Sem isto toda página compartilhada no WhatsApp
  // ou no LinkedIn aparecia com o título da home.
  openGraph: { title: 'Contato · IQF Insper', description: 'Fale com a diretoria do Insper Quantitative Finance: processo seletivo, patrocínio, mentoria de projetos e palestras.', url: '/contato', type: 'website' },
};

const ENDERECO = 'Insper, Rua Quatá, 300 — Vila Olímpia, São Paulo, SP';

// Embed do Google Maps na forma sem chave de API (output=embed). A página é
// estática e este é o único recurso de terceiros do site; carrega em lazy para
// não entrar no caminho crítico.
const MAPA = `https://maps.google.com/maps?q=${encodeURIComponent('Insper, Rua Quatá, 300, São Paulo')}&z=15&output=embed`;

export default function PaginaContato() {
  return (
    <>
      <Header />
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Contato" />

        {/* Formulário à esquerda, mapa à direita — o arranjo das páginas de
            contato da Insper Asset e da InFinance. Nada mais na seção: quem
            chega aqui quer mandar a mensagem, não ler sobre a liga. */}
        <section className="secao secao--claro">
          <div className="container">
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Fale com a liga</div>
            <h2 className="h-secao" style={{ margin: '0 0 16px', maxWidth: '24ch' }}>
              Entre em contato com o IQF
            </h2>
            <p className="p-corpo" style={{ maxWidth: '58ch', margin: '0 0 48px' }}>
              Escreva para{' '}
              <a href={`mailto:${LINKS_SOCIAIS.email}`} style={{ textDecoration: 'underline' }}>
                {LINKS_SOCIAIS.email}
              </a>{' '}
              ou preencha o formulário abaixo. A diretoria responde no e-mail que você deixar.
            </p>

            <div className="contato-grade">
              <FormularioContato />

              <div className="contato-mapa">
                <iframe
                  src={MAPA}
                  title={`Mapa: ${ENDERECO}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* Endereço e canais numa faixa escura embaixo, como nas duas
            referências. */}
        <section className="secao secao--grafite" style={{ borderBottom: 'none', padding: '72px var(--gutter)' }}>
          <div className="container">
            <div className="grade-hairline grade-3">
              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Endereço</div>
                <div style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--texto-2)' }}>
                  Insper, Rua Quatá, 300<br />
                  Vila Olímpia, São Paulo, SP<br />
                  CEP 04546-042
                </div>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>E-mail</div>
                <a href={`mailto:${LINKS_SOCIAIS.email}`} style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>
                  {LINKS_SOCIAIS.email}
                </a>
              </div>

              <div>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Redes</div>
                <div style={{ display: 'grid', justifyItems: 'start', gap: 6, fontSize: 16 }}>
                  <a href={LINKS_SOCIAIS.linkedin} target="_blank" rel="noopener">LinkedIn</a>
                  <a href={LINKS_SOCIAIS.instagram} target="_blank" rel="noopener">Instagram</a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
