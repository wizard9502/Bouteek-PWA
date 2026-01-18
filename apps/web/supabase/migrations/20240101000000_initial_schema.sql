-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enums
create type public.role_enum as enum ('user', 'admin');
create type public.payment_type_enum as enum ('wave', 'orange_money');
create type public.transaction_type_enum as enum ('topup', 'subscription', 'commission', 'refund');
create type public.transaction_status_enum as enum ('pending', 'completed', 'failed');
create type public.subscription_tier_enum as enum ('starter', 'launch', 'growth', 'pro');
create type public.product_type_enum as enum ('sale', 'rent', 'service', 'event');
create type public.order_status_enum as enum ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled');

-- Users / Profiles (extends auth.users)
create table public.users (
  id uuid references auth.users not null primary key,
  open_id text unique, -- Keeping for compatibility, might be redundant with auth.users
  name text,
  email text,
  login_method text,
  role public.role_enum default 'user' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  last_signed_in timestamptz default now() not null
);
alter table public.users enable row level security;

-- Merchants
create table public.merchants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  business_name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  trust_score integer default 0,
  is_verified boolean default false not null,
  is_banned boolean default false not null,
  subscription_tier public.subscription_tier_enum default 'starter',
  subscription_start timestamptz,
  subscription_end timestamptz,
  bouteek_cash_balance integer default 0 not null,
  contact_phone text,
  contact_email text,
  whatsapp text,
  address text,
  instagram text,
  snapchat text,
  tiktok text,
  business_hours jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.merchants enable row level security;

-- Products
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  merchant_id uuid references public.merchants(id) not null,
  name text not null,
  description text,
  price integer not null,
  sale_price integer,
  images text[] default '{}',
  category text,
  product_type public.product_type_enum default 'sale',
  stock_quantity integer default 0 not null,
  is_active boolean default true not null,
  variants jsonb default '[]',
  timer_start timestamptz,
  timer_end timestamptz,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.products enable row level security;

-- Orders
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  merchant_id uuid references public.merchants(id) not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  items jsonb not null,
  subtotal integer not null,
  commission integer default 0,
  total integer not null,
  status public.order_status_enum default 'pending',
  delivery_method text,
  delivery_address text,
  payment_method text,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.orders enable row level security;

-- Storefronts
create table public.storefronts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  slug text unique not null,
  name text not null,
  description text,
  theme_settings jsonb not null,
  sections jsonb not null default '[]',
  is_published boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.storefronts enable row level security;

-- Storefront Payment Methods
create table public.storefront_payment_methods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) not null,
  type public.payment_type_enum not null,
  account_number text not null,
  account_name text not null,
  is_primary boolean default false not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
alter table public.storefront_payment_methods enable row level security;

-- RLS Policies (Basic)

-- Users: Read own data
create policy "Users can view own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Merchants: Public read, User write
create policy "Public can view merchants" on public.merchants for select using (true);
create policy "Users can update own merchant" on public.merchants for update using (auth.uid() = user_id);
create policy "Users can insert own merchant" on public.merchants for insert with check (auth.uid() = user_id);

-- Products: Public read, Merchant write
create policy "Public can view active products" on public.products for select using (is_active = true);
create policy "Merchants can manage own products" on public.products for all using (exists (select 1 from public.merchants where id = products.merchant_id and user_id = auth.uid()));

-- Orders: Merchant read/update, Public create? (Guest checkout?)
create policy "Merchants can view orders" on public.orders for select using (exists (select 1 from public.merchants where id = orders.merchant_id and user_id = auth.uid()));
-- Allowing public insert for orders usually requires careful setup or anonymous auth.
-- For now, allow authenticated users to create orders? Or just unauthenticated.
create policy "Anyone can create order" on public.orders for insert with check (true);

-- Storefronts: Public read published, User manage own
create policy "Public can view published storefronts" on public.storefronts for select using (is_published = true);
create policy "Users can manage own storefront" on public.storefronts for all using (auth.uid() = user_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

