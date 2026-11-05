-- =====================================================================
-- Migração: fundo fictício (página pública /fundo).
-- Rode uma vez no SQL Editor do Supabase. Rodar de novo não estraga nada.
--
-- A VM do fundo (repositório fundoIQF) manda, a cada 15 min, patrimônio,
-- cota e resultado de cada estratégia para /api/fundo/snapshot, que grava
-- aqui via fundo_registrar(). Posições (ativos e quantidades) nunca chegam.
--
-- Acesso:
--   * As três tabelas ficam fechadas (RLS ligado, sem política): só a chave
--     secreta do servidor lê e escreve. O id interno da estratégia mora aqui e
--     não pode ir a público — ele dá pistas do que a estratégia faz.
--   * O público lê só pelas duas views fundo_publico_*, que expõem o rótulo
--     ("Estratégia N" ou o nome_publico) e nunca o id.
--   * fundo_registrar() só pode ser chamada pelo servidor (service_role).
-- =====================================================================

create table if not exists public.fundo_estrategias (
  id            text primary key,              -- id interno (estrategias.toml)
  numero        integer not null unique,       -- "Estratégia N", fixo para sempre
  nome_publico  text,                          -- preencha para trocar o rótulo
  created_at    timestamptz not null default now()
);

create table if not exists public.fundo_registros (
  id           bigint generated always as identity primary key,
  ts           timestamptz not null,
  tipo         text not null check (tipo in ('intradia', 'fechamento')),
  data         date not null,
  patrimonio   numeric(16, 2) not null,
  caixa        numeric(16, 2) not null,
  cotas        numeric(20, 6) not null,
  cota         numeric(16, 8),
  recebido_em  timestamptz not null default now()
);

-- Idempotência: a VM reenvia o lote inteiro se não receber 2xx.
create unique index if not exists fundo_registros_intradia_ts
  on public.fundo_registros (ts) where tipo = 'intradia';
create unique index if not exists fundo_registros_fechamento_data
  on public.fundo_registros (data) where tipo = 'fechamento';
create index if not exists fundo_registros_data on public.fundo_registros (data);

create table if not exists public.fundo_registros_estrategia (
  registro_id    bigint not null references public.fundo_registros(id) on delete cascade,
  estrategia_id  text   not null references public.fundo_estrategias(id) on delete cascade,
  alocacao       numeric(6, 4)  not null,
  resultado      numeric(16, 2) not null,
  exposicao      numeric(16, 2) not null,
  primary key (registro_id, estrategia_id)
);

alter table public.fundo_estrategias          enable row level security;
alter table public.fundo_registros            enable row level security;
alter table public.fundo_registros_estrategia enable row level security;
-- Sem política nenhuma de propósito: anon e authenticated não leem nem
-- escrevem. O revoke é a segunda trava (o Supabase concede tudo por padrão).
revoke all on public.fundo_estrategias, public.fundo_registros,
              public.fundo_registros_estrategia from anon, authenticated;

-- ------------------------------------------------------------ gravação
-- Recebe o corpo inteiro enviado pela VM (ver PUBLICACAO.md no fundoIQF) e
-- grava tudo numa transação: ou o lote entra inteiro, ou nada entra.
-- Devolve quantos registros foram gravados.
create or replace function public.fundo_registrar(p jsonb)
returns integer
language plpgsql
set search_path = public
as $$
declare
  r   jsonb;
  e   jsonb;
  rid bigint;
  n   integer := 0;
begin
  if coalesce((p->>'versao')::int, 0) <> 1 then
    raise exception 'fundo_registrar: versao % nao suportada', p->>'versao';
  end if;

  for r in select * from jsonb_array_elements(coalesce(p->'registros', '[]'::jsonb)) loop
    -- substitui o registro equivalente, se já existir
    if r->>'tipo' = 'fechamento' then
      delete from fundo_registros where tipo = 'fechamento' and data = (r->>'data')::date;
    else
      delete from fundo_registros where tipo = 'intradia' and ts = (r->>'ts')::timestamptz;
    end if;

    insert into fundo_registros (ts, tipo, data, patrimonio, caixa, cotas, cota)
    values ((r->>'ts')::timestamptz, r->>'tipo', (r->>'data')::date,
            (r->>'patrimonio')::numeric, (r->>'caixa')::numeric,
            (r->>'cotas')::numeric, (r->>'cota')::numeric)
    returning id into rid;

    for e in select * from jsonb_array_elements(coalesce(r->'estrategias', '[]'::jsonb)) loop
      insert into fundo_estrategias (id, numero)
      values (e->>'id', (select coalesce(max(numero), 0) + 1 from fundo_estrategias))
      on conflict (id) do nothing;

      insert into fundo_registros_estrategia (registro_id, estrategia_id, alocacao, resultado, exposicao)
      values (rid, e->>'id', (e->>'alocacao')::numeric,
              (e->>'resultado')::numeric, (e->>'exposicao')::numeric);
    end loop;

    n := n + 1;
  end loop;

  return n;
end;
$$;

-- O Supabase dá EXECUTE em funções novas para anon e authenticated. Sem este
-- revoke, qualquer visitante gravaria números falsos pela API REST.
revoke execute on function public.fundo_registrar(jsonb) from public, anon, authenticated;
grant execute on function public.fundo_registrar(jsonb) to service_role;

-- ------------------------------------------------------------ leitura pública
-- Views rodam com os direitos do dono (que ignora o RLS das tabelas acima),
-- então expõem exatamente as colunas listadas aqui — e nada mais.
create or replace view public.fundo_publico_serie as
  select ts, tipo, data, patrimonio, cota
  from public.fundo_registros;

create or replace view public.fundo_publico_estrategias as
  select r.ts, r.tipo, r.data,
         e.numero,
         coalesce(nullif(trim(e.nome_publico), ''), 'Estratégia ' || e.numero) as rotulo,
         re.alocacao, re.resultado
  from public.fundo_registros_estrategia re
  join public.fundo_registros r   on r.id = re.registro_id
  join public.fundo_estrategias e on e.id = re.estrategia_id;

revoke all on public.fundo_publico_serie, public.fundo_publico_estrategias from anon, authenticated;
grant select on public.fundo_publico_serie, public.fundo_publico_estrategias to anon, authenticated;
