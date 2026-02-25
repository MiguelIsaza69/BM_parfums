-- Add missing payment columns to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can do everything on orders" ON public.orders;

-- New robust policies
CREATE POLICY "Enable insert for all users including guests"
ON public.orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL); -- Note: Guests can't really "view" later unless we have a token, but this allows the redirect to work

CREATE POLICY "Admins have full access"
ON public.orders FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
