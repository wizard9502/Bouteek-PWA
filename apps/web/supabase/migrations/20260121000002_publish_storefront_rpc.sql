-- Storefront Publish System
-- Adds live_layout column and publish RPC function

-- 1. Add live_layout column to storefronts (the published version)
ALTER TABLE public.storefronts 
ADD COLUMN IF NOT EXISTS live_layout JSONB DEFAULT '[]'::jsonb;

-- 2. RPC: Publish Storefront (copies sections/theme to live_layout)
CREATE OR REPLACE FUNCTION public.publish_storefront(
    p_storefront_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_storefront RECORD;
BEGIN
    -- Get current user
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated.');
    END IF;

    -- Get storefront and verify ownership
    SELECT * INTO v_storefront
    FROM public.storefronts
    WHERE id = p_storefront_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Storefront not found or you do not own it.');
    END IF;

    -- Copy sections to live_layout and mark as published
    UPDATE public.storefronts
    SET 
        live_layout = jsonb_build_object(
            'sections', sections,
            'theme_settings', theme_settings,
            'published_at', NOW()
        ),
        is_published = true,
        updated_at = NOW()
    WHERE id = p_storefront_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Storefront published successfully!',
        'published_at', NOW()
    );
END;
$$;

-- 3. RPC: Unpublish Storefront
CREATE OR REPLACE FUNCTION public.unpublish_storefront(
    p_storefront_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated.');
    END IF;

    UPDATE public.storefronts
    SET 
        is_published = false,
        updated_at = NOW()
    WHERE id = p_storefront_id AND user_id = v_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Storefront not found or you do not own it.');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Storefront unpublished.'
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.publish_storefront TO authenticated;
GRANT EXECUTE ON FUNCTION public.unpublish_storefront TO authenticated;
