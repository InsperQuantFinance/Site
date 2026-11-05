import Image from 'next/image';
import Link from 'next/link';
import { ehGestao, podeVerAreaGeral, rotuloCargo } from '@/lib/cargos';
import { exigirUsuario } from '@/lib/auth';
import BotaoSair from '@/components/membros/BotaoSair';
import NavMembros from '@/components/membros/NavMembros';

export const metadata = { title: 'Área de membros · IQF' };

export default async function LayoutMembros({ children }) {
  // exigirUsuario() cobre os três casos: anônimo vai para o login, sessão
  // órfã ou desativada passa por /sair (que limpa o cookie e evita o laço),
  // e falha do Supabase vira erro visível em vez de TypeError.
  const usuario = await exigirUsuario();

  const gestao = ehGestao(usuario.cargo);

  const iniciais = usuario.nome
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .join('')
    .toUpperCase();

  return (
    <div className="membros-fundo" style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      {/* Uma barra só, de vidro, que acompanha a rolagem: marca e usuário em
          cima, abas embaixo. Antes eram duas faixas opacas que comiam a tela. */}
      <header className="membros-topo">
        <div className="vidro vidro--escuro">
          <div className="membros-topo__linha">
            <Link href="/membros" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Image src="/assets/logo-mark.png" alt="" width={28} height={28} />
              <span className="eyebrow" style={{ color: 'var(--osso)' }}>Área de membros</span>
            </Link>

            <div className="membros-usuario">
              <div style={{ textAlign: 'right', lineHeight: 1.35 }}>
                <div style={{ fontSize: 14 }}>{usuario.nome}</div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--azul)' }}>
                  {rotuloCargo(usuario.cargo)}
                </div>
              </div>
              <Link href="/membros/conta" className="membros-avatar" aria-label="Minha conta">{iniciais}</Link>
              <BotaoSair />
            </div>
          </div>

          <NavMembros gestao={gestao} areaGeral={podeVerAreaGeral(usuario.cargo)} />
        </div>
      </header>

      <main style={{ flex: 1, padding: '56px var(--gutter) 96px' }}>
        <div className="container">{children}</div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--linha)',
          padding: '24px var(--gutter)',
          fontSize: 13,
          color: 'var(--texto-3)',
        }}
      >
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <span>© {new Date().getFullYear()} Liga Insper Quantitative Finance</span>
          <Link href="/">Ver o site público</Link>
        </div>
      </footer>
    </div>
  );
}
