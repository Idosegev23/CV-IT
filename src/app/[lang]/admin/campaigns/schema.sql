-- הוספת טיפוס חדש עבור סוגי המדיה
CREATE TYPE public.media_type AS ENUM (
    'facebook',
    'instagram',
    'linkedin',
    'google',
    'tiktok',
    'influencer',
    'email',
    'sms',
    'other'
);

-- עדכון טבלת הקמפיינים
ALTER TABLE public.campaigns
ADD COLUMN media_types media_type[] DEFAULT '{}',
ADD COLUMN target_audience jsonb,
ADD COLUMN metrics jsonb,
ADD COLUMN platform_data jsonb,
ADD COLUMN status text DEFAULT 'draft',
ADD COLUMN roi numeric DEFAULT 0;

-- יצירת טבלת קשר בין קמפיינים לקופונים
CREATE TABLE public.campaign_coupons (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
    coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(campaign_id, coupon_id)
);

-- הוספת אינדקסים לשיפור ביצועים
CREATE INDEX idx_campaigns_media_types ON public.campaigns USING gin (media_types);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaign_coupons_campaign_id ON public.campaign_coupons(campaign_id);
CREATE INDEX idx_campaign_coupons_coupon_id ON public.campaign_coupons(coupon_id);

-- הגדרת RLS על טבלת הקשר
ALTER TABLE public.campaign_coupons ENABLE ROW LEVEL SECURITY;

-- הגדרת מדיניות גישה לטבלת הקשר
CREATE POLICY "Admins can manage campaign_coupons"
    ON public.campaign_coupons
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE public.campaign_coupons IS 'טבלת קשר בין קמפיינים לקופונים';
COMMENT ON COLUMN public.campaigns.media_types IS 'סוגי המדיה בהם משתמש הקמפיין';
COMMENT ON COLUMN public.campaigns.target_audience IS 'קהל היעד של הקמפיין';
COMMENT ON COLUMN public.campaigns.metrics IS 'מדדי ביצוע של הקמפיין';
COMMENT ON COLUMN public.campaigns.platform_data IS 'נתונים ספציפיים לפלטפורמה';
COMMENT ON COLUMN public.campaigns.roi IS 'החזר על ההשקעה'; 