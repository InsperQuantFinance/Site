'use client';

import { useEffect } from 'react';

/**
 * Desliga as animações contínuas da página enquanto elas estão fora da tela.
 *
 * Duas delas rodam com `infinite`: o mesh do hero e a esteira de parceiros.
 * Sem isto as duas continuam custando quadros depois que você rolou para
 * longe — e é exatamente aí que o navegador precisa de fôlego para rolar
 * liso. O Chrome até tenta estrangular animações fora da viewport sozinho,
 * mas não com camadas promovidas por `will-change`, que é o caso das duas.
 *
 * O hero marca o <body> (`.hero-fora-da-tela`) porque o CSS que ela controla
 * está espalhado por vários filhos; a esteira marca a si mesma (`data-fora`),
 * que é mais direto e evita uma segunda classe global.
 */
export default function PausarHero() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;

    const observadores = [];

    const hero = document.getElementById('top');
    if (hero) {
      const io = new IntersectionObserver(
        ([entrada]) => {
          document.body.classList.toggle('hero-fora-da-tela', !entrada.isIntersecting);
        },
        // Uma fatia de 10% já basta para considerar o hero "em cena": pausar
        // quando ainda há um pedaço visível faria a órbita travar à vista.
        { threshold: 0.1 },
      );
      io.observe(hero);
      observadores.push(io);
    }

    // Uma esteira só hoje (parceiros), mas o seletor é plural porque o custo
    // de observar N é o mesmo e evita voltar aqui quando aparecer outra.
    const esteiras = document.querySelectorAll('.marquee');
    if (esteiras.length) {
      const io = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => {
            e.target.toggleAttribute('data-fora', !e.isIntersecting);
          });
        },
        { threshold: 0 },
      );
      esteiras.forEach((el) => io.observe(el));
      observadores.push(io);
    }

    return () => {
      observadores.forEach((io) => io.disconnect());
      document.body.classList.remove('hero-fora-da-tela');
    };
  }, []);

  return null;
}
