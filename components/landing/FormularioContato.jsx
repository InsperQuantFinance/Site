'use client';

import { useState } from 'react';
import { ERRO_CONEXAO, ERRO_GENERICO } from '@/lib/erros';

const LIMITE_NOME = 100;
const LIMITE_MENSAGEM = 5000;

/**
 * Formulário de contato da landing. Manda para /api/contato, que dispara o
 * e-mail para a caixa da liga.
 *
 * A seção de contato continua listando e-mail, LinkedIn e Instagram ao lado:
 * o formulário é o caminho curto, não o único. Se o envio falhar, a mensagem
 * de erro repete o e-mail para a pessoa não ficar sem saída.
 */
export default function FormularioContato() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const resposta = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // O honeypot é lido do próprio formulário: um robô que preenche tudo
        // mexe no campo escondido do DOM, não no state do React.
        body: JSON.stringify({
          nome,
          email,
          mensagem,
          site: e.target.elements.site?.value ?? '',
        }),
      });

      // Corpo pode não ser JSON se a função serverless cair antes da rota
      // (timeout, erro de plataforma) — aí vem HTML e o .json() lança.
      const dados = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(dados?.erro || ERRO_GENERICO);
        setEnviando(false);
        return;
      }

      setEnviado(true);
      setNome('');
      setEmail('');
      setMensagem('');
    } catch {
      // fetch só lança por rede: servidor fora do ar, offline, DNS.
      setErro(ERRO_CONEXAO);
    }

    setEnviando(false);
  }

  if (enviado) {
    return (
      <div className="aviso aviso--ok" role="status">
        Mensagem enviada. A diretoria responde no e-mail que você escreveu.
        <button
          type="button"
          onClick={() => setEnviado(false)}
          style={{
            display: 'block',
            marginTop: 12,
            background: 'none',
            border: 'none',
            padding: 0,
            color: 'inherit',
            font: 'inherit',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} method="post" style={{ display: 'grid', gap: 20 }}>
      {erro && <div className="aviso aviso--erro" role="alert">{erro}</div>}

      <div className="campo">
        <label htmlFor="contato-nome">Nome</label>
        <input
          id="contato-nome"
          name="nome"
          type="text"
          autoComplete="name"
          required
          maxLength={LIMITE_NOME}
          value={nome}
          onChange={(ev) => setNome(ev.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="contato-email">E-mail</label>
        <input
          id="contato-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
      </div>

      <div className="campo">
        <label htmlFor="contato-mensagem">Mensagem</label>
        <textarea
          id="contato-mensagem"
          name="mensagem"
          required
          rows={5}
          maxLength={LIMITE_MENSAGEM}
          value={mensagem}
          onChange={(ev) => setMensagem(ev.target.value)}
        />
      </div>

      {/* Armadilha de spam. Escondida de quem vê e de quem ouve: display:none
          basta para o leitor de tela pular, e tabIndex -1 mantém o campo fora
          da navegação por teclado. autoComplete off para o navegador não
          preencher sozinho e derrubar um envio legítimo. */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label htmlFor="contato-site">Site</label>
        <input id="contato-site" name="site" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <button className="btn btn--solido" type="submit" disabled={enviando} style={{ justifySelf: 'start' }}>
        {enviando ? 'Enviando…' : 'Enviar mensagem'}
      </button>
    </form>
  );
}
