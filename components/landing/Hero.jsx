import Image from 'next/image';

// Mesh do hero: vermelho e azul-marinho com o mesmo peso, ocupando lados
// opostos e se encontrando no centro. O marinho é escuro de verdade
// (rgb(12,26,78) e abaixo) — azul claro aqui lava a composição.
// As paradas terminam em alpha 0 da MESMA cor: usar `transparent` faria o
// navegador interpolar por preto e sujar a borda de cinza.
const MESH_A =
  'radial-gradient(42% 46% at 84% 60%, rgba(206,24,28,0.95) 0%, rgba(206,24,28,0) 66%),' +
  'radial-gradient(28% 32% at 96% 78%, rgba(150,12,20,0.9) 0%, rgba(150,12,20,0) 64%),' +
  'radial-gradient(34% 38% at 70% 90%, rgba(122,10,26,0.85) 0%, rgba(122,10,26,0) 68%),' +
  'radial-gradient(44% 48% at 14% 44%, rgba(12,26,78,1) 0%, rgba(12,26,78,0) 68%),' +
  'radial-gradient(34% 38% at 4% 86%, rgba(8,18,58,0.95) 0%, rgba(8,18,58,0) 66%),' +
  'radial-gradient(32% 36% at 34% 6%, rgba(16,32,90,0.85) 0%, rgba(16,32,90,0) 68%)';

const MESH_B =
  'radial-gradient(30% 34% at 68% 54%, rgba(206,24,28,0.6) 0%, rgba(206,24,28,0) 70%),' +
  'radial-gradient(30% 34% at 32% 52%, rgba(16,34,96,0.6) 0%, rgba(16,34,96,0) 70%),' +
  'radial-gradient(22% 26% at 54% 78%, rgba(10,22,68,0.5) 0%, rgba(10,22,68,0) 72%),' +
  'radial-gradient(20% 24% at 48% 26%, rgba(150,12,20,0.45) 0%, rgba(150,12,20,0) 72%)';

