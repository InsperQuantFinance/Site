import Image from 'next/image';
import FormularioContato from '@/components/landing/FormularioContato';

/* ============================================================ A liga */
export function Sobre() {
  // Só fatos que a página prova em outro lugar: cada número aponta para um
  // projeto, um evento ou o fundo, todos mais abaixo.
  const marcas = [
    ['2º lugar', 'no Quantamental Challenge 2024, da Itaú Asset, com o Solaris.'],
    ['Semifinal', 'no Desafio Quant AI 2025, também da Itaú Asset, com o Nexus.'],
    ['4 ligas', 'organizam juntas o Quant Connect: Insper, Poli-USP, FEA-USP e FGV.'],
    ['R$ 1 mi', 'virtuais no fundo da liga, operados todo pregão pelas estratégias dos membros.'],
  ];

  return (
    <section id="sobre" className="secao">
      <div className="container">
        <div className="duas-colunas" style={{ alignItems: 'end' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>A liga</div>
            <h2 className="h-secao" style={{ margin: 0, maxWidth: '24ch', textWrap: 'balance' }}>
              Projeto de verdade desde o primeiro semestre
            </h2>
          </div>
          <div>
            <p className="p-corpo" style={{ margin: '0 0 16px', maxWidth: '54ch' }}>
              O IQF forma quants com projetos próprios, competições e contato direto com gestoras. A meta é ser a
              referência em finanças quantitativas entre as entidades estudantis do Brasil e o caminho natural do aluno
              do Insper para o mercado sistemático.
            </p>
            <p style={{ margin: 0, fontSize: 15, color: 'var(--texto-3)' }}>
              Valores: rigor técnico, colaboração, meritocracia e excelência.
            </p>
          </div>
        </div>

        <div className="marcas">
          {marcas.map(([valor, texto]) => (
            <div key={valor} data-reveal>
              <div className="marcas__valor">{valor}</div>
              <p className="marcas__texto">{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================ O que são finanças quant */
export function OQueE() {
  const etapas = [
    ['Hipótese', 'Uma ideia que dá para verificar. Por exemplo: empresas lucrativas e pouco endividadas aguentam melhor os períodos ruins.'],
    ['Regra', 'A ideia vira filtro objetivo: entre as ações mais negociadas, comprar as 20% melhores nesses critérios e revisar a cada trimestre.'],
    ['Backtest', 'A regra roda sobre os dados reais do passado, com custos de operação, e mostra retorno, risco e onde a estratégia quebra.'],
    ['Crítica', 'O resultado é discutido por escrito: o que funcionou, o que foi sorte e o que muda. É aqui que se aprende mais.'],
  ];

  const pilares = [
    ['Finanças', 'O que move preços, o que é risco e por que uma estratégia deveria funcionar.'],
    ['Estatística', 'Separar padrão de ruído e medir se o resultado se sustenta fora da amostra.'],
    ['Programação', 'Transformar a regra em código que trata dados, simula o passado e decide sozinho.'],
  ];

  return (
    <section
      id="o-que-e"
      className="secao"
      style={{
        backgroundColor: 'var(--carvao)',
        backgroundImage: 'radial-gradient(52% 64% at 88% 8%, rgba(20,70,150,0.10) 0%, rgba(20,70,150,0) 72%)',
      }}
    >
      <div className="container">
        <div className="duas-colunas" style={{ alignItems: 'start', marginBottom: 56 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Finanças quantitativas</div>
            <h2 className="h-secao" style={{ margin: 0, maxWidth: '24ch', textWrap: 'balance' }}>
              Regras que se testam antes de valer dinheiro
            </h2>
          </div>
          <div>
            <p className="p-corpo" style={{ margin: '0 0 18px', maxWidth: '56ch' }}>
              Na forma tradicional, um analista estuda uma empresa, forma uma tese e decide. Em finanças quantitativas,
              essa decisão vira uma regra escrita em código e aplicada do mesmo jeito a centenas de ativos.
            </p>
            <p className="p-corpo" style={{ margin: 0, maxWidth: '56ch' }}>
              A vantagem não é adivinhar o futuro. É poder medir: rodar a regra sobre vinte anos de mercado e ver quanto
              teria rendido, quanto teria perdido nas piores quedas e se o resultado é consistente ou só sorte.
            </p>
          </div>
        </div>

        <ol className="ciclo">
          {etapas.map(([titulo, texto]) => (
            <li key={titulo} data-reveal>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </li>
          ))}
        </ol>

        <div
          className="duas-colunas"
          style={{ marginTop: 72, paddingTop: 44, borderTop: '1px solid var(--linha-forte)', alignItems: 'start' }}
        >
          <div>
            <h3 style={{ fontSize: 26, lineHeight: 1.25, margin: '0 0 14px' }}>Você não precisa chegar sabendo programar</h3>
            <p style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--texto-2)', margin: 0, maxWidth: '54ch' }}>
              Todo membro passa por esse ciclo no trainee: aulas de fundamentos, uma estratégia autoral em grupo, o
              backtest em Python e um paper com a análise. Depois vêm os projetos maiores: adaptação de papers
              internacionais, competições nacionais e projetos mentorados por gestoras.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            {pilares.map(([rotulo, texto]) => (
              <div key={rotulo} className="linha-rotulo">
                <h3 className="eyebrow" style={{ color: 'rgba(169,194,209,0.9)' }}>{rotulo}</h3>
                <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--texto-2)' }}>{texto}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==================================================== Quant Connect */
export function QuantConnect() {
  const fatos = [
    ['Organização', 'Ligas quant de Insper, Poli-USP, FEA-USP e FGV'],
    ['Formato', 'Dois dias de palestras, painéis e workshops'],
    ['Local', 'Auditórios do Insper e da Poli-USP'],
    ['Próxima edição', 'Datas a confirmar'],
  ];

  return (
    <section id="quant-connect" className="secao">
      <div className="container">
        <div className="duas-colunas" style={{ alignItems: 'center' }}>
          <div className="photo" style={{ aspectRatio: '4 / 3' }}>
            <Image src="/assets/foto-quant-connect.jpg" alt="Quant Connect" fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <h2 className="h-secao" style={{ fontSize: 46, lineHeight: 1.1, margin: '0 0 24px' }}>Quant Connect</h2>
            <p className="p-corpo" style={{ margin: '0 0 20px', maxWidth: '56ch' }}>
              O maior encontro de finanças quantitativas entre estudantes do país, organizado pelas ligas quant do
              Insper, da Poli-USP, da FEA-USP e da FGV, nos auditórios das próprias escolas.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--texto-2)', margin: '0 0 32px', maxWidth: '56ch' }}>
              São dois dias de palestras de gestoras e mesas proprietárias, painéis com quants em atividade, workshops
              técnicos e recrutamento. A segunda edição foi em maio de 2026, no Insper e na Poli-USP.
            </p>
            <a
              className="btn btn--vazado"
              href="https://www.linkedin.com/company/quantconnectevento/"
              target="_blank"
              rel="noopener"
            >
              Acompanhar no LinkedIn
            </a>
          </div>
        </div>

        <div className="grade-hairline grade-4" style={{ marginTop: 64 }}>
          {fatos.map(([rotulo, valor], i) => (
            <div key={rotulo} style={{ padding: '28px 26px' }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>{rotulo}</div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 18,
                  lineHeight: 1.4,
                  color: i === 3 ? 'rgba(169,194,209,0.85)' : undefined,
                }}
              >
                {valor}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================== Eventos */
const EVENTOS = [
  {
    tag: '2026 · Vault Capital',
    titulo: 'Kick off do Challenge Vault Quant',
    paragrafos: [
      'A Vault Capital recebeu em seu escritório as ligas IQF, FEA.dev e FGV Quant para a abertura do challenge. O encontro começou com a apresentação institucional da consultoria, da fundação à operação atual.',
      'Em seguida, Bruno Drezza, head de quant da casa, apresentou o formato do desafio e os critérios de avaliação das estratégias, detalhando o que uma mesa considera relevante na construção e na validação de um modelo. O encerramento foi uma conversa aberta com o time sobre a rotina de pesquisa e execução.',
    ],
    fotos: [
      { src: '/assets/foto-vault-iqf.jpg', alt: 'Membros do IQF no escritório da Vault Capital' },
      { src: '/assets/foto-vault-ligas.jpg', alt: 'As três ligas na mesa da Vault Capital' },
    ],
    proporcao: '16 / 9',
    textoPrimeiro: true,
  },
  {
    tag: '2026 · Insper e Poli-USP',
    titulo: 'Quant Connect · 2ª edição',
    paragrafos: [
      'Maior encontro de finanças quantitativas entre estudantes no país, co-organizado pelo IQF com FEA.dev, Poli Quant e FGV Quant. Dois dias de palestras de gestoras e mesas proprietárias, painéis com quants em atividade e apresentações das próprias ligas.',
    ],
    fotos: [{ src: '/assets/foto-qc-auditorio.jpg', alt: 'Quant Connect no auditório do Insper' }],
    proporcao: '3 / 2',
    textoPrimeiro: false,
  },
  {
    tag: '2025 e 2026 · Itaú Asset',
    titulo: 'Desafio Quant AI',
    paragrafos: [
      'Competição nacional em que equipes constroem estratégias de investimento com uso intensivo de IA. A liga foi semifinalista na edição de 2025 com o Nexus, e a edição 2026 foi lançada no palco do Quant Connect.',
    ],
    fotos: [{ src: '/assets/foto-quant-ai.jpg', alt: 'Abertura do Desafio Quant AI' }],
    proporcao: '3 / 2',
    textoPrimeiro: true,
  },
  {
    tag: '2026 · Giant Steps Capital',
    titulo: 'Painéis dentro das gestoras',
    paragrafos: [
      'Parte da programação acontece na mesa das casas parceiras: conversa aberta com gestores sobre pesquisa, execução e carreira, com espaço para recrutamento ao final.',
    ],
    fotos: [{ src: '/assets/foto-giant-steps.jpg', alt: 'Painel na Giant Steps Capital' }],
    proporcao: '3 / 2',
    textoPrimeiro: false,
  },
  {
    tag: 'Todo semestre · Insper',
    titulo: 'Treinamentos internos',
    paragrafos: [
      'Os próprios membros ensinam: fundamentos de factor investing, índices e ETFs, e as ferramentas que a liga desenvolve, como o dashboard de análise de carteira usado nos projetos.',
    ],
    fotos: [{ src: '/assets/foto-treinamento.jpg', alt: 'Treinamento interno da liga' }],
    proporcao: '3 / 2',
    textoPrimeiro: true,
  },
];

const fmtData = (iso) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
};

/**
 * Quebra a legenda em título + corpo. Post do Instagram não tem campo de
 * título: a convenção aqui é que a primeira frase serve de manchete.
 * Devolve titulo: null quando não há legenda, para o card usar outro arranjo.
 */
/** Linha formada só por hashtags e menções — comum no fim das legendas. */
const soTags = (linha) => linha.split(/\s+/).every((t) => /^[#@]/.test(t));

/** Corta no último espaço antes do limite, para não partir palavra ao meio. */
function cortar(texto, max) {
  if (texto.length <= max) return texto;
  const fatia = texto.slice(0, max);
  const espaco = fatia.lastIndexOf(' ');
  return (espaco > max * 0.6 ? fatia.slice(0, espaco) : fatia).trimEnd();
}

function lerLegenda(post) {
  const linhas = (post.legenda || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !soTags(l));

  if (!linhas.length) return { titulo: null, corpo: null };

  const bruto = linhas[0];
  const corte = bruto.search(/[.!?—]/);
  const titulo = corte > 12 && corte < 80 ? bruto.slice(0, corte) : cortar(bruto, 80);

  const resto = [bruto.slice(titulo.length).replace(/^[.!?—\s]+/, ''), ...linhas.slice(1)]
    .filter(Boolean)
    .join(' ')
    // Tira hashtags soltas no meio do corpo: viram ruído fora do Instagram.
    .replace(/(^|\s)[#@][\w.]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  const corpo = resto.length > 180 ? `${cortar(resto, 177)}…` : resto;
  return { titulo, corpo: corpo || null };
}

function CartaoPost({ post }) {
  const { titulo, corpo } = lerLegenda(post);
  const data = fmtData(post.data);

  return (
    <a href={post.permalink} target="_blank" rel="noopener" className="cartao-post">
      <div className="photo" style={{ aspectRatio: '1 / 1', border: 'none' }}>
        {/* Sem otimização: a URL do CDN da Meta expira e o cache do Next
            acabaria servindo um link morto. */}
        <Image src={post.imagem} alt={titulo || `Publicação da liga em ${data}`} fill
               sizes="(max-width: 900px) 100vw, 33vw" unoptimized />
      </div>

      <div className="cartao-post__corpo">
        <div className="eyebrow" style={{ letterSpacing: '0.18em' }}>
          {[data, post.tipo === 'VIDEO' ? 'Vídeo' : null].filter(Boolean).join(' · ')}
        </div>

        {/* Sem legenda, a data sobe para manchete em vez de deixar um buraco. */}
        {titulo ? (
          <>
            <h3 style={{ fontSize: 21, lineHeight: 1.3 }}>{titulo}</h3>
            {corpo && <p className="cartao-post__texto">{corpo}</p>}
          </>
        ) : (
          <h3 style={{ fontSize: 21, lineHeight: 1.3 }}>
            {post.tipo === 'VIDEO' ? 'Vídeo da liga' : 'Registro da liga'}
          </h3>
        )}

        <span className="cartao-post__link eyebrow" style={{ letterSpacing: '0.18em' }}>
          Ver no Instagram →
        </span>
      </div>
    </a>
  );
}

export function Eventos({ posts = [] }) {
  const doInstagram = posts.length > 0;

  return (
    <section id="eventos" className="secao secao--carvao">
      <div className="container">
        <div className="eyebrow" style={{ marginBottom: 16 }}>Últimos eventos</div>
        <div className="cabecalho-ultimas">
          <h2 className="h-secao" style={{ margin: 0 }}>A liga em atividade</h2>
          {doInstagram && (
            <a className="btn btn--vazado" href="https://www.instagram.com/insperqf/" target="_blank" rel="noopener">
              Seguir @insperqf
            </a>
          )}
        </div>

        {doInstagram ? (
          <div className="grade-posts">
            {posts.slice(0, 3).map((post) => <CartaoPost key={post.id} post={post} />)}
          </div>
        ) : (
          // Instagram indisponível (sem token, token expirado e cache vazio):
          // os eventos escritos à mão seguram a seção.
          EVENTOS.map((ev, i) => {
            const texto = (
              <div>
                <div className="eyebrow" style={{ color: 'rgba(169,194,209,0.9)', marginBottom: 14 }}>{ev.tag}</div>
                <h3 style={{ fontSize: 32, lineHeight: 1.2, margin: '0 0 18px' }}>{ev.titulo}</h3>
                {ev.paragrafos.map((p, j) => (
                  <p
                    key={j}
                    style={{
                      margin: j === ev.paragrafos.length - 1 ? 0 : '0 0 16px',
                      fontSize: 16,
                      lineHeight: 1.7,
                      color: j === 0 ? 'var(--texto-2)' : 'var(--texto-3)',
                      maxWidth: '52ch',
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            );

            const midia = (
              <div style={{ display: 'grid', gap: 14 }}>
                {ev.fotos.map((f) => (
                  <div key={f.src} className="photo" style={{ aspectRatio: ev.proporcao }}>
                    <Image src={f.src} alt={f.alt} fill sizes="(max-width: 900px) 100vw, 50vw" />
                  </div>
                ))}
              </div>
            );

            return (
              <div
                key={ev.titulo}
                className="duas-colunas"
                style={{ alignItems: 'center', marginBottom: i === EVENTOS.length - 1 ? 0 : 72 }}
              >
                {ev.textoPrimeiro ? texto : midia}
                {ev.textoPrimeiro ? midia : texto}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

/* ============================================== Processo seletivo */
const LINK_INSCRICAO =
  'https://docs.google.com/forms/d/e/1FAIpQLScrwUvYpostcTPRLIXiZNyGCVsqQY2O-bPJwliCM5sOzQUtuA/viewform';

export function ProcessoSeletivo() {
  const faq = [
    ['Preciso saber programar?', 'Não. O trainee começa pelos fundamentos, e a parte técnica se constrói ao longo do processo, com mentoria dos membros mais experientes.'],
    ['Quais cursos podem se inscrever?', 'Todos os cursos do Insper. O que conta é interesse por mercado e disposição para estudo técnico.'],
    ['Quanto tempo leva por semana?', 'As reuniões da sua frente de trabalho, mais o estudo individual e o projeto do semestre.'],
    ['Como é a seleção?', 'Você se inscreve pelo formulário e passa pelas etapas de avaliação e entrevista, divulgadas a cada edição.'],
  ];

  return (
    <section id="ps" className="secao secao--mesh">
      <div className="container duas-colunas" style={{ alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Processo seletivo</div>
          <h2 className="h-secao" style={{ margin: '0 0 22px' }}>Faça parte da liga</h2>
          <p className="p-corpo" style={{ maxWidth: '50ch', margin: '0 0 32px' }}>
            Aberto a alunos do Insper de todos os cursos. Você entra pelo trainee, sai com uma estratégia própria
            testada e um paper escrito, e segue para os projetos com gestoras.
          </p>
          <a className="btn btn--solido" href={LINK_INSCRICAO} target="_blank" rel="noopener">
            Quero entrar
          </a>
        </div>

        <div className="faq" style={{ borderTop: '1px solid rgba(242,242,240,0.14)' }}>
          {faq.map(([pergunta, resposta], i) => (
            <details key={pergunta} open={i === 0}>
              <summary>{pergunta}</summary>
              <p>{resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================== Empresas */
export function Empresas() {
  const caminhos = [
    ['Mentoria de projetos', 'Sua equipe propõe a tese e acompanha o desenvolvimento durante o semestre, como a Lev e a Vault Capital já fizeram.'],
    ['Recrutamento', 'Acesso a alunos com prática em modelagem, backtest e pesquisa aplicada, com o portfólio de cada projeto à vista.'],
    ['Palestras e workshops', 'Profissionais da casa apresentam para os membros e, nos eventos abertos, para o público de várias escolas.'],
    ['Visitas ao escritório', 'Um grupo de membros conhece a operação de perto, conversa com o time e vê o dia a dia da mesa.'],
    ['Patrocínio do Quant Connect', 'Presença de marca no encontro das ligas quant de Insper, Poli-USP, FEA-USP e FGV.'],
  ];

  return (
    <section
      id="empresas"
      className="secao secao--carvao"
      style={{ backgroundImage: 'radial-gradient(50% 70% at 4% 92%, rgba(22,42,118,0.12) 0%, rgba(22,42,118,0) 72%)' }}
    >
      <div className="container duas-colunas" style={{ alignItems: 'start' }}>
        <div className="fixo-desktop">
          <div className="eyebrow" style={{ marginBottom: 16 }}>Para empresas</div>
          <h2 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '20ch', textWrap: 'balance' }}>Cinco formas de trabalhar com a liga</h2>
          <p className="p-corpo" style={{ maxWidth: '44ch', margin: '0 0 32px' }}>
            Gestoras, mesas proprietárias e fintechs chegam até os membros por um destes caminhos. Você escolhe um ou
            combina vários.
          </p>
          <a className="btn btn--vazado" href="#contato">Falar com a diretoria</a>
        </div>

        <div className="caminhos">
          {caminhos.map(([titulo, texto]) => (
            <div key={titulo} data-reveal>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================================================== Parceiros */
const PARCEIROS = [
  ['/assets/parceiro-xp.png', 'XP Inc.'],
  ['/assets/parceiro-jpmorgan.png', 'J.P. Morgan'],
  ['/assets/parceiro-goldman.png', 'Goldman Sachs'],
  ['/assets/parceiro-b3.png', 'B3'],
  ['/assets/parceiro-giantsteps.png', 'Giant Steps Capital'],
  ['/assets/parceiro-schonfeld.png', 'Schonfeld'],
  ['/assets/parceiro-bayes.png', 'Bayes Capital'],
  ['/assets/parceiro-avantgarde.png', 'Avantgarde Wealth Management'],
  ['/assets/parceiro-lev.png', 'Lev'],
  ['/assets/parceiro-extra.png', 'Parceiro'],
  ['/assets/parceiro-tradingview.png', 'TradingView'],
];

export function Parceiros() {
  const fila = (ocultar) => (
    <div className="marquee-row" aria-hidden={ocultar || undefined}>
      {PARCEIROS.map(([src, alt]) => (
        <div key={src} className="parceiro-card">
          <Image src={src} alt={alt} width={180} height={80} style={{ width: '100%', maxWidth: 180, height: 'auto' }} />
        </div>
      ))}
    </div>
  );

  return (
    <section id="parceiros" className="secao secao--carvao" style={{ padding: '100px 0' }}>
      <div className="container" style={{ margin: '0 auto 44px', padding: '0 var(--gutter)' }}>
        <h2 className="eyebrow">Quem já esteve com a liga</h2>
      </div>
      <div className="marquee">
        {fila(false)}
        {fila(true)}
      </div>
    </section>
  );
}

/* ========================================================= Contato */
export function Contato() {
  const canais = [
    ['E-mail', 'insperqf@gmail.com', 'mailto:insperqf@gmail.com'],
    ['LinkedIn', 'Insper Quantitative Finance Club', 'https://www.linkedin.com/company/insper-quantitative-finance-club/'],
    ['Instagram', '@insperqf', 'https://www.instagram.com/insperqf/'],
  ];

  return (
    <section id="contato" className="secao secao--mesh secao--mesh-azul" style={{ padding: '120px var(--gutter) 96px', borderBottom: 'none' }}>
      <div className="container duas-colunas duas-colunas--estreita" style={{ alignItems: 'start' }}>
        <div className="painel" style={{ padding: '36px 34px' }}>
          <h2 className="h-secao" style={{ margin: '0 0 16px' }}>Fale com a liga</h2>
          <p className="p-corpo" style={{ maxWidth: '52ch', margin: 0 }}>
            Dúvidas sobre o processo seletivo, vagas para divulgar, patrocínio ou uma palestra para propor. A diretoria
            responde por e-mail.
          </p>
          <div style={{ marginTop: 32 }}>
            <FormularioContato />
          </div>
        </div>
        <div className="grade-hairline">
          {canais.map(([rotulo, texto, href]) => (
            <div key={rotulo} style={{ padding: '24px 28px' }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>{rotulo}</div>
              <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener"
                 style={{ fontFamily: 'var(--serif)', fontSize: 19 }}>
                {texto}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========================================================== Rodapé */
export function Rodape() {
  return (
    <footer style={{ padding: '64px var(--gutter) 40px', borderTop: '1px solid var(--linha)', background: 'var(--carvao)' }}>
      <div className="container rodape-grade">
        <Image src="/assets/logo-iqf.png" alt="Liga Insper Quantitative Finance" width={230} height={107}
               style={{ width: '100%', maxWidth: 190, height: 'auto' }} />
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Endereço</div>
          <div style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--texto-2)' }}>
            Insper, Rua Quatá, 300<br />Vila Olímpia, São Paulo, SP
          </div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Contato</div>
          <div style={{ fontSize: 15, lineHeight: 1.9, color: 'var(--texto-2)', display: 'grid', justifyItems: 'start' }}>
            <a href="mailto:insperqf@gmail.com">insperqf@gmail.com</a>
            <a href="https://www.instagram.com/insperqf/" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.linkedin.com/company/insper-quantitative-finance-club/" target="_blank" rel="noopener">LinkedIn</a>
            <a href="/membros">Área de membros</a>
          </div>
        </div>
      </div>
      <div
        className="container"
        style={{
          paddingTop: 28,
          marginTop: 44,
          borderTop: '1px solid var(--linha)',
          fontSize: 13,
          color: 'var(--texto-3)',
        }}
      >
        © {new Date().getFullYear()} Liga Insper Quantitative Finance
      </div>
    </footer>
  );
}
