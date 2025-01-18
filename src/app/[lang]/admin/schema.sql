-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text not null default 'user',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security for profiles
alter table public.profiles enable row level security;

-- Create policy to allow users to view their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Create policy to allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- Create policy to allow admins to view all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create policy to allow admins to update all profiles
create policy "Admins can update all profiles"
  on profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create trigger to handle profile updates
create or replace function public.handle_profile_updated()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger on_profile_updated
  before update on public.profiles
  for each row
  execute procedure public.handle_profile_updated();

-- Create trigger to handle new user signups
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- מבלת פלטפורמות - יצירת טיפוס
DROP TYPE IF EXISTS platform_type CASCADE;
CREATE TYPE platform_type AS ENUM (
    'linkedin',
    'facebook',
    'instagram',
    'google',
    'tiktok',
    'influencer'
);

-- טבלת חיבורים לפלטפורמות
DROP TABLE IF EXISTS platform_connections CASCADE;
CREATE TABLE platform_connections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform platform_type NOT NULL,
    account_name text NOT NULL,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for platform_connections
ALTER TABLE platform_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for platform_connections
CREATE POLICY "Admins can manage platform connections" ON platform_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- טבלת קמפיינים
DROP TABLE IF EXISTS campaigns CASCADE;
CREATE TABLE campaigns (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    description text,
    platform_connection_id uuid REFERENCES platform_connections(id),
    platform_campaign_id text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    budget numeric(10,2),
    spent numeric(10,2) DEFAULT 0,
    total_usage integer NOT NULL DEFAULT 0,
    total_discount numeric(10,2) NOT NULL DEFAULT 0,
    status text NOT NULL DEFAULT 'draft',
    target_audience jsonb,
    metrics jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    metadata jsonb
);

-- Enable Row Level Security for campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for campaigns
CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for campaigns
CREATE OR REPLACE FUNCTION public.handle_campaign_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_campaign_updated
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_campaign_updated();

-- טבלת קופונים
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TYPE IF EXISTS public.coupon_status CASCADE;
CREATE TYPE public.coupon_status AS ENUM ('active', 'inactive', 'expired');

CREATE TABLE public.coupons (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    code text NOT NULL UNIQUE,
    discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free_package')),
    discount_value numeric(10,2) NOT NULL,
    package_type text CHECK (package_type IN ('basic', 'advanced', 'pro')),
    max_uses integer NOT NULL DEFAULT 1,
    current_uses integer NOT NULL DEFAULT 0,
    starts_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons
CREATE POLICY "Enable read access for all users" ON public.coupons
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admins only" ON public.coupons
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Enable update for admins only" ON public.coupons
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Enable delete for admins only" ON public.coupons
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- טבלת מדדי קמפיין
DROP TABLE IF EXISTS campaign_metrics CASCADE;
CREATE TABLE campaign_metrics (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    date date NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    conversions integer DEFAULT 0,
    cost numeric(10,2) DEFAULT 0,
    revenue numeric(10,2) DEFAULT 0,
    platform_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- טבלת UTM tracking
DROP TABLE IF EXISTS campaign_tracking CASCADE;
CREATE TABLE campaign_tracking (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_content text,
    utm_term text,
    visits integer DEFAULT 0,
    conversions integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for metrics and tracking
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for metrics and tracking
CREATE POLICY "Admins can manage campaign metrics" ON campaign_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can manage campaign tracking" ON campaign_tracking
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Create indexes
CREATE INDEX idx_platform_connections_platform ON platform_connections(platform);
CREATE INDEX idx_platform_connections_is_active ON platform_connections(is_active);
CREATE INDEX idx_campaigns_platform_connection ON campaigns(platform_connection_id);
CREATE INDEX idx_campaign_metrics_campaign_date ON campaign_metrics(campaign_id, date);
CREATE INDEX idx_campaign_tracking_campaign ON campaign_tracking(campaign_id);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX idx_coupons_expires_at ON public.coupons(expires_at);
CREATE INDEX idx_coupons_campaign_id ON public.coupons(campaign_id);

-- טבלת חיבורים לרשתות חברתיות
DROP TABLE IF EXISTS public.social_connections CASCADE;
CREATE TABLE public.social_connections (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform text NOT NULL,
    account_name text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    is_connected boolean DEFAULT true,
    last_sync timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- הפעלת RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- מדיניות גישה למנהלים
CREATE POLICY "Admins can do everything on social_connections"
    ON public.social_connections
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- פונקציה להצפנת סיסמאות
CREATE OR REPLACE FUNCTION public.encrypt_password()
RETURNS TRIGGER AS $$
BEGIN
    -- בפרויקט אמיתי כאן תהיה פונקציית הצפנה אמיתית
    NEW.password = encode(digest('salt' || NEW.password, 'sha256'), 'hex');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- טריגר להצפנת סיסמאות
CREATE TRIGGER encrypt_password_on_insert
    BEFORE INSERT OR UPDATE ON public.social_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_password();

-- פונקציה לעדכון זמן העדכון האחרון
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- טריגר לעדכון זמן העדכון האחרון
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.social_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- אינדקסים
CREATE INDEX IF NOT EXISTS social_connections_platform_idx ON public.social_connections (platform);
CREATE INDEX IF NOT EXISTS social_connections_account_name_idx ON public.social_connections (account_name);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  template_id TEXT,
  language TEXT,
  status TEXT,
  current_step TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_details JSONB,
  client_details JSONB,
  metadata JSONB
); 