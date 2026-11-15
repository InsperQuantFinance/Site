'use server';

import { revalidatePath } from 'next/cache';
import { usuarioOuNulo } from '@/lib/auth';
import { criarClienteAdmin } from '@/lib/supabase/server';
import { ErroDeRegra, registrarErro } from '@/lib/erros';
import { normalizarLinkedin } from '@/lib/linkedin';

const erro = (mensagem) => ({ ok: false, erro: mensagem });
const sucesso = (mensagem) => ({ ok: true, mensagem });

const texto = (fd, campo) => {
  const v = fd.get(campo);
  const s = typeof v === 'string' ? v.trim() : '';
  return s === '' ? null : s;
};

/**
 * Edição do próprio perfil: nome e LinkedIn.
 *
 * Roda com o client ADMIN de propósito. O trigger proteger_campos_perfil
 * impede que alguém sem cargo de gestão mude o próprio `linkedin` — a regra
 * existe para bloquear quem chama a API REST direto com um token de usuário, e
 * continua valendo para esse caminho. Aqui a checagem de identidade é feita
 * ANTES, no servidor: o update é sempre em `ator.id`, nunca num id que venha
 * do formulário, então não há como editar o perfil de outra pessoa por este
 * caminho mesmo com a chave que ignora RLS.
 *
 * Cargo, área, turma e situação continuam fora: quem define é a gestão.
 */
export async function salvarMeuPerfil(_estadoAnterior, formData) {
  const ator = await usuarioOuNulo();
  if (!ator) return erro('Sessão expirada. Entre novamente.');

  const nome = texto(formData, 'nome');
  if (!nome) return erro('O nome não pode ficar vazio.');
  if (nome.length > 120) return erro('Nome muito longo.');

  let linkedin;
  try {
    linkedin = normalizarLinkedin(texto(formData, 'linkedin'));
  } catch (e) {
    if (e instanceof ErroDeRegra) return erro(e.message);
    throw e;
  }

  const { error } = await criarClienteAdmin()
    .from('profiles')
    .update({ nome, linkedin })
    .eq('id', ator.id);

  if (error) return erro(registrarErro('conta: salvar perfil', error, { acao: 'salvar' }));

  // A /equipe é estática e lê estes campos: sem isto o nome novo só apareceria
  // na próxima revalidação de 10 minutos.
  revalidatePath('/membros/conta');
  revalidatePath('/membros/quadro');
  revalidatePath('/equipe');
  revalidatePath('/alumni');

  // Devolve os valores GRAVADOS, não os digitados: o normalizador tira
  // rastreador e barra final, e sem isto o campo continuaria exibindo o texto
  // sujo que a pessoa colou — ela sairia achando que foi isso que ficou salvo.
  return { ...sucesso(linkedin ? 'Perfil atualizado.' : 'Perfil atualizado. LinkedIn removido.'), nome, linkedin };
}
