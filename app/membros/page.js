import Link from 'next/link';
import { ehGestao, podeVerAreaGeral } from '@/lib/cargos';
import { podeVerProjetos, rotuloPrazo, urgencia } from '@/lib/projetos';
import { exigirUsuario } from '@/lib/auth';
import { criarClienteAdmin, criarClienteServidor } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const FUSO = 'America/Sao_Paulo';
const hojeISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());
const dataLonga = () =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: FUSO }).format(new Date());
const quandoReuniao = (iso) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: FUSO })
    .format(new Date(iso))
    .replaceAll('.', '');

function Atalho({ href, titulo, texto }) {
  return (
    <Link href={href}>
      <div className="atalho__titulo">{titulo}</div>
      <p className="atalho__texto">{texto}</p>
    </Link>
  );
}

function Prazo({ data }) {
  const u = urgencia(data);
  return (
    <span className="agenda__prazo" data-urgente={u === 'atrasado' || u === 'proximo' ? '' : undefined}>
      {rotuloPrazo(data)}
    </span>
  );
}

export default async function PainelMembros() {
  const usuario = await exigirUsuario();
  const gestao = ehGestao(usuario.cargo);
  const areaGeral = podeVerAreaGeral(usuario.cargo);
  const verProjetos = podeVerProjetos(usuario.cargo);
  const supabase = criarClienteServidor();
  const hoje = hojeISO();

  // Tudo em paralelo e cada consulta tolerante a falha: a tela inicial nunca
  // pode cair porque uma tabela secundária não respondeu.
  const vazio = Promise.resolve({ data: [], count: 0 });
  const [tarefas, entregas, reunioes, membros, materiais, projetos, convites] = await Promise.all([
    verProjetos
      ? supabase
          .from('projeto_tarefas')
          .select('id, titulo, prazo, status, projetos ( slug, titulo )')
          .eq('responsavel_id', usuario.id)
          .neq('status', 'feito')
          .order('prazo', { ascending: true, nullsFirst: false })
          .limit(5)
      : vazio,
    supabase.from('entregas').select('id, titulo, data_limite, url').gte('data_limite', hoje).order('data_limite').limit(3),
    verProjetos
      ? supabase
          .from('projeto_reunioes')
          .select('id, titulo, quando, link, projetos ( slug, titulo )')
          .gte('quando', new Date().toISOString())
          .order('quando')
          .limit(3)
      : vazio,
    areaGeral ? supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('ativo', true) : vazio,
    areaGeral ? supabase.from('materiais').select('id', { count: 'exact', head: true }) : vazio,
    areaGeral ? supabase.from('projetos').select('id', { count: 'exact', head: true }).eq('arquivado', false) : vazio,
    gestao
      ? criarClienteAdmin().from('convites').select('id, email, usos, revogado, expira_em').eq('revogado', false)
      : vazio,
  ]);

  const listaTarefas = tarefas.data ?? [];
  const listaEntregas = entregas.data ?? [];
  const listaReunioes = reunioes.data ?? [];
  const agora = Date.now();
  const convitesAbertos = (convites.data ?? []).filter(
    (c) => c.email && c.usos === 0 && (!c.expira_em || new Date(c.expira_em).getTime() > agora),
  ).length;

  const primeiroNome = usuario.nome.split(' ')[0];

  return (
    <div style={{ display: 'grid', gap: 56 }}>
      <div className="saudacao">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14, textTransform: 'none', letterSpacing: '0.02em', fontSize: 14 }}>
            {dataLonga().replace(/^./, (c) => c.toUpperCase())}
          </div>
          <h1>Olá, {primeiroNome}.</h1>
          <p className="p-corpo" style={{ maxWidth: '56ch', margin: 0 }}>
            {!areaGeral
              ? 'Suas próximas entregas do trainee e o material de cada encontro estão aqui.'
              : listaTarefas.length
                ? 'Suas tarefas abertas vêm primeiro, da mais urgente para a mais distante. Depois, reuniões e entregas da liga.'
                : 'Nenhuma tarefa aberta no seu nome. Veja os projetos para pegar a próxima.'}
          </p>
        </div>
      </div>

      <div className="semana">
        {verProjetos ? (
          <section className="painel" aria-labelledby="titulo-tarefas">
            <div className="bloco-titulo">
              <h2 id="titulo-tarefas">Suas tarefas</h2>
              <Link href="/membros/projetos">Ver projetos</Link>
            </div>
            {listaTarefas.length ? (
              <ul className="lista-agenda">
                {listaTarefas.map((t) => (
                  <li key={t.id}>
                    <Link href={t.projetos?.slug ? `/membros/projetos/${t.projetos.slug}` : '/membros/projetos'}>
                      <span className="agenda__titulo">{t.titulo}</span>
                      <Prazo data={t.prazo} />
                      <span className="agenda__meta">{t.projetos?.titulo}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="vazio">Nada pendente com você agora.</p>
            )}
          </section>
        ) : (
          <section className="painel" aria-labelledby="titulo-entregas-t">
            <div className="bloco-titulo">
              <h2 id="titulo-entregas-t">Próximas entregas</h2>
              <Link href="/membros/trainee">Ver todas</Link>
            </div>
            <ListaEntregas entregas={listaEntregas} />
          </section>
        )}

        <div style={{ display: 'grid', gap: 20 }}>
          {verProjetos && (
            <section className="painel" aria-labelledby="titulo-reunioes">
              <div className="bloco-titulo">
                <h2 id="titulo-reunioes">Próximas reuniões</h2>
              </div>
              {listaReunioes.length ? (
                <ul className="lista-agenda">
                  {listaReunioes.map((r) => (
                    <li key={r.id}>
                      <div className="item">
                        <span className="agenda__titulo">{r.titulo}</span>
                        <span className="agenda__prazo">{quandoReuniao(r.quando)}</span>
                        <span className="agenda__meta">
                          {r.projetos?.titulo}
                          {r.link && (
                            <a href={r.link} target="_blank" rel="noopener" style={{ color: 'var(--azul)', display: 'block', marginTop: 6 }}>
                              Entrar na chamada
                            </a>
                          )}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="vazio">Nenhuma reunião marcada.</p>
              )}
            </section>
          )}
          {verProjetos && (
            <section className="painel" aria-labelledby="titulo-entregas">
              <div className="bloco-titulo">
                <h2 id="titulo-entregas">Entregas do trainee</h2>
                <Link href="/membros/trainee">Ver todas</Link>
              </div>
              <ListaEntregas entregas={listaEntregas} />
            </section>
          )}
        </div>
      </div>

      {gestao && (
        <section aria-labelledby="titulo-gestao" style={{ display: 'grid', gap: 18 }}>
          <div className="bloco-titulo">
            <h2 id="titulo-gestao">Gestão da liga</h2>
            <Link href="/membros/gestao/usuarios">Usuários e convites</Link>
          </div>
          <div className="resumo-gestao">
            <div>
              <div className="resumo-gestao__valor">{membros.count ?? 0}</div>
              <div className="resumo-gestao__rotulo">contas ativas</div>
            </div>
            <div>
              <div className="resumo-gestao__valor">{convitesAbertos}</div>
              <div className="resumo-gestao__rotulo">convites esperando cadastro</div>
            </div>
            <div>
              <div className="resumo-gestao__valor">{projetos.count ?? 0}</div>
              <div className="resumo-gestao__rotulo">projetos em aberto</div>
            </div>
            <div>
              <div className="resumo-gestao__valor">{materiais.count ?? 0}</div>
              <div className="resumo-gestao__rotulo">materiais na biblioteca</div>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-atalhos" style={{ display: 'grid', gap: 18 }}>
        <div className="bloco-titulo">
          <h2 id="titulo-atalhos">Ir para</h2>
        </div>
        <div className="atalhos">
          <Atalho href="/membros/trainee" titulo="Trainee" texto="Datas de entrega e o handout de cada encontro." />
          {verProjetos && (
            <Atalho href="/membros/projetos" titulo="Projetos" texto="Tarefas, metas, reuniões e equipe. A vitrine do site se edita dentro de cada projeto." />
          )}
          {areaGeral && (
            <>
              <Atalho href="/membros/materiais" titulo="Materiais" texto="Apostilas, papers, notebooks e links, por tema." />
              <Atalho href="/membros/quadro" titulo="Membros" texto="Quem está na liga, em qual cargo e em qual frente." />
            </>
          )}
          <Atalho href="/membros/conta" titulo="Minha conta" texto="Seus dados e sua senha. Só você altera a senha." />
          {gestao && (
            <Atalho href="/membros/gestao/usuarios" titulo="Usuários e convites" texto="Convide trainees, ajuste cargos e desative quem saiu." />
          )}
        </div>
      </section>
    </div>
  );
}

const diaMes = (d) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`)).replace('.', '');

function ListaEntregas({ entregas }) {
  if (!entregas.length) return <p className="vazio">Nenhuma entrega marcada daqui para frente.</p>;
  return (
    <ul className="lista-agenda">
      {entregas.map((e) => (
        <li key={e.id}>
          <Link href="/membros/trainee">
            <span className="agenda__titulo">{e.titulo}</span>
            <Prazo data={e.data_limite} />
            <span className="agenda__meta">até {diaMes(e.data_limite)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
