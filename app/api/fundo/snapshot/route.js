import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { registrarErro } from '@/lib/erros';
import { criarClienteAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Recebe os números do fundo fictício, enviados pela VM a cada 15 minutos
 * (repositório fundoIQF, PUBLICACAO.md).
 *
 *   POST /api/fundo/snapshot
 *   Authorization: Bearer $FUNDO_SITE_TOKEN
 *   { "versao": 1, "fundo": "...", "registros": [ ... ] }
 *
 * Só números agregados chegam aqui: patrimônio, cota e resultado de cada
 * estratégia. Posições nunca. A gravação é toda feita por fundo_registrar()
 * (supabase/migracao-fundo.sql), numa transação: ou o lote entra inteiro, ou
 * nada entra e a VM reenvia depois. Por isso só respondemos 2xx no fim.
 */

const MAX_REGISTROS = 500;
const MAX_ESTRATEGIAS = 50;

function autorizado(request) {
  const segredo = process.env.FUNDO_SITE_TOKEN;
  const enviado = request.headers.get('authorization')?.replace(/^Bearer /, '') ?? '';
  if (!segredo || !enviado) return false;
  const a = Buffer.from(segredo);
  const b = Buffer.from(enviado);
  // comparação em tempo constante: não dá pista do token pelo tempo de resposta
  return a.length === b.length && timingSafeEqual(a, b);
}

const numero = (v) => typeof v === 'number' && Number.isFinite(v);
const texto = (v) => typeof v === 'string' && v.length > 0 && v.length <= 100;

/** Devolve a primeira inconsistência encontrada, ou null se o corpo estiver ok. */
function validar(corpo) {
  if (corpo?.versao !== 1) return 'versao';
  const regs = corpo.registros;
  if (!Array.isArray(regs) || regs.length > MAX_REGISTROS) return 'registros';
  for (const r of regs) {
    if (!['intradia', 'fechamento'].includes(r?.tipo)) return 'tipo';
    if (!texto(r.ts) || Number.isNaN(Date.parse(r.ts))) return 'ts';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.data ?? '')) return 'data';
    if (![r.patrimonio, r.caixa, r.cotas].every(numero)) return 'valores';
    if (r.cota !== null && !numero(r.cota)) return 'cota';
    if (!Array.isArray(r.estrategias) || r.estrategias.length > MAX_ESTRATEGIAS) return 'estrategias';
    for (const e of r.estrategias) {
      if (!texto(e?.id) || ![e.alocacao, e.resultado, e.exposicao].every(numero)) return 'estrategia';
    }
  }
  return null;
}

export async function POST(request) {
  if (!autorizado(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: 'JSON inválido.' }, { status: 400 });
  }

  const problema = validar(corpo);
  if (problema) {
    return NextResponse.json({ erro: `Formato inválido (${problema}).` }, { status: 400 });
  }

  try {
    const supabase = criarClienteAdmin();
    const { data, error } = await supabase.rpc('fundo_registrar', { p: corpo });
    if (error) throw error;
    // A página pública revalida sozinha a cada 15 min; isto antecipa.
    revalidatePath('/fundo');
    return NextResponse.json({ recebidos: data });
  } catch (e) {
    registrarErro('fundo: gravar registros', e);
    return NextResponse.json({ erro: 'Falha ao gravar.' }, { status: 500 });
  }
}
