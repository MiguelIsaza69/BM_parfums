-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Nullable for guest checkout if needed
    total NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, cancelled
    shipping_info JSONB NOT NULL,
    items JSONB NOT NULL, -- Array of items with snapshot of price/name
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies for Admin (Select, Insert, Update, Delete)
CREATE POLICY "Admins can do everything on orders"
    ON public.orders
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policies for Users (Select own orders, Insert own orders)
CREATE POLICY "Users can view own orders"
    ON public.orders
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow public insert (for guest checkout flow if we support it)? 
-- For now, let's assume authenticated or we allow anon inserts with some checks.
-- But since we use user_id, let's allow authenticated inserts.
-- If guest, user_id is null.
CREATE POLICY "Anyone can create orders"
    ON public.orders
    FOR INSERT
    WITH CHECK (true); -- Allow creation, user_id might be null

-- Realtime
alter publication supabase_realtime add table orders;
