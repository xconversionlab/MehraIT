-- MehraIT commerce schema. Authorization is enforced in server functions
-- (role checks + user_id scope). This is the app database, not a second auth store.

create table if not exists profiles (
  user_id text primary key references "user"(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists user_roles (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  role text not null,
  unique (user_id, role)
);

create table if not exists addresses (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  label text not null,
  line1 text not null,
  line2 text,
  area text not null,
  city text not null,
  pincode text not null,
  lat double precision,
  lng double precision,
  contact_name text,
  contact_phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists addresses_user_idx on addresses (user_id);

create table if not exists stores (
  id serial primary key,
  name text not null,
  code text not null unique,
  address text not null,
  city text not null,
  pincode text not null,
  lat double precision not null,
  lng double precision not null,
  radius_km double precision not null default 5,
  opens text not null default '06:00',
  closes text not null default '23:30',
  delivery_fee_paise integer not null default 2500,
  free_above_paise integer not null default 19900,
  active boolean not null default true
);

create table if not exists service_areas (
  id serial primary key,
  name text not null,
  city text not null,
  pincode text not null unique,
  lat double precision not null,
  lng double precision not null,
  active boolean not null default true
);

create table if not exists store_service_areas (
  store_id integer not null references stores(id) on delete cascade,
  area_id integer not null references service_areas(id) on delete cascade,
  primary key (store_id, area_id)
);

create table if not exists categories (
  id serial primary key,
  parent_id integer references categories(id),
  slug text not null unique,
  name text not null,
  blurb text not null default '',
  image_key text,
  sort integer not null default 0,
  visible boolean not null default true,
  archived boolean not null default false
);

create table if not exists products (
  id serial primary key,
  category_id integer not null references categories(id),
  brand text not null,
  name text not null,
  description text not null,
  featured boolean not null default false,
  bestseller boolean not null default false,
  active boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists products_category_idx on products (category_id);

create table if not exists product_variants (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  barcode text,
  mrp_paise integer not null,
  price_paise integer not null,
  unit text not null,
  weight_g integer not null default 0,
  tax_bps integer not null default 0,
  active boolean not null default true
);

create table if not exists product_images (
  id serial primary key,
  product_id integer not null references products(id) on delete cascade,
  url text not null,
  sort integer not null default 0
);

create table if not exists inventory (
  id serial primary key,
  store_id integer not null references stores(id) on delete cascade,
  variant_id integer not null references product_variants(id) on delete cascade,
  qty integer not null default 0,
  low_at integer not null default 8,
  updated_at timestamptz not null default now(),
  unique (store_id, variant_id)
);

create table if not exists inventory_movements (
  id serial primary key,
  store_id integer not null references stores(id),
  variant_id integer not null references product_variants(id),
  delta integer not null,
  reason text not null,
  actor_id text,
  created_at timestamptz not null default now()
);

create table if not exists carts (
  id serial primary key,
  user_id text not null unique references "user"(id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id serial primary key,
  cart_id integer not null references carts(id) on delete cascade,
  variant_id integer not null references product_variants(id),
  qty integer not null,
  unique (cart_id, variant_id)
);

create table if not exists coupons (
  id serial primary key,
  code text not null unique,
  description text not null,
  kind text not null,
  amount integer not null,
  max_discount_paise integer not null default 0,
  min_subtotal_paise integer not null default 0,
  active boolean not null default true,
  archived boolean not null default false
);

create table if not exists coupon_redemptions (
  id serial primary key,
  coupon_id integer not null references coupons(id),
  user_id text not null,
  order_id integer,
  created_at timestamptz not null default now(),
  unique (coupon_id, user_id)
);

create table if not exists banners (
  id serial primary key,
  title text not null,
  subtitle text not null default '',
  tone text not null default 'brand',
  href text not null default '/',
  sort integer not null default 0,
  active boolean not null default true
);

create table if not exists orders (
  id serial primary key,
  public_id text not null unique,
  user_id text not null references "user"(id),
  store_id integer not null references stores(id),
  status text not null,
  address_snapshot jsonb not null,
  subtotal_paise integer not null,
  discount_paise integer not null default 0,
  delivery_fee_paise integer not null default 0,
  tax_paise integer not null default 0,
  payable_paise integer not null,
  coupon_code text,
  payment_method text not null,
  delivery_otp text,
  notes text,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_status_chk check (status in (
    'pending','confirmed','preparing','packed','ready_for_pickup','assigned',
    'picked_up','out_for_delivery','delivered','cancelled','refund_initiated','refunded'
  ))
);
create index if not exists orders_user_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);

create table if not exists order_items (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  variant_id integer references product_variants(id),
  product_id integer,
  name text not null,
  brand text not null,
  sku text not null,
  unit text not null,
  qty integer not null,
  mrp_paise integer not null,
  price_paise integer not null,
  tax_bps integer not null default 0
);

create table if not exists order_status_history (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  status text not null,
  note text,
  actor_id text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  provider text not null,
  method text not null,
  amount_paise integer not null,
  status text not null,
  gateway_order_id text,
  gateway_payment_id text,
  created_at timestamptz not null default now()
);

create table if not exists refunds (
  id serial primary key,
  order_id integer not null references orders(id) on delete cascade,
  payment_id integer references payments(id),
  amount_paise integer not null,
  status text not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists delivery_partners (
  id serial primary key,
  user_id text unique references "user"(id) on delete cascade,
  full_name text not null,
  phone text,
  vehicle text not null default 'bike',
  is_available boolean not null default false,
  active boolean not null default true,
  last_lat double precision,
  last_lng double precision,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists delivery_assignments (
  id serial primary key,
  order_id integer not null unique references orders(id) on delete cascade,
  partner_id integer not null references delivery_partners(id),
  status text not null,
  payout_paise integer not null default 2500,
  assigned_at timestamptz not null default now(),
  picked_at timestamptz,
  delivered_at timestamptz
);

create table if not exists delivery_status_history (
  id serial primary key,
  assignment_id integer not null references delivery_assignments(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, read);

create table if not exists support_tickets (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  subject text not null,
  body text not null,
  status text not null default 'open',
  order_public_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reviews (
  id serial primary key,
  user_id text not null references "user"(id) on delete cascade,
  order_id integer references orders(id) on delete cascade,
  product_id integer references products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (user_id, order_id, product_id)
);

create table if not exists app_settings (
  key text primary key,
  value text not null
);

create table if not exists audit_logs (
  id serial primary key,
  actor_id text,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

insert into stores (name, code, address, city, pincode, lat, lng, radius_km, opens, closes, delivery_fee_paise, free_above_paise)
values
('MehraIT Indiranagar', 'BLR-IND', '100 Feet Road, Indiranagar', 'Bengaluru', '560038', 12.9784, 77.6408, 6, '06:00', '23:30', 2500, 19900),
('MehraIT Bandra', 'BOM-BAN', 'Turner Road, Bandra West', 'Mumbai', '400050', 19.0544, 72.8406, 5, '06:00', '23:30', 2900, 24900);

insert into service_areas (name, city, pincode, lat, lng) values
('Indiranagar', 'Bengaluru', '560038', 12.9784, 77.6408),
('Koramangala', 'Bengaluru', '560034', 12.9352, 77.6245),
('HSR Layout', 'Bengaluru', '560102', 12.9121, 77.6446),
('Jayanagar', 'Bengaluru', '560041', 12.9308, 77.5838),
('Bandra West', 'Mumbai', '400050', 19.0544, 72.8406),
('Khar West', 'Mumbai', '400052', 19.0697, 72.8390),
('Santacruz West', 'Mumbai', '400054', 19.0810, 72.8410);

insert into store_service_areas (store_id, area_id)
select s.id, a.id from stores s join service_areas a
  on (s.code = 'BLR-IND' and a.city = 'Bengaluru')
  or (s.code = 'BOM-BAN' and a.city = 'Mumbai');

insert into categories (slug, name, blurb, image_key, sort) values ('fruits-vegetables', 'Fruits & Vegetables', 'Picked for the morning run', 'fruits-vegetables', 1);
insert into categories (slug, name, blurb, image_key, sort) values ('dairy', 'Dairy, Bread & Eggs', 'Milk, curd, eggs and the daily loaf', 'dairy', 2);
insert into categories (slug, name, blurb, image_key, sort) values ('staples', 'Rice, Atta & Pulses', 'The pantry, weighed and packed', 'staples', 3);
insert into categories (slug, name, blurb, image_key, sort) values ('snacks', 'Snacks', 'Namkeen, chips and biscuits', 'snacks', 4);
insert into categories (slug, name, blurb, image_key, sort) values ('beverages', 'Beverages', 'Water, juice and cold drinks', 'beverages', 5);
insert into categories (slug, name, blurb, image_key, sort) values ('tea', 'Tea & Coffee', 'The kettle shelf', 'tea', 6);
insert into categories (slug, name, blurb, image_key, sort) values ('packaged', 'Packaged Food', 'Sauces, noodles and ready mixes', 'packaged', 7);
insert into categories (slug, name, blurb, image_key, sort) values ('bakery', 'Bakery', 'Baked this morning', 'bakery', 8);
insert into categories (slug, name, blurb, image_key, sort) values ('personal', 'Personal Care', 'Bath and hair', 'personal', 9);
insert into categories (slug, name, blurb, image_key, sort) values ('baby', 'Baby Care', 'Gentle everyday care', 'baby', 10);
insert into categories (slug, name, blurb, image_key, sort) values ('household', 'Household Essentials', 'Foil, bags and the rest', 'household', 11);
insert into categories (slug, name, blurb, image_key, sort) values ('cleaning', 'Cleaning', 'Dishes, floors and surfaces', 'cleaning', 12);
insert into categories (slug, name, blurb, image_key, sort) values ('pet', 'Pet Care', 'Food and treats', 'pet', 13);
insert into categories (slug, name, blurb, image_key, sort) values ('kitchen', 'Kitchen & Home', 'Tools for the kitchen', 'kitchen', 14);
insert into categories (slug, name, blurb, image_key, sort) values ('electronics', 'Electronics', 'Cables and cells', 'electronics', 15);
insert into categories (slug, name, blurb, image_key, sort) values ('beauty', 'Beauty & Wellness', 'Skin and balm', 'beauty', 16);
insert into categories (slug, name, blurb, image_key, sort) values ('stationery', 'Stationery', 'Notebooks and pens', 'stationery', 17);
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'fresh-fruit', 'Fresh fruit', '', 'fresh-fruit', 1 from categories where slug = 'fruits-vegetables';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'vegetables', 'Vegetables', '', 'vegetables', 2 from categories where slug = 'fruits-vegetables';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'herbs', 'Herbs', '', 'herbs', 3 from categories where slug = 'fruits-vegetables';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'milk', 'Milk & curd', '', 'milk', 1 from categories where slug = 'dairy';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'eggs-bread', 'Eggs & bread', '', 'eggs-bread', 2 from categories where slug = 'dairy';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'rice', 'Rice', '', 'rice', 1 from categories where slug = 'staples';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'atta', 'Atta & flours', '', 'atta', 2 from categories where slug = 'staples';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'pulses', 'Pulses', '', 'pulses', 3 from categories where slug = 'staples';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'chips', 'Chips & namkeen', '', 'chips', 1 from categories where slug = 'snacks';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'cold-drinks', 'Cold drinks', '', 'cold-drinks', 1 from categories where slug = 'beverages';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'tea-leaf', 'Tea', '', 'tea-leaf', 1 from categories where slug = 'tea';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'coffee', 'Coffee', '', 'coffee', 1 from categories where slug = 'tea';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'soap', 'Bath', '', 'soap', 1 from categories where slug = 'personal';
insert into categories (parent_id, slug, name, blurb, image_key, sort) select id, 'kitchen-clean', 'Kitchen clean', '', 'kitchen-clean', 1 from categories where slug = 'cleaning';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Hybrid tomatoes', 'Firm tomatoes for salads and everyday gravies.', false, true from categories where slug = 'vegetables';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'MH-TOM-500', 'MH-TOM-500', 3600, 2900, '500 g', 500, 0 from products p where p.name = 'Hybrid tomatoes' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Nashik onion', 'Sharp onions, sorted and bagged.', false, true from categories where slug = 'vegetables';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 kg', 'MH-ONI-1K', 'MH-ONI-1K', 4400, 3800, '1 kg', 1000, 0 from products p where p.name = 'Nashik onion' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Baby potato', 'Waxy potatoes that hold their shape.', false, false from categories where slug = 'vegetables';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 kg', 'MH-POT-1K', 'MH-POT-1K', 4200, 3600, '1 kg', 1000, 0 from products p where p.name = 'Baby potato' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Robusta banana', 'A hand of six, ripe for today.', true, true from categories where slug = 'fresh-fruit';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '6 pcs', 'MH-BAN-6', 'MH-BAN-6', 4900, 4200, '6 pcs', 700, 0 from products p where p.name = 'Robusta banana' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Nagpur orange', 'Juicy oranges by the half kilo.', false, false from categories where slug = 'fresh-fruit';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'MH-ORG-500', 'MH-ORG-500', 7000, 5900, '500 g', 500, 0 from products p where p.name = 'Nagpur orange' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Coriander bunch', 'Fresh coriander, stems on.', false, false from categories where slug = 'herbs';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 bunch', 'MH-COR-1', 'MH-COR-1', 1800, 1500, '1 bunch', 80, 0 from products p where p.name = 'Coriander bunch' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Baby spinach', 'Washed leaves for a quick saute.', true, false from categories where slug = 'herbs';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 g', 'MH-SPI-200', 'MH-SPI-200', 3900, 3200, '200 g', 200, 0 from products p where p.name = 'Baby spinach' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Toned milk', 'Homogenised toned milk for tea and cereal.', false, true from categories where slug = 'milk';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 ml', 'DW-MILK-500', 'DW-MILK-500', 3200, 2800, '500 ml', 500, 0 from products p where p.name = 'Toned milk' and p.brand = 'Dewdrop';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 L', 'DW-MILK-1L', 'DW-MILK-1L', 6000, 5400, '1 L', 1000, 0 from products p where p.name = 'Toned milk' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Set dahi', 'Thick set curd in a sealed cup.', false, false from categories where slug = 'milk';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '400 g', 'DW-DAH-400', 'DW-DAH-400', 4500, 4000, '400 g', 400, 0 from products p where p.name = 'Set dahi' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Malai paneer', 'Soft paneer block for a weeknight gravy.', true, false from categories where slug = 'milk';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 g', 'DW-PAN-200', 'DW-PAN-200', 9500, 8900, '200 g', 200, 0 from products p where p.name = 'Malai paneer' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Farm eggs', 'Six brown eggs, checked and packed.', false, true from categories where slug = 'eggs-bread';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '6 pcs', 'DW-EGG-6', 'DW-EGG-6', 7200, 6400, '6 pcs', 360, 0 from products p where p.name = 'Farm eggs' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'White sandwich bread', 'Soft loaf for toast and packed lunches.', false, false from categories where slug = 'eggs-bread';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '400 g', 'HT-BRD-400', 'HT-BRD-400', 4500, 4000, '400 g', 400, 0 from products p where p.name = 'White sandwich bread' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Kaveri', 'Sona masoori rice', 'Light everyday rice.', false, true from categories where slug = 'rice';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 kg', 'KV-RICE-1', 'KV-RICE-1', 8200, 7400, '1 kg', 1000, 0 from products p where p.name = 'Sona masoori rice' and p.brand = 'Kaveri';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '5 kg', 'KV-RICE-5', 'KV-RICE-5', 39000, 34900, '5 kg', 5000, 0 from products p where p.name = 'Sona masoori rice' and p.brand = 'Kaveri';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Kaveri', 'Chakki atta', 'Stoneground wheat flour.', false, true from categories where slug = 'atta';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 kg', 'KV-ATTA-1', 'KV-ATTA-1', 5800, 5200, '1 kg', 1000, 0 from products p where p.name = 'Chakki atta' and p.brand = 'Kaveri';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '5 kg', 'KV-ATTA-5', 'KV-ATTA-5', 27500, 24900, '5 kg', 5000, 0 from products p where p.name = 'Chakki atta' and p.brand = 'Kaveri';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Kaveri', 'Besan', 'Fine gram flour for pakoras and batter.', false, false from categories where slug = 'atta';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'KV-BES-500', 'KV-BES-500', 7000, 6400, '500 g', 500, 0 from products p where p.name = 'Besan' and p.brand = 'Kaveri';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Kaveri', 'Toor dal', 'Polished split pigeon peas.', false, false from categories where slug = 'pulses';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'KV-TOOR-500', 'KV-TOOR-500', 9400, 8600, '500 g', 500, 0 from products p where p.name = 'Toor dal' and p.brand = 'Kaveri';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Kaveri', 'Moong dal', 'Yellow split moong, quick to cook.', false, false from categories where slug = 'pulses';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'KV-MOONG-500', 'KV-MOONG-500', 9800, 8900, '500 g', 500, 0 from products p where p.name = 'Moong dal' and p.brand = 'Kaveri';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Nandan', 'Salted potato chips', 'Thin, salted, and loud in the bag.', false, true from categories where slug = 'chips';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '52 g', 'ND-CHIP-52', 'ND-CHIP-52', 2000, 1800, '52 g', 52, 500 from products p where p.name = 'Salted potato chips' and p.brand = 'Nandan';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Nandan', 'Masala peanuts', 'Roasted peanuts with a warm masala coat.', false, false from categories where slug = 'chips';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 g', 'ND-PNUT-200', 'ND-PNUT-200', 6500, 5500, '200 g', 200, 500 from products p where p.name = 'Masala peanuts' and p.brand = 'Nandan';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'Digestive biscuits', 'Wheat biscuits for tea.', false, false from categories where slug = 'snacks';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '100 g', 'HT-BIS-100', 'HT-BIS-100', 3000, 2500, '100 g', 100, 500 from products p where p.name = 'Digestive biscuits' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Mineral water', 'Still water in a sealed bottle.', false, false from categories where slug = 'cold-drinks';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 L', 'DW-WAT-1', 'DW-WAT-1', 2000, 1800, '1 L', 1000, 500 from products p where p.name = 'Mineral water' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Nandan', 'Orange beverage', 'A chilled orange drink for the afternoon.', false, false from categories where slug = 'cold-drinks';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '750 ml', 'ND-ORG-750', 'ND-ORG-750', 4000, 3500, '750 ml', 750, 500 from products p where p.name = 'Orange beverage' and p.brand = 'Nandan';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Tender coconut water', 'Not from concentrate. Sip cold.', true, false from categories where slug = 'beverages';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 ml', 'MH-COCO-200', 'MH-COCO-200', 4500, 4000, '200 ml', 200, 500 from products p where p.name = 'Tender coconut water' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'Assam dust tea', 'Strong dust tea for a full kettle.', false, false from categories where slug = 'tea-leaf';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '250 g', 'NL-TEA-250', 'NL-TEA-250', 14500, 12900, '250 g', 250, 500 from products p where p.name = 'Assam dust tea' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'Instant coffee', 'A small jar for the weekday cup.', true, false from categories where slug = 'coffee';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '50 g', 'NL-COF-50', 'NL-COF-50', 16500, 14900, '50 g', 50, 500 from products p where p.name = 'Instant coffee' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'Tomato ketchup', 'A short bottle for eggs and snacks.', false, false from categories where slug = 'packaged';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 g', 'HT-KET-200', 'HT-KET-200', 6500, 5500, '200 g', 200, 500 from products p where p.name = 'Tomato ketchup' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Roasted poha', 'Thick poha, ready to temper.', false, false from categories where slug = 'packaged';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '200 g', 'MH-POHA-200', 'MH-POHA-200', 4000, 3500, '200 g', 200, 0 from products p where p.name = 'Roasted poha' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'Masala wheat noodles', 'A single nest with a masala sachet.', false, true from categories where slug = 'packaged';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '70 g', 'HT-NOO-70', 'HT-NOO-70', 1500, 1400, '70 g', 70, 500 from products p where p.name = 'Masala wheat noodles' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'Butter croissant', 'Laminated, baked this morning.', false, false from categories where slug = 'bakery';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 pc', 'HT-CRO-1', 'HT-CRO-1', 5500, 4900, '1 pc', 60, 500 from products p where p.name = 'Butter croissant' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Hearth', 'Fudge brownie', 'A dense square, wrapped to go.', true, false from categories where slug = 'bakery';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 pc', 'HT-BRW-1', 'HT-BRW-1', 7000, 6000, '1 pc', 80, 500 from products p where p.name = 'Fudge brownie' and p.brand = 'Hearth';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Neem bathing bar', 'A simple neem soap.', false, false from categories where slug = 'soap';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '125 g', 'DW-SOAP-125', 'DW-SOAP-125', 4000, 3500, '125 g', 125, 1800 from products p where p.name = 'Neem bathing bar' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Herbal shampoo', 'Daily shampoo in a small bottle.', false, false from categories where slug = 'personal';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '180 ml', 'DW-SHAM-180', 'DW-SHAM-180', 12900, 10900, '180 ml', 180, 1800 from products p where p.name = 'Herbal shampoo' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Littlenest', 'Gentle wipes', 'Fragrance-light wipes for nappy changes.', false, false from categories where slug = 'baby';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '20 wipes', 'LN-WIP-20', 'LN-WIP-20', 9900, 8900, '20 wipes', 200, 1800 from products p where p.name = 'Gentle wipes' and p.brand = 'Littlenest';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Littlenest', 'Newborn diapers', 'A small pack, soft waistband.', false, false from categories where slug = 'baby';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '8 pcs', 'LN-DIA-8', 'LN-DIA-8', 19900, 17900, '8 pcs', 400, 1800 from products p where p.name = 'Newborn diapers' and p.brand = 'Littlenest';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Sparkline', 'Aluminium foil', 'Ten metres for leftovers and baking.', false, false from categories where slug = 'household';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '10 m', 'SP-FOIL-10', 'SP-FOIL-10', 8500, 7500, '10 m', 120, 1800 from products p where p.name = 'Aluminium foil' and p.brand = 'Sparkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Sparkline', 'Garbage bags', 'Medium bags with a drawstring.', false, false from categories where slug = 'household';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '15 pcs', 'SP-BAG-15', 'SP-BAG-15', 7000, 6200, '15 pcs', 200, 1800 from products p where p.name = 'Garbage bags' and p.brand = 'Sparkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Sparkline', 'Dishwash liquid', 'Cuts grease, lemon scent.', false, true from categories where slug = 'kitchen-clean';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 ml', 'SP-DISH-500', 'SP-DISH-500', 9900, 8900, '500 ml', 500, 1800 from products p where p.name = 'Dishwash liquid' and p.brand = 'Sparkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Sparkline', 'Floor cleaner', 'A litre for tile and stone.', false, false from categories where slug = 'cleaning';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 L', 'SP-FLR-1', 'SP-FLR-1', 14500, 12900, '1 L', 1000, 1800 from products p where p.name = 'Floor cleaner' and p.brand = 'Sparkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'Adult dog food', 'Everyday kibble for adult dogs.', false, false from categories where slug = 'pet';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '500 g', 'NL-DOG-500', 'NL-DOG-500', 18900, 16900, '500 g', 500, 1800 from products p where p.name = 'Adult dog food' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'Cat treats', 'Crunchy bites. Often the first to sell out.', false, false from categories where slug = 'pet';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '50 g', 'NL-CAT-50', 'NL-CAT-50', 7900, 6900, '50 g', 50, 1800 from products p where p.name = 'Cat treats' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Mehra', 'Steel tumbler', 'A single stainless tumbler.', false, false from categories where slug = 'kitchen';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 pc', 'MH-TUM-1', 'MH-TUM-1', 14900, 12900, '1 pc', 180, 1800 from products p where p.name = 'Steel tumbler' and p.brand = 'Mehra';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Sparkline', 'Scrub pads', 'Three pads for pans and tiffin.', false, false from categories where slug = 'kitchen';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '3 pcs', 'SP-SCR-3', 'SP-SCR-3', 3500, 2900, '3 pcs', 40, 1800 from products p where p.name = 'Scrub pads' and p.brand = 'Sparkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'USB-C cable', 'One metre, charge and sync.', false, false from categories where slug = 'electronics';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '1 m', 'NL-USB-1', 'NL-USB-1', 29900, 24900, '1 m', 40, 1800 from products p where p.name = 'USB-C cable' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Northline', 'AA cells', 'A blister of four.', false, false from categories where slug = 'electronics';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '4 pcs', 'NL-AA-4', 'NL-AA-4', 12000, 9900, '4 pcs', 80, 1800 from products p where p.name = 'AA cells' and p.brand = 'Northline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Aloe soothing gel', 'Plain aloe gel, no glitter.', false, false from categories where slug = 'beauty';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '100 ml', 'DW-ALOE-100', 'DW-ALOE-100', 14900, 12900, '100 ml', 100, 1800 from products p where p.name = 'Aloe soothing gel' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Dewdrop', 'Lip balm', 'A small stick for dry weather.', false, false from categories where slug = 'beauty';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '4.5 g', 'DW-LIP-45', 'DW-LIP-45', 7900, 6900, '4.5 g', 5, 1800 from products p where p.name = 'Lip balm' and p.brand = 'Dewdrop';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Inkline', 'A4 notebook', 'Eighty ruled pages, soft cover.', false, false from categories where slug = 'stationery';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '80 pages', 'INK-NB-80', 'INK-NB-80', 6000, 4900, '80 pages', 180, 1200 from products p where p.name = 'A4 notebook' and p.brand = 'Inkline';
insert into products (category_id, brand, name, description, featured, bestseller) select id, 'Inkline', 'Gel pens', 'A pair of black gel pens.', false, false from categories where slug = 'stationery';
insert into product_variants (product_id, name, sku, barcode, mrp_paise, price_paise, unit, weight_g, tax_bps) select p.id, '2 pcs', 'INK-PEN-2', 'INK-PEN-2', 3000, 2500, '2 pcs', 20, 1200 from products p where p.name = 'Gel pens' and p.brand = 'Inkline';
insert into inventory (store_id, variant_id, qty, low_at)
select s.id, v.id,
  case
    when v.sku = 'NL-CAT-50' then 0
    when v.sku = 'MH-ONI-1K' and s.code = 'BLR-IND' then 3
    when v.id % 11 = 0 then 5
    else 18 + (v.id % 15)
  end,
  8
from stores s cross join product_variants v;

insert into banners (title, subtitle, tone, href, sort) values
('Morning mandi', 'Fruit and vegetables, packed for the next run.', 'brand', '/c/fruits-vegetables', 1),
('The dairy run', 'Milk, curd, eggs and bread before breakfast.', 'ink', '/c/dairy', 2),
('Stock the pantry', 'Rice, atta and dal in the sizes you actually finish.', 'cream', '/c/staples', 3);

insert into coupons (code, description, kind, amount, max_discount_paise, min_subtotal_paise) values
('MEHRA50', 'Rs 50 off on orders above Rs 199', 'flat', 5000, 5000, 19900),
('FRESH10', '10% off up to Rs 80 on orders above Rs 149', 'percent', 10, 8000, 14900);

insert into app_settings (key, value) values
('business_name', 'MehraIT'),
('tagline', 'Shop smart. Live better.'),
('support_phone', '1800 202 4480'),
('support_email', 'care@mehrait.in'),
('gstin', '29AAAAA0000A1Z5'),
('promise', '8–12 min'),
('popular_searches', 'milk,banana,atta,bread,eggs,rice,paneer,onion'),
('payout_paise', '2500'),
('razorpay_note', 'Cash on delivery is live. Razorpay sandbox capture runs only when server keys are set.');

