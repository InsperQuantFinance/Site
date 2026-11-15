import { ErroDeRegra } from '@/lib/erros';

/**
 * Normaliza o LinkedIn para uma URL que dá para clicar.
 *
 * Aceita as três formas que as pessoas realmente colam: a URL inteira, o
 * `linkedin.com/in/fulano` sem protocolo, e só o nome de usuário. Guardar o
 * que foi digitado sem tratar deixaria metade dos links quebrados na /equipe,
 * porque `href="linkedin.com/in/x"` é caminho relativo, não site externo.
 *
 * Devolve null para vazio (o campo é opcional) e lança ErroDeRegra quando o
 * que veio não tem como virar um perfil do LinkedIn.
 */
export function normalizarLinkedin(bruto) {
  if (!bruto) return null;
  let v = String(bruto).trim();
  if (!v) return null;

  // Só o usuário: "fulano-silva" ou "@fulano-silva".
  if (/^@?[\w\-À-ÿ.]{3,100}$/.test(v) && !v.includes('/') && !v.includes('.com')) {
    return `https://www.linkedin.com/in/${v.replace(/^@/, '')}`;
  }

  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;

  let url;
  try {
    url = new URL(v);
  } catch {
    throw new ErroDeRegra('Endereço de LinkedIn inválido. Cole a URL do seu perfil.');
  }

  // Trava o domínio: sem isto o campo vira um redirecionador aberto, porque o
  // valor é publicado como link na página /equipe.
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (host !== 'linkedin.com' && !host.endsWith('.linkedin.com')) {
    throw new ErroDeRegra('O endereço precisa ser do linkedin.com.');
  }

  // Fora query e fragmento: o que as pessoas colam vem cheio de rastreador
  // (?utm_source=share&...), e isso não precisa ficar guardado nem publicado.
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}
