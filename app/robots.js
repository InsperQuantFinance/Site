import { URL_SITE } from '@/lib/site';

/**
 * robots.txt do site.
 *
 * Duas funções aqui, e a segunda é a que importa mais:
 *
 * 1. Apontar o sitemap, que é como o buscador descobre as páginas de uma vez
 *    em vez de depender de seguir link por link.
 *
 * 2. Manter fora do índice tudo que não é público. A área de membros já exige
 *    login, mas uma URL rastreada vira resultado de busca com título — e
 *    "Quadro de membros · IQF" aparecendo no Google é vazamento de estrutura
 *    interna sem nenhum ganho.
 *
 * `/convite/` é o caso mais sério: o token de convite viaja NA URL. Se o
 * Googlebot seguir um desses links (de um e-mail encaminhado, de um print
 * colado em algum lugar), o convite entra no índice e qualquer pessoa cria
 * uma conta com ele. A página já manda `robots: noindex` por conta própria;
 * esta é a segunda tranca, e bloqueia antes mesmo da visita.
 */
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/membros/', '/login', '/convite/', '/api/', '/sair'],
      },
    ],
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  };
}
