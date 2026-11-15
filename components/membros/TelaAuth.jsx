import Image from 'next/image';
import Link from 'next/link';

// Mesh próprio desta tela, e não o do hero copiado.
//
// O do hero foi composto para uma faixa larga e baixa: nela o marinho ocupa
// a esquerda e o vermelho a direita, lado a lado. Colado num painel alto e
// estreito, esse arranjo espreme os dois contra as bordas laterais e o que
// sobra no meio é preto — foi o que deixou o azul apagado.
//
// Aqui a composição é vertical: marinho em cima, vermelho embaixo, com a
// zona de encontro no meio da altura. O marinho também subiu de luminosidade
// (rgb(12,26,78) → rgb(32,70,180)): no hero ele é fundo atrás de um logo
// grande e de texto; aqui é a própria imagem da metade da tela, e naquele
// tom ele lia como preto.
//
// As paradas terminam em alpha 0 da MESMA cor — com `transparent` o navegador
// interpola por preto e suja a borda.
const MESH_AUTH =
  'radial-gradient(62% 40% at 26% 14%, rgba(32,70,180,0.95) 0%, rgba(32,70,180,0) 70%),' +
  'radial-gradient(48% 34% at 2% 38%, rgba(20,46,136,0.9) 0%, rgba(20,46,136,0) 68%),' +
  'radial-gradient(44% 30% at 72% 30%, rgba(26,58,152,0.72) 0%, rgba(26,58,152,0) 70%),' +
  'radial-gradient(58% 40% at 74% 86%, rgba(206,24,28,0.92) 0%, rgba(206,24,28,0) 70%),' +
  'radial-gradient(44% 32% at 98% 66%, rgba(158,14,24,0.88) 0%, rgba(158,14,24,0) 68%),' +
  'radial-gradient(46% 30% at 20% 94%, rgba(122,10,26,0.8) 0%, rgba(122,10,26,0) 70%)';

/**
 * Moldura das telas de autenticação: entrar, aceitar convite, redefinir senha.
 *
 * Tela dividida — mesh da marca ocupando a metade esquerda, formulário em
 * fundo claro na direita. É o molde do portal do AgroInsper, e resolve dois
 * problemas da versão anterior (um cartão escuro centralizado sobre preto):
 * o lado esquerdo diz de cara em que casa você está entrando, e o lado claro
 * separa o ato de autenticar do resto do site.
 *
 * O mesh some abaixo de 900px. Numa tela de celular ele comeria metade da
 * altura útil sem acrescentar informação, e o que importa ali é o formulário.
 */
export default function TelaAuth({ titulo, descricao, children, rodape }) {
  return (
    <main className="auth">
      <div className="auth__arte">
        <div className="auth__mesh" style={{ backgroundImage: MESH_AUTH }} />
        {/* Véu: o mesh é vivo demais sob o logo sem ele. */}
        <div className="auth__veu" />
        {/* .auth__logo = min(62%, 440px) de uma coluna de 50vw, logo min(31vw,
            440px). Abaixo de 900px a arte inteira some, daí o 1px. */}
        <Image
          className="auth__logo"
          src="/assets/logo-iqf.png"
          alt="Insper Quantitative Finance"
          width={396}
          height={184}
          priority
          quality={90}
          sizes="(max-width: 900px) 1px, min(31vw, 440px)"
        />
      </div>

      <div className="auth__painel">
        <div className="auth__conteudo">
          <div className="eyebrow eyebrow--regua auth__rotulo">Insper Quantitative Finance</div>
          <h1 className="auth__titulo">{titulo}</h1>
          {descricao && <p className="auth__descricao">{descricao}</p>}

          {children}

          <div className="auth__rodape">
            {rodape}
            <Link href="/">Voltar para o site</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
