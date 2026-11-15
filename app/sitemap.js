import { URL_SITE } from '@/lib/site';

/**
 * Sitemap do site público.
 *
 * O Google acha páginas seguindo links, e as seis páginas novas já estão no
 * nav — mas o sitemap é o que diz ao buscador QUANDO cada uma mudou e qual
 * importa mais. Sem ele, uma página criada hoje pode levar semanas para ser
 * rastreada, e páginas que mudam toda semana (eventos, fundo) são revisitadas
 * na mesma cadência das que nunca mudam.
 *
 * Só entra o que é público. A área de membros, o login e o convite ficam de
 * fora aqui e bloqueados no robots.js — convite, em especial, tem um token
 * na URL e não pode ser rastreado em hipótese nenhuma.
 */
export default function sitemap() {
  const agora = new Date();

  // changeFrequency é dica, não ordem: o Google decide pela observação. Vale
  // pelo sinal relativo entre as próprias páginas do site.
  const paginas = [
    { caminho: '', priority: 1.0, changeFrequency: 'weekly' },
    { caminho: '/processo-seletivo', priority: 0.9, changeFrequency: 'monthly' },
    { caminho: '/equipe', priority: 0.8, changeFrequency: 'monthly' },
    { caminho: '/competicoes', priority: 0.8, changeFrequency: 'monthly' },
    { caminho: '/fundo', priority: 0.8, changeFrequency: 'daily' },
    { caminho: '/eventos', priority: 0.7, changeFrequency: 'weekly' },
    { caminho: '/contato', priority: 0.6, changeFrequency: 'yearly' },
    { caminho: '/alumni', priority: 0.5, changeFrequency: 'monthly' },
  ];

  return paginas.map(({ caminho, priority, changeFrequency }) => ({
    url: `${URL_SITE}${caminho}`,
    lastModified: agora,
    changeFrequency,
    priority,
  }));
}
