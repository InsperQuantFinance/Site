import './fontes.css';
import './globals.css';
import { NOME_SITE, URL_SITE } from '@/lib/site';
import { LINKS_SOCIAIS } from '@/lib/conteudo-liga';

/* O título e a descrição da home são a linha que aparece no resultado do
   Google, e por isso são escritos para a BUSCA, não para a marca.

   O título carrega as três formas pelas quais a liga é digitada — "Insper
   Quant", "IQF" e "Insper Quantitative Finance" — e nessa ordem: o buscador
   não trata "quant" como prefixo confiável de "quantitative", então a forma
   curta precisa estar escrita literalmente, e no começo, que é a parte do
   título que sobrevive ao corte. A descrição cabe em ~155 caracteres, que é
   onde o Google corta, e repete os termos da busca real: liga, finanças
   quantitativas, Insper. */
const TITULO = 'Insper Quant (IQF) — Insper Quantitative Finance, liga de finanças quantitativas';
const DESCRICAO =
  'IQF (Insper Quant) é a liga de finanças quantitativas do Insper: estratégias '
  + 'próprias em Python, competições nacionais e um fundo fictício operando na B3.';

export const metadata = {
  metadataBase: new URL(URL_SITE),

  // Canonical da home. Cada página declara a sua; sem isso, variações de URL
  // (com/sem barra, com parâmetro de campanha) competem entre si na busca.
  alternates: { canonical: '/' },

  // Sem `template` de propósito: cada página deste site já escreve o próprio
  // sufixo ("Projetos · IQF"), e um template "%s · IQF" aqui transformaria
  // todos eles em "Projetos · IQF · IQF".
  title: TITULO,
  description: DESCRICAO,
  // Termos pelos quais a liga é procurada e que nem sempre aparecem no corpo
  // da página. Não pesa em ranking há anos, mas alimenta buscadores menores
  // e agregadores de entidades estudantis.
  keywords: ['IQF', 'Insper Quant', 'insperquant', 'Insper Quantitative Finance',
    'liga de finanças quantitativas',
    'finanças quantitativas Insper', 'liga quant Insper', 'trading quantitativo',
    'Insper', 'liga estudantil Insper', 'quant Brasil'],
  /* Sem `icons` declarado aqui de propósito. O ícone vem de app/icon.png e
     app/apple-icon.png pela convenção do Next — declarar `icons` neste objeto
     SOBRESCREVE a convenção, e era por isso que só existia um <link> apontando
     para um PNG branco sobre fundo transparente: invisível no cartão branco do
     Google, que então cai no globo genérico. Os arquivos novos trazem a marca
     sobre o preto da identidade, legível nos dois temas, e public/favicon.ico
     cobre o rastreador que busca /favicon.ico direto, sem ler o HTML. */
  applicationName: NOME_SITE,

  // A área de membros não tem nada que deva entrar em buscador, e as páginas
  // dela ficam atrás de login de qualquer forma; o que vale indexar é a landing.
  robots: { index: true, follow: true },

  openGraph: {
    type: 'website',
    siteName: NOME_SITE,
    title: TITULO,
    description: DESCRICAO,
    url: '/',
    locale: 'pt_BR',
    // A imagem vem de app/opengraph-image.js pela convenção do Next: ele
    // preenche url, width, height e type sozinho. Declarar `images` aqui
    // sobrescreveria isso.
  },

  twitter: {
    // `summary_large_image` é o que mostra o card grande; sem isto o X usa a
    // miniatura quadrada e corta o título da imagem.
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRICAO,
  },
};

/**
 * Dados estruturados da organização (JSON-LD).
 *
 * As tags de <meta> dizem ao buscador como MOSTRAR a página; isto diz a ele o
 * que a página É. É o que permite ao Google ligar "IQF", "Insper Quantitative
 * Finance" e o perfil do LinkedIn à mesma entidade, em vez de três coisas
 * soltas — e é o pré-requisito do painel lateral que aparece ao buscar pelo
 * nome de uma instituição.
 *
 * `sameAs` é a parte que faz esse trabalho: são as contas que o buscador já
 * conhece e consegue cruzar. `parentOrganization` prende a liga ao Insper,
 * que é como a maioria das buscas chega aqui ("liga quant do Insper").
 *
 * Só fatos verificáveis entram. Nada de número de membros, data de fundação
 * ou prêmio que o site não sustente em outro lugar — dado estruturado errado
 * é pior que dado estruturado ausente, porque o Google pode penalizar.
 */
const DADOS_ORGANIZACAO = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${URL_SITE}/#organizacao`,
  name: NOME_SITE,
  alternateName: ['IQF', 'Liga Insper Quantitative Finance', 'Insper Quant'],
  description:
    'Liga universitária de finanças quantitativas do Insper. Os membros desenvolvem '
    + 'estratégias próprias em Python, disputam competições nacionais e operam um fundo '
    + 'fictício em conta de simulação da B3.',
  url: URL_SITE,
  logo: `${URL_SITE}/assets/logo-iqf.png`,
  email: LINKS_SOCIAIS.email,
  foundingLocation: { '@type': 'Place', name: 'São Paulo, Brasil' },
  parentOrganization: {
    '@type': 'CollegeOrUniversity',
    name: 'Insper Instituto de Ensino e Pesquisa',
    url: 'https://www.insper.edu.br',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rua Quatá, 300',
    addressLocality: 'São Paulo',
    addressRegion: 'SP',
    postalCode: '04546-042',
    addressCountry: 'BR',
  },
  sameAs: [LINKS_SOCIAIS.linkedin, LINKS_SOCIAIS.instagram],
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* No <body> e não no <head>: o Google lê JSON-LD dos dois lugares, e
            aqui ele não concorre com o carregamento das fontes e do CSS. */}
        <script
          type="application/ld+json"
          // O conteúdo é um objeto nosso, sem entrada de usuário: não há
          // caminho para injeção. O JSON.stringify ainda escapa o que precisa.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ORGANIZACAO) }}
        />
        {children}
      </body>
    </html>
  );
}
