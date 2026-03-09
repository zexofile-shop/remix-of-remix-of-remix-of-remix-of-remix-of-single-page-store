
-- Update is_admin function to also check super admin emails
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin' AND is_active = true
  )
  OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id AND email IN ('techshivam0616@gmail.com', 'niteshprakash555@gmail.com')
  )
$$;

-- Also update has_role to handle super admins
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  )
  OR (
    _role = 'admin' AND EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = _user_id AND email IN ('techshivam0616@gmail.com', 'niteshprakash555@gmail.com')
    )
  )
$$;
