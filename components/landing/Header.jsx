'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// O nav segue o padrão das ligas do Insper (InFinance, Insper Asset,
// AgroInsper): Equipe, Alumni, Competições, Eventos, Contato e Processo
// Seletivo como PÁGINAS, não como âncoras da home. São oito itens, a mesma
// ordem de grandeza do nav da InFinance; abaixo de 1180px a barra inteira
// colapsa no menu, então a largura nunca é problema.
//
// "A liga" continua âncora e só aparece na gaveta: é a seção de abertura da
// própria home, e uma página só para ela repetiria o que o visitante acabou
// de ler.
const LINKS = [
  { href: '/equipe', label: 'Equipe' },
  { href: '/alumni', label: 'Alumni' },
  { href: '/#research', label: 'Projetos' },
  { href: '/competicoes', label: 'Competições' },
  { href: '/fundo', label: 'Fundo' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/contato', label: 'Contato' },
  // Mais um destino do site público, com o mesmo peso dos outros. O botão
  // vermelho que ele era antes competia com o CTA de dentro das páginas e
  // dava a impressão de serem coisas diferentes.
  { href: '/processo-seletivo', label: 'Processo seletivo' },
];

export default function Header() {
  const [aberta, setAberta] = useState(false);
  const [solida, setSolida] = useState(true);

  // A barra fica de ponta a ponta e nunca se esconde: ela é a referência fixa
  // de uma página que alterna claro e escuro. O que muda é só o fundo —
  // transparente enquanto o hero está debaixo dela, marinho sólido a partir
  // do primeiro scroll. Página sem hero (/fundo) já começa sólida, senão o
  // nav ficaria por cima do conteúdo sem nada atrás.
  useEffect(() => {
    const temHero = !!document.getElementById('top');
    if (!temHero) return undefined;

    const onScroll = () => setSolida(window.scrollY > 8);
    onScroll();
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
    <header className="topo" data-solida={solida || aberta ? '' : undefined}>
      <div className="topo__interno">
        <a href="/#top" className="topo__marca" aria-label="Insper Quantitative Finance, início">
          <Image src="/assets/logo-mark.png" alt="" width={30} height={30} priority />
        </a>

        <nav className="topo__links" aria-label="Seções">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>

        {/* Do outro lado do fio: "Área de membros" é de quem já está dentro,
            público diferente do resto da barra. */}
        <div className="topo__acoes">
          {/* Aponta sempre para /membros: o middleware manda para o login quem
              não tem sessão. Checar a sessão aqui tornaria a landing dinâmica. */}
          <Link href="/membros" className="topo__membros">Área de membros</Link>
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
      </div>

      <div id="topo-gaveta" className="topo__gaveta" data-aberta={aberta ? '' : undefined}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setAberta(false)}>{l.label}</a>
        ))}
        {/* No celular cabe o nav inteiro: "A liga" é âncora da home e não
            entra na barra por falta de largura. */}
        <a href="/#sobre" onClick={() => setAberta(false)}>A liga</a>
        <Link href="/membros" onClick={() => setAberta(false)} style={{ color: 'var(--azul)' }}>Área de membros</Link>
      </div>
    </header>
  );
}
