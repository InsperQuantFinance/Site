/**
 * Conteúdo editorial da liga, numa fonte só.
 *
 * Antes isto morava solto dentro de components/landing/Secoes.jsx, que era o
 * único lugar que consumia. Com as páginas próprias (/competicoes, /eventos,
 * /processo-seletivo, /contato) o mesmo texto passou a ser lido de dois
 * lugares — a home mostra o resumo, a página mostra tudo — e duas cópias de
 * uma lista de resultados é exatamente o tipo de coisa que desencontra na
 * primeira atualização.
 *
 * Nada aqui é dado de banco: são fatos escritos à mão que mudam uma ou duas
 * vezes por semestre. Projetos (vitrine), membros e o fundo vêm do Supabase.
 */

import fotoVaultIqf from '@/public/assets/foto-vault-iqf.jpg';
import fotoVaultLigas from '@/public/assets/foto-vault-ligas.jpg';
import fotoQcAuditorio from '@/public/assets/foto-qc-auditorio.jpg';
import fotoQuantAi from '@/public/assets/foto-quant-ai.jpg';
import fotoQuantAiKairos from '@/public/assets/foto-quant-ai-2026-kairos.jpg';
import fotoGiantSteps from '@/public/assets/foto-giant-steps.jpg';
import fotoTreinamento from '@/public/assets/foto-treinamento.jpg';

export const LINK_INSCRICAO =
  'https://docs.google.com/forms/d/e/1FAIpQLScrwUvYpostcTPRLIXiZNyGCVsqQY2O-bPJwliCM5sOzQUtuA/viewform';

export const LINKS_SOCIAIS = {
  email: 'insperqf@gmail.com',
  instagram: 'https://www.instagram.com/insperquant/',
  linkedin: 'https://www.linkedin.com/company/insper-quantitative-finance-club/',
  quantConnect: 'https://www.linkedin.com/company/quantconnectevento/',
};

/* ===================================================== competições */
/**
 * Resultados em competição, do mais recente para o mais antigo.
 *
 * `destaque` marca o que sobe para a faixa do hero e para a tira de marcas da
 * home — são quatro lugares lá, e a ordem desta lista decide quais.
 */
export const COMPETICOES = [
  {
    id: 'quant-ai-2026',
    ano: '2026',
    nome: 'Desafio Quant AI',
    promotor: 'Itaú Asset',
    resultado: '4º lugar',
    resumo: 'finalista com o Kairos, na competição da Itaú Asset.',
    equipe: 'Kairos',
    destaque: true,
    descricao:
      'Competição nacional em que equipes constroem estratégias de investimento com uso intensivo de IA. A edição de 2026 foi lançada no palco do Quant Connect. O Kairos chegou à final e terminou em 4º lugar, com a apresentação no auditório da Itaú Asset.',
  },
  {
    id: 'quant-ai-2025',
    ano: '2025',
    nome: 'Desafio Quant AI',
    promotor: 'Itaú Asset',
    resultado: 'Semifinal',
    resumo: 'com o Nexus, alocação por grafos e redes neurais.',
    equipe: 'Nexus',
    destaque: true,
    descricao:
      'Primeira edição do desafio. O Nexus modela o mercado como um grafo dinâmico que se reconstrói a cada trimestre e deixa uma rede neural aprender, a partir dele, quanto peso dar a cada ativo — com uma camada de risco que reduz exposição em quedas.',
  },
  {
    id: 'quantamental-2024',
    ano: '2024',
    nome: 'Quantamental Challenge',
    promotor: 'Itaú Asset',
    resultado: '2º lugar',
    resumo: 'com o Solaris, na competição da Itaú Asset.',
    equipe: 'Solaris',
    destaque: true,
    descricao:
      'O Solaris busca o meio do caminho do enhanced index tracking: acompanhar o Ibovespa de perto e, ao mesmo tempo, extrair retorno excedente onde o modelo identifica assimetria — mantendo o desvio em relação ao índice sob controle.',
  },
  {
    id: 'vault-2026',
    ano: '2026',
    nome: 'Challenge Vault Quant',
    promotor: 'Vault Capital',
    resultado: 'Em andamento',
    resumo: 'com as ligas FEA.dev e FGV Quant, mentoria da mesa da Vault.',
    equipe: null,
    destaque: false,
    descricao:
      'Challenge aberto no escritório da Vault Capital, com IQF, FEA.dev e FGV Quant. Bruno Drezza, head de quant da casa, apresentou o formato e os critérios de avaliação das estratégias, detalhando o que uma mesa considera relevante na construção e na validação de um modelo.',
  },
];

