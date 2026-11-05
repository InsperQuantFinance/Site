import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import ListaProjetos from '@/components/landing/ListaProjetos';
import PausarHero from '@/components/landing/PausarHero';
import Revelar from '@/components/landing/Revelar';
import Splash from '@/components/landing/Splash';
import {
  Contato,
  Empresas,
  Eventos,
  OQueE,
  Parceiros,
  ProcessoSeletivo,
  QuantConnect,
  Rodape,
  Sobre,
} from '@/components/landing/Secoes';
import { carregarFundo } from '@/lib/fundo';
import { buscarPostsInstagram } from '@/lib/instagram';
import { criarClienteEstatico } from '@/lib/supabase/server';

// A landing é estática e revalida de hora em hora. Nada aqui pode ler cookies:
// bastaria uma leitura de sessão para o Next tornar a rota dinâmica e passar a
// consultar o Supabase a cada visita anônima. Por isso o link do topo aponta
// sempre para /membros — é o middleware que decide entre a área logada e o login.
// 10 minutos, não uma hora: se o build rodar durante uma queda do Supabase,
// a home sai publicada sem a seção de projetos e só se corrige na próxima
// revalidação. Esse é o teto do prejuízo. O custo é uma consulta a cada 10min.
export const revalidate = 600;

async function carregarProjetos() {
  try {
    const supabase = criarClienteEstatico();
    const { data, error } = await supabase
      .from('projetos')
      .select('*')
      .eq('publicado', true)
      .order('destaque', { ascending: false })
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false })
      // Sem timeout, um Supabase lento (ou pausado) pendura a geração
      // estática até o build do Next estourar. 8s é folga suficiente.
      .abortSignal(AbortSignal.timeout(8000));
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    // Banco fora do ar não pode derrubar a landing inteira: ela renderiza
    // sem a seção de projetos e volta ao normal na próxima revalidação.
    console.warn('[landing] projetos indisponíveis:', e?.message ?? e);
    return [];
  }
}

export default async function Home() {
  // O fundo entra no hero: é o número que muda a cada visita. carregarFundo()
  // já devolve null (e não lança) quando a VM ou o banco estão fora.
  const [projetos, instagram, fundo] = await Promise.all([
    carregarProjetos(),
    buscarPostsInstagram({ limite: 6 }),
    carregarFundo(),
  ]);

  return (
    <>
      {/* Só na landing: na área de membros o splash seria atraso puro sobre uma
          tela que o usuário abre várias vezes por dia. */}
      <noscript>
        <style>{`.splash { display: none; }`}</style>
      </noscript>
      <Splash />

      <Header />
      <Revelar />
      <PausarHero />

      <main>
        <Hero fundo={fundo} />
        <Sobre />
        <OQueE />
        <QuantConnect />
        <Eventos posts={instagram.posts} />

        <section id="research" className="secao secao--carvao">
          <div className="container">
            <div className="eyebrow" style={{ marginBottom: 16 }}>Projetos</div>
            <h2 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '26ch' }}>O que a liga já construiu</h2>
            <p className="p-corpo" style={{ maxWidth: '62ch', margin: '0 0 56px' }}>
              Cada projeto parte de uma tese, vira código, passa por backtest e termina em paper. Muda a origem da
              tese: uma estratégia própria, um paper internacional adaptado ou a mentoria direta de uma gestora.
            </p>
            <ListaProjetos projetos={projetos} />
          </div>
        </section>

        <ProcessoSeletivo />
        <Empresas />
        <Parceiros />
        <Contato />
      </main>

      <Rodape />
    </>
  );
}
