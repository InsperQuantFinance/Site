'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// Caminhos absolutos ("/#sobre"): a mesma barra serve à landing e ao /fundo.
// Cinco destinos, não nove: o resto da página se acha rolando. A ação
// principal ("Quero entrar") fica fora da lista, com o mesmo nome do botão do
// hero e da seção de processo seletivo.
const LINKS = [
  { href: '/#sobre', label: 'A liga' },
  { href: '/#research', label: 'Projetos' },
  { href: '/fundo', label: 'Fundo' },
  { href: '/#eventos', label: 'Eventos' },
  { href: '/#empresas', label: 'Empresas' },
];

export default function Header() {
  const [aberta, setAberta] = useState(false);
  const [escondida, setEscondida] = useState(false);
  const ultimoY = useRef(0);

  // A barra é de vidro e flutua: some ao rolar para baixo (o conteúdo ganha a
  // tela inteira) e volta ao primeiro gesto para cima.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setEscondida(y > 320 && y > ultimoY.current + 4);
      if (y < ultimoY.current - 4 || y < 320) setEscondida(false);
      ultimoY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!aberta) return undefined;
    const fechar = (e) => e.key === 'Escape' && setAberta(false);
    window.addEventListener('keydown', fechar);
    return () => window.removeEventListener('keydown', fechar);
  }, [aberta]);

  return (
    <header
      className="topo vidro vidro--pilula vidro--escuro"
      style={{ translate: escondida && !aberta ? '-50% -140%' : undefined }}
    >
      <a href="/#top" className="topo__marca" aria-label="Insper Quantitative Finance, início">
        <Image src="/assets/logo-mark.png" alt="" width={30} height={30} priority />
      </a>

      <nav className="topo__links" aria-label="Seções">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>{l.label}</a>
        ))}
      </nav>

      <div className="topo__acoes">
        {/* Aponta sempre para /membros: o middleware manda para o login quem
            não tem sessão. Checar a sessão aqui tornaria a landing dinâmica. */}
        <Link href="/membros" className="topo__membros">Área de membros</Link>
        <a href="/#ps" className="btn btn--solido btn--pequeno">Quero entrar</a>
        <button
          type="button"
          className="topo__menu"
          aria-expanded={aberta}
          aria-controls="topo-gaveta"
          onClick={() => setAberta((v) => !v)}
        >
          {aberta ? 'Fechar' : 'Menu'}
        </button>
      </div>

      <div id="topo-gaveta" className="topo__gaveta vidro vidro--escuro" data-aberta={aberta ? '' : undefined}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setAberta(false)}>{l.label}</a>
        ))}
        <Link href="/membros" onClick={() => setAberta(false)} style={{ color: 'var(--azul)' }}>Área de membros</Link>
      </div>
    </header>
  );
}
