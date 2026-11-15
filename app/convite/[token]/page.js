import Link from 'next/link';
import TelaAuth from '@/components/membros/TelaAuth';
import { DOMINIO_PERMITIDO, MOTIVOS, rotuloCargoConvite, situacaoConvite } from '@/lib/convites';
import { criarClienteAdmin } from '@/lib/supabase/server';
import FormularioConvite from './FormularioConvite';

export const dynamic = 'force-dynamic';
// O token é um segredo: nenhum buscador deve indexar (nem guardar) esta URL.
export const metadata = {
  title: 'Criar sua conta · IQF',
  robots: { index: false, follow: false },
};

export default async function PaginaConvite({ params }) {
  // Cliente admin porque a tabela de convites não é legível por ninguém
  // (nem anon, nem authenticated) — ver migracao-convites.sql.
  const { data: convite } = await criarClienteAdmin()
    .from('convites')
    .select('rotulo, cargo, nome, email, usos, usos_max, expira_em, revogado')
    .eq('token', params.token)
    .maybeSingle();

  const situacao = convite ? situacaoConvite(convite) : { valor: 'invalido' };

  if (situacao.valor !== 'ativo') {
    return (
      <TelaAuth titulo="Convite indisponível">
        <div className="aviso aviso--erro" style={{ marginBottom: 28 }}>{MOTIVOS[situacao.valor]}</div>
        <Link className="btn btn--vazado" href="/login">Ir para o login</Link>
      </TelaAuth>
    );
  }

  return (
    <TelaAuth
      titulo={`Criar sua conta de ${rotuloCargoConvite(convite.cargo).toLowerCase()}`}
      descricao={
        convite.email
          ? 'Confira seu nome e escolha uma senha. A senha fica só com você: nem a diretoria consegue ver.'
          : `Use seu e-mail @${DOMINIO_PERMITIDO} e escolha uma senha. A senha fica só com você: nem a diretoria consegue ver.`
      }
      rodape={<span>Já tem conta? <Link href="/login">Entrar</Link></span>}
    >
      <FormularioConvite token={params.token} nome={convite.nome} email={convite.email} />
    </TelaAuth>
  );
}