/** Linha da cota nos fechamentos: um sparkline em SVG, sem biblioteca. */
function Sparkline({ pontos }) {
  const fechamentos = pontos.filter((p) => p.tipo === 'fechamento' && Number.isFinite(p.cota)).slice(-90);
  if (fechamentos.length < 2) return null;
  const W = 132;
  const H = 46;
  const cotas = fechamentos.map((p) => p.cota);
  const min = Math.min(...cotas);
  const max = Math.max(...cotas);
  const faixa = max - min || 1;
  const d = fechamentos
    .map((p, i) => {
      const x = (i / (fechamentos.length - 1)) * W;
      const y = H - 4 - ((p.cota - min) / faixa) * (H - 8);
      return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
  const subiu = cotas[cotas.length - 1] >= cotas[0];
  return (
    <svg className="faixa__spark" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <path d={d} fill="none" stroke={subiu ? '#8FE0B0' : '#F2A3A3'} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const fmtPct = (v) =>
  v == null
    ? '—'
    : `${v >= 0 ? '+' : '−'}${Math.abs(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

const fmtHora = (t) =>
  new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })
    .format(t)
    .replace('.', '');

/**
 * Cartão do fundo na faixa do hero. É a única coisa viva da primeira tela:
 * muda a cada 15 minutos de pregão, então quem volta à home vê um número
 * diferente. Sem dados (VM fora, banco fora), a faixa mostra só os pódios.
 */
function CartaoFundo({ fundo }) {
  const sobe = (fundo.retorno ?? 0) >= 0;
  return (
    <a href="/fundo" className="faixa__fundo">
      <div>
        <p className="faixa__rotulo faixa__vivo">Fundo IQF</p>
        <div className={`faixa__valor ${sobe ? 'faixa__sobe' : 'faixa__desce'}`}>{fmtPct(fundo.retorno)}</div>
      </div>
      <Sparkline pontos={fundo.pontos} />
      <p className="faixa__texto" style={{ gridColumn: '1 / -1' }}>
        Cota desde o início. Hoje {fmtPct(fundo.variacaoDia)}, às {fmtHora(fundo.atualizadoEm)}. Conta de simulação da B3, atualizada a
        cada 15 min no pregão. <span className="faixa__mais">Ver o fundo</span>
      </p>
    </a>
  );
}

export default function Hero({ fundo = null }) {
  return (
    <section id="top" className="hero">
      <div style={{ position: 'absolute', inset: 0, background: 'var(--preto-puro)', overflow: 'hidden' }}>
        <div className="mesh" style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--preto-puro)', backgroundImage: MESH_A }} />
        {/* O blur mora no filho e a rotação no pai, de propósito: desfocar um
            elemento que está sendo transformado obriga o Chrome a refazer o
            borrão a cada quadro. Separados, ele rasteriza uma vez e a órbita
            vira só uma textura girando na GPU. */}
        <div className="mesh-b-orbita">
          <div className="mesh-b" style={{ backgroundImage: MESH_B }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(52% 48% at 50% 40%, rgba(3,3,4,0.82) 0%, rgba(3,3,4,0.3) 58%, transparent 82%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,3,4,0.5) 0%, rgba(3,3,4,0) 30%, rgba(5,5,6,0.1) 76%, rgba(5,5,6,0.85) 100%)' }} />
      </div>

      <div className="hero__conteudo">
        <div
          className="hero-glow"
          style={{
            position: 'absolute',
            left: '50%',
            top: '22%',
            width: 'min(70vw, 560px)',
            aspectRatio: 1,
            transformOrigin: 'center',
            translate: '-50% -50%',
            pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(169,194,209,0.20) 0%, rgba(169,194,209,0.06) 42%, transparent 70%)',
          }}
        />
        {/* O nome da liga é o logo, e o logo é imagem: o alt vira o texto do
            h1, e o buscador lê "Insper Quantitative Finance" como título. */}
        <h1 style={{ margin: 0 }}>
          <Image
            className="hero-logo"
            src="/assets/logo-iqf.png"
            alt="Insper Quantitative Finance"
            width={396}
            height={184}
            priority
            style={{ width: 'min(64vw, 360px)', height: 'auto', display: 'block', margin: '0 auto 30px' }}
          />
        </h1>
        <p className="hero-rise-2 hero-legenda" style={{ margin: '0 0 22px', color: 'rgba(242,242,240,0.78)', textTransform: 'uppercase' }}>
          Liga universitária pioneira em finanças quantitativas no Brasil
        </p>
        <p className="hero__frase hero-rise-2">
          Você aprende a transformar uma ideia sobre o mercado em código, testar no passado e ver a estratégia operar
          todo dia no fundo da liga.
        </p>
        <div className="hero__botoes hero-rise-2">
          <a className="btn btn--solido" href="#ps">Quero entrar</a>
          <a className="btn btn--vazado" href="#research">Ver os projetos</a>
        </div>
      </div>

      <div className="hero__faixa vidro hero-rise-2">
        {fundo ? (
          <CartaoFundo fundo={fundo} />
        ) : (
          <div>
            <p className="faixa__rotulo">Fundo IQF</p>
            <div className="faixa__valor">R$ 1 mi</div>
            <p className="faixa__texto">virtuais operados pelas estratégias dos membros. <a href="/fundo" className="faixa__mais">Ver o fundo</a></p>
          </div>
        )}
        <div>
          <p className="faixa__rotulo">Quantamental Challenge 2024</p>
          <div className="faixa__valor">2º lugar</div>
          <p className="faixa__texto">com o Solaris, na competição da Itaú Asset.</p>
        </div>
        <div>
          <p className="faixa__rotulo">Desafio Quant AI 2025</p>
          <div className="faixa__valor">Semifinal</div>
          <p className="faixa__texto">com o Nexus, alocação por grafos e redes neurais.</p>
        </div>
      </div>
    </section>
  );
}
