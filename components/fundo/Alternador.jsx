'use client';

/** Grupo de botões em que um fica marcado (período, medida). */
export default function Alternador({ rotulo, opcoes, valor, aoMudar }) {
  if (opcoes.length < 2) return null;
  return (
    <div className="fundo-periodos" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          className="fundo-periodo"
          aria-pressed={o.id === valor}
          onClick={() => aoMudar(o.id)}
        >
          {o.rotulo}
        </button>
      ))}
    </div>
  );
}
