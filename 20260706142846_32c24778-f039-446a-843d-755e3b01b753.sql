
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending','processing','shipped','delivered','cancelled');

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- ============ AUTO CREATE PROFILE + DEFAULT ROLE ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ updated_at helper ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INT NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  specs JSONB,
  featured BOOLEAN NOT NULL DEFAULT false,
  trending BOOLEAN NOT NULL DEFAULT false,
  flash_sale BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CART ============
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  saved_for_later BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cart" ON public.cart_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ WISHLIST ============
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wishlist" ON public.wishlist_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shipping_address JSONB NOT NULL,
  payment_method TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  order_status order_status NOT NULL DEFAULT 'pending',
  coupon_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own orders update" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  title TEXT NOT NULL,
  image TEXT,
  price NUMERIC(10,2) NOT NULL,
  quantity INT NOT NULL
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items via order" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order items insert own" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()));

-- ============ SEED CATEGORIES ============
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Audio', 'audio', 'Premium headphones, earbuds and speakers', 'https://images.unsplash.com/photo-1518444025243-1c58c6b8b1cc?w=800'),
('Wearables', 'wearables', 'Smart watches and fitness trackers', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'),
('Cameras', 'cameras', 'Mirrorless, DSLR and action cameras', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
('Laptops', 'laptops', 'Ultrabooks and workstations', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'),
('Phones', 'phones', 'Latest flagship smartphones', 'https://images.unsplash.com/photo-1512499617640-c2f999098c72?w=800'),
('Home', 'home', 'Smart home and lifestyle', 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800');

-- ============ SEED PRODUCTS ============
DO $$
DECLARE
  cat_audio UUID; cat_wear UUID; cat_cam UUID; cat_lap UUID; cat_phone UUID; cat_home UUID;
BEGIN
  SELECT id INTO cat_audio FROM public.categories WHERE slug='audio';
  SELECT id INTO cat_wear FROM public.categories WHERE slug='wearables';
  SELECT id INTO cat_cam FROM public.categories WHERE slug='cameras';
  SELECT id INTO cat_lap FROM public.categories WHERE slug='laptops';
  SELECT id INTO cat_phone FROM public.categories WHERE slug='phones';
  SELECT id INTO cat_home FROM public.categories WHERE slug='home';

  INSERT INTO public.products (title, slug, description, brand, category_id, price, discount_price, images, stock, rating, reviews_count, featured, trending, flash_sale) VALUES
  ('Aurora Wireless Headphones','aurora-wireless-headphones','Studio-grade active noise cancellation with 40h playback and adaptive EQ.','Aurora',cat_audio,349,279,ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=900'],42,4.8,214,true,true,true),
  ('Pulse Earbuds Pro','pulse-earbuds-pro','Compact earbuds with spatial audio and wireless charging case.','Pulse',cat_audio,199,159,ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900'],120,4.6,512,true,false,false),
  ('Nova Studio Speaker','nova-studio-speaker','360° room-filling sound with room correction.','Nova',cat_audio,459,NULL,ARRAY['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900'],18,4.7,88,false,true,false),
  ('Chrono Titan Smartwatch','chrono-titan','Titanium body, GPS, ECG and 10-day battery.','Chrono',cat_wear,529,449,ARRAY['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=900'],36,4.9,342,true,true,false),
  ('Chrono Fit Band','chrono-fit-band','Sleek fitness tracker with sleep and stress tracking.','Chrono',cat_wear,129,99,ARRAY['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900'],210,4.4,780,false,false,true),
  ('Lumen X Mirrorless Camera','lumen-x-mirrorless','45MP full-frame sensor with 8K video and IBIS.','Lumen',cat_cam,2199,1899,ARRAY['https://images.unsplash.com/photo-1519638831568-d9897f54ed69?w=900'],9,4.9,64,true,true,false),
  ('Lumen Action 5','lumen-action-5','Rugged action cam with HyperSmooth stabilization.','Lumen',cat_cam,399,349,ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=900'],76,4.5,411,false,false,true),
  ('Meridian Ultrabook 14','meridian-ultrabook-14','Ultra-thin 14" laptop with all-day battery.','Meridian',cat_lap,1499,1299,ARRAY['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=900'],24,4.7,196,true,true,false),
  ('Meridian Studio 16','meridian-studio-16','Workstation-class 16" laptop with mini-LED display.','Meridian',cat_lap,2599,NULL,ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=900'],14,4.8,132,false,true,false),
  ('Halo Phone 15','halo-phone-15','Flagship phone with periscope zoom and titanium frame.','Halo',cat_phone,1099,999,ARRAY['https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=900'],55,4.7,921,true,true,true),
  ('Halo Phone 15 Mini','halo-phone-15-mini','Compact flagship with the same camera system.','Halo',cat_phone,899,799,ARRAY['https://images.unsplash.com/photo-1580910051074-3eb694886505?w=900'],80,4.5,433,false,false,false),
  ('Vessel Smart Lamp','vessel-smart-lamp','Warm ambient lighting with circadian scenes.','Vessel',cat_home,149,119,ARRAY['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=900'],140,4.4,205,true,false,true),
  ('Vessel Aroma Diffuser','vessel-aroma-diffuser','Ceramic diffuser with app-controlled scent scenes.','Vessel',cat_home,89,69,ARRAY['https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=900'],210,4.3,140,false,false,false),
  ('Aurora Studio Mic','aurora-studio-mic','Broadcast-quality USB-C condenser microphone.','Aurora',cat_audio,229,189,ARRAY['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=900'],60,4.6,301,false,true,false),
  ('Pulse On-Ear','pulse-on-ear','Everyday on-ear headphones with 30h battery.','Pulse',cat_audio,129,99,ARRAY['https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=900'],150,4.2,540,false,false,true),
  ('Chrono Sport 2','chrono-sport-2','GPS running watch with route mapping.','Chrono',cat_wear,299,249,ARRAY['https://images.unsplash.com/photo-1523395243481-163f8f6155ab?w=900'],90,4.5,220,false,true,false),
  ('Lumen 50mm f/1.4','lumen-50mm','Fast prime lens for portrait and low light.','Lumen',cat_cam,849,749,ARRAY['https://images.unsplash.com/photo-1606986628253-0f31f74f22f6?w=900'],22,4.8,74,false,false,false),
  ('Meridian Book Air','meridian-book-air','Fanless 13" laptop for on-the-go work.','Meridian',cat_lap,1099,949,ARRAY['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=900'],38,4.6,180,false,false,true),
  ('Halo Buds','halo-buds','Companion earbuds tuned for Halo phones.','Halo',cat_phone,149,119,ARRAY['https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=900'],200,4.3,95,false,false,false),
  ('Vessel Robot Vacuum','vessel-robot-vacuum','LIDAR mapping vacuum with self-empty base.','Vessel',cat_home,699,549,ARRAY['https://images.unsplash.com/photo-1567016432779-094069958ea5?w=900'],25,4.6,142,true,true,true),
  ('Nova Soundbar 5.1','nova-soundbar','Dolby Atmos soundbar with wireless subwoofer.','Nova',cat_audio,799,649,ARRAY['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=900'],30,4.7,88,true,false,false),
  ('Chrono Kids','chrono-kids','GPS smartwatch designed for children.','Chrono',cat_wear,199,159,ARRAY['https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900'],110,4.2,60,false,false,false),
  ('Lumen Compact Z','lumen-compact-z','Pocket compact camera with 1" sensor.','Lumen',cat_cam,899,799,ARRAY['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900'],40,4.6,55,false,true,false),
  ('Halo Tab 11','halo-tab-11','11" tablet with pencil support and OLED.','Halo',cat_phone,749,649,ARRAY['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900'],60,4.6,120,false,true,true);
END $$;
