import { redirect } from 'next/navigation';
import { CARGOS, ehGestao, ehPresidencia } from '@/lib/cargos';
import { exigirUsuario } from '@/lib/auth';
import { criarClienteAdmin, criarClienteServidor } from '@/lib/supabase/server';
import { emailConfigurado } from '@/lib/email';
import Convidados from './Convidados';
import Convites from './Convites';
import GerenciarUsuarios from './GerenciarUsuarios';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Usuários · IQF' };

export default async function PaginaUsuarios() {
  const ator = await exigirUsuario();
  // O layout já exige login; aqui é a barreira de cargo.
  if (!ehGestao(ator.cargo)) redirect('/membros');

  const supabase = criarClienteServidor();
  const { data: usuarios } = await supabase.from('profiles').select('*').order('nome');

  // Convites exigem o client admin: a tabela é invisível para RLS, porque o
  // token nela é o que dá acesso à criação de contas.
  const { data: convites } = await criarClienteAdmin()
    .from('convites')
    .select('*')
    .order('created_at', { ascending: false });

  // Duas naturezas na mesma tabela: com e-mail = convite pessoal de planilha;
  // sem e-mail = link de turma, que qualquer um com a URL usa.
  const convidados = (convites ?? []).filter((c) => c.email);
  const links = (convites ?? []).filter((c) => !c.email);

  const ordenados = [...(usuarios ?? [])].sort(
    (a, b) =>
      Number(b.ativo) - Number(a.ativo) ||
      (CARGOS[b.cargo]?.nivel ?? 0) - (CARGOS[a.cargo]?.nivel ?? 0) ||
      a.nome.localeCompare(b.nome),
  );

  const agora = Date.now();
  const ativos = ordenados.filter((u) => u.ativo);
  const resumo = [
    [ativos.length, 'contas ativas'],
    [ativos.filter((u) => u.cargo === 'trainee').length, 'trainees'],
    [convidados.filter((c) => !c.revogado && c.usos === 0 && (!c.expira_em || new Date(c.expira_em).getTime() > agora)).length,
      'convites esperando cadastro'],
    [ordenados.length - ativos.length, 'contas desativadas'],
  ];

  return (
    <div style={{ display: 'grid', gap: 48 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Gestão</div>
        <h1 style={{ fontSize: 'clamp(34px, 4vw, 48px)', lineHeight: 1.08, margin: '0 0 12px' }}>Usuários e convites</h1>
        <p className="p-corpo" style={{ margin: 0, maxWidth: '60ch' }}>
          Convide quem entrou na liga, acompanhe quem já criou a conta e ajuste cargos. Só a própria pessoa define e
          troca a senha.
        </p>
      </div>

      <div className="resumo-gestao">
        {resumo.map(([valor, rotulo]) => (
          <div key={rotulo}>
            <div className="resumo-gestao__valor">{valor}</div>
            <div className="resumo-gestao__rotulo">{rotulo}</div>
          </div>
        ))}
      </div>

      {/* A instrução de configurar o servidor só aparece para a presidência.
          O resto da gestão é diretor de área: para eles, "configure GMAIL_USER
          e GMAIL_APP_PASSWORD (veja DEPLOY.md)" é uma frase que nomeia coisas
          que não existem no mundo deles e que ninguém ali vai mexer. O que
          todo mundo precisa saber é que convidar continua funcionando. */}
      {!emailConfigurado() && (
        <div className="aviso aviso--info" style={{ margin: 0 }}>
          O envio automático está desligado, e convidar funciona do mesmo jeito: <strong>Abrir e-mail</strong> abre o
          Gmail com a mensagem pronta e marca o convite como enviado. Você confere e aperta Enviar.
          {ehPresidencia(ator.cargo)
            ? ' Para disparar a turma inteira de uma vez, ligue o envio automático nas configurações do servidor.'
            : ' Para disparar a turma inteira de uma vez, fale com a presidência.'}
        </div>
      )}

      <Convidados convidados={convidados} emailPronto={emailConfigurado()} />

      <Convites convites={links} />

      <section style={{ display: 'grid', gap: 16 }}>
        <h2 style={{ fontSize: 26, margin: 0 }}>Contas</h2>
        <GerenciarUsuarios usuarios={ordenados} ator={{ id: ator.id, cargo: ator.cargo }} />
      </section>
    </div>
  );
}