/* ========================================================= eventos */
export const EVENTOS = [
  {
    tag: '2026 · Vault Capital',
    titulo: 'Kick off do Challenge Vault Quant',
    paragrafos: [
      'A Vault Capital recebeu em seu escritório as ligas IQF, FEA.dev e FGV Quant para a abertura do challenge. O encontro começou com a apresentação institucional da consultoria, da fundação à operação atual.',
      'Em seguida, Bruno Drezza, head de quant da casa, apresentou o formato do desafio e os critérios de avaliação das estratégias, detalhando o que uma mesa considera relevante na construção e na validação de um modelo. O encerramento foi uma conversa aberta com o time sobre a rotina de pesquisa e execução.',
    ],
    fotos: [
      { src: fotoVaultIqf, alt: 'Membros do IQF no escritório da Vault Capital' },
      { src: fotoVaultLigas, alt: 'As três ligas na mesa da Vault Capital' },
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
    fotos: [{ src: fotoQcAuditorio, alt: 'Quant Connect no auditório do Insper' }],
    proporcao: '3 / 2',
    textoPrimeiro: false,
  },
  {
    tag: '2025 e 2026 · Itaú Asset',
    titulo: 'Desafio Quant AI',
    paragrafos: [
      'Competição nacional em que equipes constroem estratégias de investimento com uso intensivo de IA. A liga foi semifinalista na edição de 2025 com o Nexus, e a edição 2026 foi lançada no palco do Quant Connect.',
      'Em 2026 o Kairos chegou à final e terminou em 4º lugar, com a apresentação no auditório da Itaú Asset.',
    ],
    fotos: [
      { src: fotoQuantAi, alt: 'Abertura do Desafio Quant AI' },
      { src: fotoQuantAiKairos, alt: 'O time Kairos apresenta na final do Desafio Quant AI 2026, na Itaú Asset' },
    ],
    // as duas fotos são 16:9; o 3/2 anterior cortava as laterais
    proporcao: '16 / 9',
    textoPrimeiro: true,
  },
  {
    tag: '2026 · Giant Steps Capital',
    titulo: 'Painéis dentro das gestoras',
    paragrafos: [
      'Parte da programação acontece na mesa das casas parceiras: conversa aberta com gestores sobre pesquisa, execução e carreira, com espaço para recrutamento ao final.',
    ],
    fotos: [{ src: fotoGiantSteps, alt: 'Painel na Giant Steps Capital' }],
    proporcao: '3 / 2',
    textoPrimeiro: false,
  },
  {
    tag: 'Todo semestre · Insper',
    titulo: 'Treinamentos internos',
    paragrafos: [
      'Os próprios membros ensinam: fundamentos de factor investing, índices e ETFs, e as ferramentas que a liga desenvolve, como o dashboard de análise de carteira usado nos projetos.',
    ],
    fotos: [{ src: fotoTreinamento, alt: 'Treinamento interno da liga' }],
    proporcao: '3 / 2',
    textoPrimeiro: true,
  },
];

/* ============================================== processo seletivo */
/**
 * As fases do PS, no molde das outras ligas (InFinance lista quatro).
 *
 * ATENÇÃO — ESTE É O CONTEÚDO A CONFIRMAR. O que está aqui é só o que o site
 * já afirmava antes ("você se inscreve pelo formulário e passa pelas etapas de
 * avaliação e entrevista"), destrinchado em etapas. NÃO é a descrição real das
 * provas do IQF, porque ela não estava escrita em lugar nenhum do projeto.
 *
 * Candidato lê isto para se preparar: descrição errada aqui é pior que
 * descrição nenhuma. Troque pelo formato de verdade antes de divulgar, e o
 * resto da página se ajusta sozinho — a numeração sai do índice.
 */
export const ETAPAS_PS = [
  ['Inscrição', 'Você preenche o formulário de inscrição. É por ele que saem todos os avisos das etapas seguintes, então vale usar um e-mail que você acompanha.'],
  ['Avaliação', 'Etapa de avaliação dos inscritos, divulgada a cada edição junto com as datas.'],
  ['Entrevista', 'Conversa com membros da liga sobre a sua motivação, o seu interesse por mercado e a sua disponibilidade no semestre.'],
  ['Resultado', 'Os aprovados entram como trainees e começam o ciclo de fundamentos já no mesmo semestre.'],
];

export const FAQ_PS = [
  ['Preciso saber programar?', 'Não. O trainee começa pelos fundamentos, e a parte técnica se constrói ao longo do processo, com mentoria dos membros mais experientes.'],
  ['Quais cursos podem se inscrever?', 'Todos os cursos do Insper. O que conta é interesse por mercado e disposição para estudo técnico.'],
  ['Quanto tempo leva por semana?', 'As reuniões da sua frente de trabalho, mais o estudo individual e o projeto do semestre.'],
  ['Como é a seleção?', 'Você se inscreve pelo formulário e passa pelas etapas de avaliação e entrevista, divulgadas a cada edição.'],
];

/**
 * O que o trainee percorre depois de entrar. É o mesmo ciclo da seção "O que
 * são finanças quantitativas" da home, visto pelo lado de quem está entrando.
 */
export const TRILHA_TRAINEE = [
  ['Fundamentos', 'Aulas dadas pelos próprios membros: o que move preços, o que é risco, e a estatística que separa padrão de ruído.'],
  ['Estratégia autoral', 'Em grupo, você formula uma hipótese que dá para verificar e a transforma em regra objetiva.'],
  ['Backtest em Python', 'A regra roda sobre os dados reais do passado, com custos de operação, e mostra retorno, risco e onde quebra.'],
  ['Paper', 'O resultado vira texto: o que funcionou, o que foi sorte e o que muda. É aqui que se aprende mais.'],
];

/* ========================================================= contato */
export const CANAIS = [
  ['E-mail', LINKS_SOCIAIS.email, `mailto:${LINKS_SOCIAIS.email}`],
  ['LinkedIn', 'Insper Quantitative Finance Club', LINKS_SOCIAIS.linkedin],
  ['Instagram', '@insperquant', LINKS_SOCIAIS.instagram],
];

/** Os cinco caminhos de empresa. Mesma lista na home e na /contato. */
export const CAMINHOS_EMPRESA = [
  ['Mentoria de projetos', 'Sua equipe propõe a tese e acompanha o desenvolvimento durante o semestre, como a Lev e a Vault Capital já fizeram.'],
  ['Recrutamento', 'Acesso a alunos com prática em modelagem, backtest e pesquisa aplicada, com o portfólio de cada projeto à vista.'],
  ['Palestras e workshops', 'Profissionais da casa apresentam para os membros e, nos eventos abertos, para o público de várias escolas.'],
  ['Visitas ao escritório', 'Um grupo de membros conhece a operação de perto, conversa com o time e vê o dia a dia da mesa.'],
  ['Patrocínio do Quant Connect', 'Presença de marca no encontro das ligas quant de Insper, Poli-USP, FEA-USP e FGV.'],
];
