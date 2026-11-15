/**
 * De onde sai a URL absoluta do site.
 *
 * Isto morava dentro de app/layout.js e só servia ao `metadataBase`. Com
 * sitemap, robots e canonical precisando do mesmo valor, virou módulo: três
 * cópias da mesma lógica é como um deles acaba anunciando o host errado.
 *
 * A ordem importa, e o último caso é o que muda em relação ao que existia:
 *
 * 1. NEXT_PUBLIC_SITE_URL, quando alguém quiser forçar um host (um staging
 *    próprio, por exemplo).
 * 2. O domínio oficial, quando o build é de produção. Antes aqui vinha o
 *    `VERCEL_URL`, e isso é veneno para SEO: ele muda a cada publicação, então
 *    canonical e sitemap anunciavam um host diferente por deploy, e o Google
 *    tratava cada um como um site à parte — nenhum acumulava autoridade.
 * 3. `VERCEL_URL` segue valendo só para preview de pull request, que é onde
 *    ele é de fato o endereço certo.
 */
const DOMINIO_OFICIAL = 'https://www.insperquantfinance.com';

function resolver() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_ENV === 'production') return DOMINIO_OFICIAL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

/** Sem barra no fim: quem concatena caminho sempre começa com "/". */
export const URL_SITE = resolver().replace(/\/$/, '');

/** Nome oficial e sigla — o que as pessoas de fato digitam na busca. */
export const NOME_SITE = 'Insper Quantitative Finance';
export const SIGLA = 'IQF';
