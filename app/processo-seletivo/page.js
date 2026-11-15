import Header from '@/components/landing/Header';
import CabecalhoPagina from '@/components/landing/CabecalhoPagina';
import Revelar from '@/components/landing/Revelar';
import { Rodape } from '@/components/landing/Secoes';
import { ETAPAS_PS, FAQ_PS, LINK_INSCRICAO, TRILHA_TRAINEE } from '@/lib/conteudo-liga';

export const metadata = {
  title: 'Processo seletivo · IQF Insper',
  description:
    'Como entrar na liga de finanças quantitativas do Insper: aberto a alunos de todos os cursos, sem pré-requisito de programação.',
  // Canonical próprio: sem ele, a mesma página acessada com parâmetro
  // de campanha (?utm_source=...) vira uma URL concorrente na busca.
  alternates: { canonical: '/processo-seletivo' },
  // OpenGraph próprio. Sem isto toda página compartilhada no WhatsApp
  // ou no LinkedIn aparecia com o título da home.
  openGraph: { title: 'Processo seletivo · IQF Insper', description: 'Como entrar na liga de finanças quantitativas do Insper: aberto a alunos de todos os cursos, sem pré-requisito de programação.', url: '/processo-seletivo', type: 'website' },
};

export const dynamic = 'force-static';

export default function PaginaProcessoSeletivo() {
  return (
    <>
      <Header />
      <Revelar />

      <main>
        <CabecalhoPagina titulo="Processo seletivo" />

        {/* Abertura no molde da Insper Asset: o que a liga procura, e o botão
            de inscrição já na primeira tela — quem chegou aqui decidido não
            deveria ter de rolar atrás dele. */}
        <section className="secao secao--claro">
          <div className="container duas-colunas" style={{ alignItems: 'start' }}>
            <div>
              <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Quem pode entrar</div>
              <h2 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '20ch' }}>
                Todos os cursos, sem saber programar
              </h2>
              <a className="btn btn--solido" href={LINK_INSCRICAO} target="_blank" rel="noopener">
                Quero entrar
              </a>
            </div>
            <div>
              <p className="p-corpo" style={{ margin: '0 0 18px', maxWidth: '56ch' }}>
                O processo seletivo acontece todo semestre e é aberto a alunos do Insper de qualquer curso. Não há
                pré-requisito de programação: a parte técnica se constrói no trainee, com mentoria dos membros mais
                experientes.
              </p>
              <p className="p-corpo" style={{ margin: 0, maxWidth: '56ch' }}>
                O que pesa na seleção é interesse real por mercado, disposição para estudo técnico e disponibilidade
                para tocar um projeto do começo ao fim durante o semestre.
              </p>
            </div>
          </div>
        </section>

        {/* As fases, com numeral grande — o formato das duas referências que
            têm página de PS (a AgroInsper não tem). */}
        <section className="secao secao--claro-2">
          <div className="container">
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>As fases</div>
            <h2 className="h-secao" style={{ margin: '0 0 56px', maxWidth: '24ch' }}>
              Como funciona a seleção
            </h2>

            <ol className="fases">
              {ETAPAS_PS.map(([titulo, texto], i) => (
                <li key={titulo} data-reveal>
                  <span className="fases__numero" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="fases__titulo">{titulo}</h3>
                    <p className="fases__texto">{texto}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p style={{ marginTop: 32, fontSize: 14, color: 'var(--texto-3)', maxWidth: '62ch' }}>
              As datas de cada fase saem a cada edição, pelo e-mail cadastrado na inscrição e no Instagram da liga.
            </p>
          </div>
        </section>

        {/* O diferencial do IQF frente às outras ligas: dizer o que acontece
            DEPOIS de entrar, que é o que a pessoa realmente quer saber. */}
        <section className="secao secao--grafite">
          <div className="container">
            <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Depois de entrar</div>
            <h2 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '26ch' }}>
              O que você percorre no primeiro semestre
            </h2>
            <p className="p-corpo" style={{ maxWidth: '62ch', margin: '0 0 56px' }}>
              O trainee é o mesmo ciclo que a liga usa em qualquer projeto, feito pela primeira vez com mentoria. Ao
              final, o que você tem não é um certificado: é uma estratégia que roda e um texto que a defende.
            </p>

            <ol className="ciclo">
              {TRILHA_TRAINEE.map(([titulo, texto]) => (
                <li key={titulo} data-reveal>
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="secao secao--claro">
          <div className="container duas-colunas" style={{ alignItems: 'start' }}>
            <div className="fixo-desktop">
              <div className="eyebrow eyebrow--regua" style={{ marginBottom: 16 }}>Dúvidas</div>
              <h2 className="h-secao" style={{ margin: '0 0 20px', maxWidth: '18ch' }}>Perguntas frequentes</h2>
              <p className="p-corpo" style={{ maxWidth: '42ch', margin: '0 0 32px' }}>
                Ficou algo de fora? A diretoria responde por e-mail.
              </p>
              <a className="btn btn--vazado" href="/contato">Falar com a diretoria</a>
            </div>

            <div className="faq">
              {FAQ_PS.map(([pergunta, resposta], i) => (
                <details key={pergunta} open={i === 0}>
                  <summary>{pergunta}</summary>
                  <p>{resposta}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="secao secao--acento" style={{ borderBottom: 'none' }}>
          <div className="container" style={{ maxWidth: 640 }}>
            <h2 className="h-secao" style={{ margin: '0 0 32px' }}>Pronto para se inscrever?</h2>
            <a className="btn btn--solido" href={LINK_INSCRICAO} target="_blank" rel="noopener">
              Quero entrar
            </a>
          </div>
        </section>
      </main>

      <Rodape />
    </>
  );
}
