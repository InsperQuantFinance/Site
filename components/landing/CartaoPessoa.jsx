import Image from 'next/image';

/**
 * Cartão de pessoa, usado por /equipe e /alumni.
 *
 * Mesmo molde das páginas de equipe das outras ligas do Insper (InFinance,
 * AgroInsper, Insper Asset): retrato à esquerda, fio vertical separando, e o
 * bloco de texto à direita com nome, cargo e LinkedIn.
 *
 * O retrato é opcional porque hoje ninguém no quadro tem foto — sem ela, o
 * fio vertical sozinho já ancora a coluna, e a página fica apresentável do
 * mesmo jeito. Conforme as fotos subirem, elas aparecem sem mexer aqui.
 *
 * Não mostra e-mail, ao contrário da InFinance: o e-mail institucional de
 * cada membro numa página pública é endereço colhido por robô de spam. O
 * contato da liga, que é o canal certo, está no rodapé e na /contato.
 */
export default function CartaoPessoa({ pessoa, rotulo, destaque = false }) {
  const { nome, foto_url: foto, area, bio, linkedin } = pessoa;

  return (
    <article className="pessoa" data-destaque={destaque ? '' : undefined} data-reveal>
      {foto && (
        <div className="pessoa__retrato">
          {/* unoptimized: a URL do storage do Supabase é assinada e expira; o
              cache do Next acabaria servindo um link morto. */}
          <Image src={foto} alt="" fill sizes="120px" unoptimized />
        </div>
      )}

      <div className="pessoa__corpo">
        <h3 className="pessoa__nome">{nome}</h3>
        {rotulo && <div className="pessoa__cargo">{rotulo}</div>}
        {area && <div className="pessoa__area">{area}</div>}
        {bio && <p className="pessoa__bio">{bio}</p>}
        {linkedin && (
          <a className="pessoa__link" href={linkedin} target="_blank" rel="noopener">
            {/* O texto visível se repete na grade inteira; o nome vai escondido
                para o leitor de tela distinguir um link do outro. */}
            LinkedIn →<span className="sr-only"> de {nome}</span>
          </a>
        )}
      </div>
    </article>
  );
}
