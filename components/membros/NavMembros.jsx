'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const LINKS_BASE = [
  { href: '/membros', label: 'Início' },
  { href: '/membros/trainee', label: 'Trainee' },
  { href: '/membros/projetos', label: 'Projetos', geral: true },
  { href: '/membros/quadro', label: 'Membros', geral: true },
  { href: '/membros/materiais', label: 'Materiais', geral: true },
  { href: '/membros/conta', label: 'Minha conta' },
];

// Projetos não está aqui: a aba "Projetos" é de todo membro efetivado, e
// dentro dela o que é restrito (vitrine, equipe) aparece conforme o cargo.
const LINKS_GESTAO = [
  { href: '/membros/gestao/usuarios', label: 'Usuários e convites' },
];

export default function NavMembros({ gestao, areaGeral = true }) {
  const pathname = usePathname();
  const base = areaGeral ? LINKS_BASE : LINKS_BASE.filter((l) => !l.geral);
  const links = gestao ? [...base, ...LINKS_GESTAO.map((l) => ({ ...l, gestao: true }))] : base;

  // A barra rola de lado em tela estreita. A borda que ainda esconde abas
  // some num degradê (mask), que é o aviso de que a lista continua.
  const trilho = useRef(null);
  const [borda, setBorda] = useState({ esquerda: false, direita: false });

  useEffect(() => {
    const el = trilho.current;
    if (!el) return undefined;
    const medir = () => {
      // 1px de folga: o scroll fracionário de telas com zoom nunca fecha a conta.
      const fim = el.scrollWidth - el.clientWidth - el.scrollLeft;
      setBorda({ esquerda: el.scrollLeft > 1, direita: fim > 1 });
    };
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      observador.disconnect();
    };
  }, [links.length]);

  const mascara = `linear-gradient(to right, ${borda.esquerda ? 'transparent 0, #000 32px' : '#000 0'}, ${
    borda.direita ? '#000 calc(100% - 32px), transparent 100%' : '#000 100%'
  })`;

  return (
    <nav aria-label="Área de membros">
      <div ref={trilho} className="abas" style={{ maskImage: mascara, WebkitMaskImage: mascara }}>
        {links.map((l) => {
          // "/membros" só fica ativo na própria raiz; os demais casam por prefixo.
          const ativo = l.href === '/membros' ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={ativo ? 'page' : undefined}
              data-gestao={l.gestao ? '' : undefined}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
