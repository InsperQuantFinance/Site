'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { salvarMeuPerfil } from './acoes';

/**
 * Edição do próprio perfil: nome e LinkedIn.
 *
 * O LinkedIn entrou aqui porque é o que a página pública /equipe mostra ao
 * lado de cada pessoa, e deixar isso só na mão da gestão significava 23
 * cadastros feitos por duas pessoas — na prática, metade do quadro sem link.
 *
 * Antes este formulário escrevia direto no Supabase pelo navegador. Agora
 * passa por uma server action: o trigger do banco bloqueia o próprio membro de
 * mexer em `linkedin` pela API REST, e a action é quem valida a identidade e
 * normaliza a URL antes de gravar.
 *
 * Frente, turma, cargo e situação seguem fora: quem define é a gestão.
 */
function Botao() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn--solido" type="submit" disabled={pending} style={{ justifySelf: 'start' }}>
      {pending ? 'Salvando…' : 'Salvar perfil'}
    </button>
  );
}

export default function FormularioPerfil({ usuario }) {
  const [estado, acao] = useFormState(salvarMeuPerfil, null);

  return (
    <form action={acao} style={{ display: 'grid', gap: 20 }}>
      {estado?.erro && <div className="aviso aviso--erro">{estado.erro}</div>}
      {estado?.ok && <div className="aviso aviso--ok">{estado.mensagem}</div>}

      <div className="campo">
        <label htmlFor="nome">Nome completo</label>
        {/* A `key` remonta o input quando a action devolve o valor gravado.
            Sem ela o React mantém o que foi digitado, e o campo ficaria
            mostrando a URL suja depois de um salvamento que a limpou. */}
        <input
          key={`nome-${estado?.ok ? estado.nome : 'inicial'}`}
          id="nome"
          name="nome"
          required
          maxLength={120}
          defaultValue={(estado?.ok ? estado.nome : usuario.nome) ?? ''}
        />
      </div>

      <div className="campo">
        <label htmlFor="linkedin">LinkedIn</label>
        <input
          key={`li-${estado?.ok ? estado.linkedin : 'inicial'}`}
          id="linkedin"
          name="linkedin"
          type="text"
          inputMode="url"
          defaultValue={(estado?.ok ? estado.linkedin : usuario.linkedin) ?? ''}
          placeholder="linkedin.com/in/seu-usuario"
        />
        <div className="ajuda">
          Aparece no seu nome na página pública da equipe. Pode colar a URL inteira ou só o seu usuário. Deixe em
          branco para não aparecer.
        </div>
      </div>

      <Botao />
    </form>
  );
}
