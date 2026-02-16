CREATE OR REPLACE FUNCTION public.upsert_product_secure(p_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass complex RLS during execution if needed
SET search_path = public
AS $$
DECLARE
    v_id uuid;
    v_result jsonb;
    v_image_array text[];
BEGIN
    -- 1. Extract and cast the images array explicitly
    -- JSONB arrays need to be converted to text[] for Postgres
    SELECT array_agg(value::text)
    INTO v_image_array
    FROM jsonb_array_elements_text(p_data->'images');
    
    -- Handle empty array case (aggregating empty returns null)
    IF v_image_array IS NULL THEN
        v_image_array := ARRAY[]::text[];
    END IF;

    -- 2. Check if we are Updating or Inserting
    -- (p_data->>'id') will be null or "null" string if it's new
    IF (p_data->>'id') IS NOT NULL AND (p_data->>'id') != '' THEN
        -- UPDATE
        v_id := (p_data->>'id')::uuid;
        
        UPDATE public.products
        SET 
            name = (p_data->>'name'),
            brand_id = (p_data->>'brand_id')::uuid,
            gender_id = (p_data->>'gender_id')::uuid,
            category_ids = (SELECT array_agg(x::uuid) FROM jsonb_array_elements_text(p_data->'category_ids') as t(x)), -- Cast JSON array to UUID[]
            description = (p_data->>'description'),
            price = (p_data->>'price')::numeric,
            volume_ml = (p_data->>'volume_ml')::numeric,
            quality = (p_data->>'quality'),
            images = v_image_array -- The sanitized array
        WHERE id = v_id
        RETURNING to_jsonb(products.*) INTO v_result;
        
    ELSE
        -- INSERT
        INSERT INTO public.products (
            name, brand_id, gender_id, category_ids, description, price, volume_ml, quality, images
        ) VALUES (
            (p_data->>'name'),
            (p_data->>'brand_id')::uuid,
            (p_data->>'gender_id')::uuid,
            COALESCE((SELECT array_agg(x::uuid) FROM jsonb_array_elements_text(p_data->'category_ids') as t(x)), ARRAY[]::uuid[]),
            (p_data->>'description'),
            (p_data->>'price')::numeric,
            (p_data->>'volume_ml')::numeric,
            (p_data->>'quality'),
            v_image_array
        )
        RETURNING to_jsonb(products.*) INTO v_result;
    END IF;

    RETURN v_result;
END;
$$;
