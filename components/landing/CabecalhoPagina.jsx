import Image from 'next/image';

/**
 * Cabeçalho das subpáginas (/equipe, /competicoes, /eventos, ...).
 *
 * Logo, fio vertical, nome da página. Nada mais — é o molde das ligas do
 * Insper, e é o que faz a subpágina abrir dizendo onde você está em vez de
 * gastar a primeira tela com um parágrafo que ninguém pediu. O texto de
 * contexto, quando é mesmo necessário, mora na primeira seção da página.
 *
 * O fundo é cor chapada, e não o degradê mesh que havia aqui: o mesmo mesh em
 * seis cabeçalhos virava papel de parede e tirava a hierarquia das seções
 * seguintes. Chapado, a faixa ancora o topo e deixa o conteúdo carregar a cor.
 */
export default function CabecalhoPagina({ titulo }) {
  return (
    <section className="secao secao--tinta cabecalho-pagina">
      <div className="cabecalho-pagina__marca">
        {/* `sizes` TEM de bater com a largura real do CSS (.cabecalho-pagina__marca
            img = min(56vw, 330px)). É ele, e não o `width`, que decide qual
            arquivo o navegador baixa: com um `sizes` menor que o tamanho
            renderizado, o navegador pega um bitmap pequeno e o estica — era o
            caso aqui, 210px esticados para 330px.
            quality 90 porque o logo é traço fino concêntrico, e o 75 padrão
            borra as linhas no WebP. */}
        <Image
          src="/assets/logo-iqf.png"
          alt="Insper Quantitative Finance"
          width={396}
          height={184}
          priority
          quality={90}
          sizes="(max-width: 600px) 56vw, 330px"
        />
        <h1>{titulo}</h1>
      </div>
    </section>
  );
}
