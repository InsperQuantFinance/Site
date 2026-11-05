'use client';

import { createContext, useContext } from 'react';

/**
 * Entrega os pontos do fundo aos dois painéis. Passar como prop para cada um
 * mandaria a série inteira duas vezes no HTML; pelo contexto, vai uma vez só.
 */
const Contexto = createContext(null);

export function DadosFundo({ pontos, estrategias, children }) {
  return <Contexto.Provider value={{ pontos, estrategias }}>{children}</Contexto.Provider>;
}

export const useDadosFundo = () => useContext(Contexto);
