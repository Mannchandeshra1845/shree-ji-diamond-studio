-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users can view own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Owner email becomes admin once the email is confirmed
create or replace function public.assign_owner_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if lower(new.email) = 'mannchandeshra35@gmail.com' and new.email_confirmed_at is not null then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_owner_admin
after insert or update of email_confirmed_at on auth.users
for each row execute function public.assign_owner_admin();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  price integer not null check (price >= 0),
  mrp integer not null check (mrp >= 0),
  image_url text not null default '',
  rating integer not null default 5,
  reviews integer not null default 0,
  sold_out boolean not null default false,
  description text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select to anon, authenticated using (true);
create policy "Admins insert products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products" on public.products for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

insert into public.products (slug, name, category, price, mrp, image_url, reviews, sold_out, description, created_at) values
('black-bamboo-free-size','Black Bamboo Free Size','Bands (Free Size)',399,799,'asset:p-bamboo',802,false,'A bold black enamel bangle with 18k gold plated bamboo joints. Waterproof and anti-tarnish, made to be worn every single day.', now() - interval '9 min'),
('diamond-studs','Diamond Studs','Earrings',299,599,'asset:p-studs',641,false,'Classic four-prong solitaire studs in 18k gold plating. Lightweight, hypoallergenic and perfect for daily wear.', now() - interval '8 min'),
('champagne-rectangle-watch','Champagne Rectangle Watch','Watches',649,999,'asset:p-watch',214,true,'A petite gold link watch with a soft champagne dial. Elegant enough for evenings, easy enough for everyday.', now() - interval '7 min'),
('pink-crystal-cuff','Pink Crystal Cuff','Bands (Baby Size)',399,799,'asset:p-cuff',388,false,'An open cuff with a blush pink and a clear crystal. Adjustable, anti-tarnish and skin safe.', now() - interval '6 min'),
('solitaire-drop-necklace','Solitaire Drop Necklace','Necklaces',349,699,'asset:p-necklace',527,false,'A fine 18k gold plated chain with a single sparkling solitaire. The everyday necklace you''ll never take off.', now() - interval '5 min'),
('emerald-halo-ring','Emerald Halo (Brass Ring)','Rings',299,599,'asset:p-ring',173,false,'An oval emerald-green stone in a gold plated brass setting. Adjustable fit.', now() - interval '4 min'),
('royal-emerald-ring','Royal Emerald (Brass Ring)','Rings',299,599,'asset:p-ring',159,false,'An emerald-cut green stone on a pave band. Adjustable, gold plated brass.', now() - interval '3 min'),
('hammered-gold-bangles','Hammered Gold Bangles (Set of 2)','Bracelets',449,899,'asset:hero-bangles',296,false,'Two slim hammered bangles that catch the light from every angle. Waterproof and anti-tarnish.', now() - interval '2 min'),
('italian-charm-cuff','Italian Charm Cuff','Italian Charms',499,999,'asset:p-cuff',120,false,'Build your story with this Italian-style charm cuff. 18k gold plated and skin safe.', now() - interval '1 min');

-- Orders (created by the server after validating prices)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated always as identity (start with 1001) unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null,
  discount integer not null default 0,
  total integer not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "Admins view orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

-- Store settings (single row)
create table public.store_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.store_settings to anon, authenticated;
grant update on public.store_settings to authenticated;
grant all on public.store_settings to service_role;
alter table public.store_settings enable row level security;
create policy "Anyone can view settings" on public.store_settings for select to anon, authenticated using (true);
create policy "Admins update settings" on public.store_settings for update to authenticated using (public.has_role(auth.uid(), 'admin'));
insert into public.store_settings (id, whatsapp_number) values (1, '');

-- Product images (private bucket; admins upload and create long-lived signed links)
create policy "Admins read product images" on storage.objects for select to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));