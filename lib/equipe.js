import 'server-only';

import { CARGOS, ehGestao } from '@/lib/cargos';
import { criarClienteAdmin } from '@/lib/supabase/server';

/**
 * Quadro público da liga, para /equipe e /alumni.
 *
 * Lê `profiles` com o client ADMIN, e não com o anônimo, por um motivo
 * específico: a policy de RLS de `profiles` só libera `authenticated`, e abrir
 * a tabela para `anon` exporia o e-mail de todo membro — policy filtra LINHA,
 * nunca COLUNA. Dava para contornar com uma view sem a coluna de e-mail, mas
 * isso exige DDL no banco, e aqui não é preciso: estas páginas são estáticas,
 * então a consulta roda no servidor (build e revalidação), a chave nunca chega
 * ao navegador, e o `select` abaixo simplesmente não pede o e-mail.
 *
 * O `import 'server-only'` no topo é a trava: se um componente client importar
 * este módulo, o build quebra apontando o arquivo, em vez de embarcar a chave.
 *
 * Devolve [] — nunca lança — em qualquer falha. Um Supabase fora do ar não
 * pode derrubar o build inteiro, do mesmo jeito que já acontece com os
 * projetos na home.
 */
async function carregar({ ativo }) {
  try {
    const supabase = criarClienteAdmin();
    const { data, error } = await supabase
      .from('profiles')
      // Sem `email`, de propósito: é a coluna que não pode virar página.
      .select('id, nome, cargo, area, turma, linkedin, foto_url, bio')
      .eq('ativo', ativo)
      .order('nome')
      // Sem timeout um Supabase lento pendura a geração estática até o build
      // estourar. Mesmo teto usado em carregarProjetos().
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.warn('[equipe] quadro indisponível:', e?.message ?? e);
    return [];
  }
}

/**
 * Quadro ativo para a página pública, SEM trainees.
 *
 * O trainee está em avaliação e troca a cada semestre: as páginas de equipe
 * das outras ligas do Insper mostram diretoria e membros efetivos, e é essa a
 * leitura útil para quem chega de fora. O quadro completo, com trainees,
 * continua na área de membros (/membros/quadro).
 */
export async function carregarEquipe() {
  const membros = await carregar({ ativo: true });
  return membros
    .filter((m) => m.cargo !== 'trainee')
    .sort(
      (a, b) => (CARGOS[b.cargo]?.nivel ?? 0) - (CARGOS[a.cargo]?.nivel ?? 0) || a.nome.localeCompare(b.nome, 'pt-BR'),
    );
}

/**
 * Ex-membros. Ordena por turma decrescente: quem saiu há menos tempo primeiro,
 * que é a ordem útil para quem está vendo onde a liga coloca gente.
 * `turma` é texto livre ("2026.1"), então a comparação é de string mesmo.
 */
export async function carregarAlumni() {
  const alumni = await carregar({ ativo: false });
  return [...alumni].sort(
    (a, b) => (b.turma ?? '').localeCompare(a.turma ?? '') || a.nome.localeCompare(b.nome, 'pt-BR'),
  );
}

/**
 * Dois blocos, no molde das outras ligas: "Diretoria" e "Membros".
 *
 * Um bloco por CARGO daria quatro títulos com uma pessoa embaixo de cada
 * (presidente, vice, diretor...) — o cargo de cada um já aparece no próprio
 * cartão, então o título repetiria a informação e picotaria a página.
 */
export function agruparEquipe(membros) {
  const ehDiretoria = (m) => ehGestao(m.cargo);
  const blocos = [
    { chave: 'diretoria', label: 'Diretoria', pessoas: membros.filter(ehDiretoria) },
    { chave: 'membros', label: 'Membros', pessoas: membros.filter((m) => !ehDiretoria(m)) },
  ];
  return blocos.filter((b) => b.pessoas.length > 0);
}

/** Rótulo do cargo para o cartão ("Presidente", "Diretor de Projetos"...). */
export const rotuloDoCargo = (cargo) => CARGOS[cargo]?.label ?? cargo;
