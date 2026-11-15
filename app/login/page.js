import TelaAuth from '@/components/membros/TelaAuth';
import FormularioLogin from './FormularioLogin';

// Tela de autenticação não tem o que fazer num resultado de busca.
export const metadata = {
  title: 'Entrar · Insper Quantitative Finance',
  robots: { index: false, follow: false },
};

// Motivos pelos quais /sair devolveu a pessoa para cá.
const MOTIVOS = {
  'sem-perfil':
    'Sua conta existe, mas não está vinculada a nenhum perfil de membro. Fale com a diretoria para concluir o cadastro.',
  inativo: 'Seu acesso foi desativado pela gestão. Fale com a diretoria se isso for engano.',
};

export default function PaginaLogin({ searchParams }) {
  const motivo = MOTIVOS[searchParams?.motivo];

  return (
    <TelaAuth
      titulo="Área de membros"
      descricao="Entre com o e-mail e a senha cadastrados para acessar projetos, materiais e a sua agenda."
      rodape="Ainda não tem acesso? Quem cria as contas é a diretoria."
    >
      {motivo && <div className="aviso aviso--erro" style={{ marginBottom: 24 }}>{motivo}</div>}
      <FormularioLogin destino={searchParams?.destino || '/membros'} />
    </TelaAuth>
  );
}
