import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { registrarErro } from '@/lib/erros';

/**
 * Recebe o formulário de contato da landing e manda o conteúdo por e-mail
 * para a caixa da liga, via Resend.
 *
 * Por que Resend e não o SMTP do Gmail de lib/email.js: aquele arquivo existe
 * para o disparo dos convites, autenticado na conta institucional, e é a conta
 * da gestão que paga o limite diário dele. Contato de visitante anônimo é
 * tráfego de origem desconhecida, e misturar os dois faria um robô de spam na
 * landing queimar a cota que os convites precisam. A API da Resend também não
 * abre conexão SMTP, que na Vercel é o que mais trava em função serverless.
 *
 * Ambiente:
 *   RESEND_API_KEY — painel da Resend → API Keys. Só no servidor; a chave
 *                    nunca é referenciada em componente de cliente.
 *
 * A liga ainda não tem domínio verificado na Resend. Sem domínio, a conta só
 * manda do remetente de teste (onboarding@resend.dev) e só para o e-mail
 * cadastrado na conta — por isso DESTINO é fixo aqui e não vem do formulário.
 * Quando houver domínio próprio, troca-se REMETENTE e DESTINO e nada mais.
 */

const REMETENTE = 'IQF Site <onboarding@resend.dev>';
const DESTINO = 'insperqf@gmail.com';

const LIMITE_NOME = 100;
const LIMITE_EMAIL = 254; // teto de um endereço de e-mail pelo RFC 5321
const LIMITE_MENSAGEM = 5000;

// Validação de e-mail deliberadamente frouxa: a regex "completa" do RFC
// rejeita endereços válidos e não garante que a caixa exista. Aqui ela só
// serve para pegar erro de digitação óbvio; quem valida de verdade é o
// replyTo falhando quando a diretoria responder.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const escapar = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

/** Cabeçalho de e-mail não aceita quebra de linha: é por ela que se injeta
 *  um Bcc extra no assunto. O nome vem de campo aberto, então sai limpo. */
const umaLinha = (s) => String(s ?? '').replace(/[\r\n]+/g, ' ').trim();

const erro = (mensagem, status) => NextResponse.json({ erro: mensagem }, { status });

export async function POST(request) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return erro('Não foi possível ler o formulário. Tente de novo.', 400);
  }

  const nome = typeof corpo?.nome === 'string' ? corpo.nome.trim() : '';
  const email = typeof corpo?.email === 'string' ? corpo.email.trim() : '';
  const mensagem = typeof corpo?.mensagem === 'string' ? corpo.mensagem.trim() : '';
  const armadilha = typeof corpo?.site === 'string' ? corpo.site.trim() : '';

  // Honeypot: o campo fica escondido no formulário, então pessoa nenhuma o
  // preenche. Responde 200 de propósito — 400 ensinaria o robô a tentar de
  // novo sem o campo. Para ele, parece ter dado certo; nada foi enviado.
  if (armadilha) return NextResponse.json({ ok: true });

  if (!nome || !email || !mensagem) {
    return erro('Preencha nome, e-mail e mensagem.', 400);
  }
  if (!EMAIL.test(email) || email.length > LIMITE_EMAIL) {
    return erro('Esse e-mail não parece válido. Confira e tente de novo.', 400);
  }
  if (nome.length > LIMITE_NOME) {
    return erro(`O nome passa de ${LIMITE_NOME} caracteres.`, 400);
  }
  if (mensagem.length > LIMITE_MENSAGEM) {
    return erro(`A mensagem passa de ${LIMITE_MENSAGEM} caracteres.`, 400);
  }

  const chave = process.env.RESEND_API_KEY;
  if (!chave) {
    // Falta de env var é defeito de configuração nossa, não erro de quem
    // escreveu: o nome da variável fica no log do servidor, não na tela.
    console.error('[erro] contato: RESEND_API_KEY não definida no ambiente do servidor.');
    return erro('O envio está indisponível agora. Escreva para insperqf@gmail.com.', 500);
  }

  const nomeLimpo = umaLinha(nome);

  try {
    const { error } = await new Resend(chave).emails.send({
      from: REMETENTE,
      to: DESTINO,
      // Responder na caixa da liga já vai para quem escreveu, sem copiar
      // endereço à mão.
      replyTo: email,
      subject: `Contato pelo site: ${nomeLimpo}`,
      text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}\n`,
      html: `
        <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.7;color:#1a1a1a">
          <p style="margin:0 0 4px"><strong>Nome:</strong> ${escapar(nome)}</p>
          <p style="margin:0 0 20px"><strong>E-mail:</strong> ${escapar(email)}</p>
          <p style="margin:0 0 8px"><strong>Mensagem</strong></p>
          <div style="white-space:pre-wrap;border-left:3px solid #ddd;padding-left:14px">${escapar(mensagem)}</div>
          <p style="margin:24px 0 0;font-size:12px;color:#777">Enviado pelo formulário de contato do site da liga.</p>
        </div>
      `,
    });

    if (error) throw error;
  } catch (e) {
    // A mensagem da Resend cita a chave, o domínio não verificado e o
    // destinatário permitido — infra nossa, que não vai para a tela.
    const amigavel = registrarErro('contato: enviar pela Resend', e, { acao: 'enviar a mensagem' });
    return erro(amigavel, 500);
  }

  return NextResponse.json({ ok: true });
}

/**
 * Sem isto, um GET em /api/contato responderia 405 com o Allow do Next; o
 * texto próprio deixa claro que a rota existe e só aceita POST.
 */
export async function GET() {
  return erro('Esta rota só aceita POST.', 405);
}
