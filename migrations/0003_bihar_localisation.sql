-- Bihar-first demo localisation. This migration is applied once on deploy.
-- Seed locations are sample service pins; confirm the client's actual launch
-- city, coverage, timings, tax details and contact information before launch.

-- Replace the original out-of-state demo stores with Bihar locations.
update stores
set name = 'MehraIT Patna',
    code = 'BR-PAT',
    address = 'Patna GPO area, Patna, Bihar',
    city = 'Patna',
    pincode = '800001',
    lat = 25.6093,
    lng = 85.1376,
    radius_km = 8,
    delivery_fee_paise = 2500,
    free_above_paise = 19900,
    active = true
where code = 'BLR-IND';

update stores
set name = 'MehraIT Muzaffarpur',
    code = 'BR-MUZ',
    address = 'Muzaffarpur Head Office area, Muzaffarpur, Bihar',
    city = 'Muzaffarpur',
    pincode = '842001',
    lat = 26.1209,
    lng = 85.3647,
    radius_km = 6,
    delivery_fee_paise = 2500,
    free_above_paise = 19900,
    active = true
where code = 'BOM-BAN';

insert into stores (
  name, code, address, city, pincode, lat, lng, radius_km,
  opens, closes, delivery_fee_paise, free_above_paise, active
)
values (
  'MehraIT Gaya', 'BR-GAY', 'Gaya Head Office area, Gaya, Bihar',
  'Gaya', '823001', 24.7955, 84.9994, 6,
  '06:00', '23:30', 2500, 19900, true
)
on conflict (code) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  pincode = excluded.pincode,
  lat = excluded.lat,
  lng = excluded.lng,
  radius_km = excluded.radius_km,
  active = true;

-- India Post-verified Bihar demo PINs:
-- Patna GPO 800001, Kankarbagh/Lohia Nagar 800020, Patliputra 800013,
-- Patna City 800008, Muzaffarpur H.O. 842001 and Gaya H.O. 823001.
update service_areas
set name = 'Patna GPO',
    city = 'Patna',
    pincode = '800001',
    lat = 25.6093,
    lng = 85.1376,
    active = true
where pincode = '560038';

update service_areas
set name = 'Kankarbagh',
    city = 'Patna',
    pincode = '800020',
    lat = 25.5941,
    lng = 85.1612,
    active = true
where pincode = '560034';

update service_areas
set name = 'Patliputra',
    city = 'Patna',
    pincode = '800013',
    lat = 25.6340,
    lng = 85.0975,
    active = true
where pincode = '560102';

update service_areas
set name = 'Patna City',
    city = 'Patna',
    pincode = '800008',
    lat = 25.6107,
    lng = 85.2125,
    active = true
where pincode = '560041';

update service_areas
set name = 'Muzaffarpur H.O.',
    city = 'Muzaffarpur',
    pincode = '842001',
    lat = 26.1209,
    lng = 85.3647,
    active = true
where pincode = '400050';

update service_areas
set name = 'Gaya H.O.',
    city = 'Gaya',
    pincode = '823001',
    lat = 24.7955,
    lng = 84.9994,
    active = true
where pincode = '400052';

update service_areas
set active = false
where pincode = '400054';

-- Match each service area to its Bihar store and add the new Gaya store links.
update store_service_areas ssa
set store_id = s.id
from service_areas a
join stores s on s.code = case
  when a.city = 'Patna' then 'BR-PAT'
  when a.city = 'Muzaffarpur' then 'BR-MUZ'
  when a.city = 'Gaya' then 'BR-GAY'
end
where ssa.area_id = a.id
  and a.city in ('Patna', 'Muzaffarpur', 'Gaya');

insert into store_service_areas (store_id, area_id)
select s.id, a.id
from service_areas a
join stores s on s.code = case
  when a.city = 'Patna' then 'BR-PAT'
  when a.city = 'Muzaffarpur' then 'BR-MUZ'
  when a.city = 'Gaya' then 'BR-GAY'
end
where a.active = true
  and a.city in ('Patna', 'Muzaffarpur', 'Gaya')
on conflict do nothing;

-- Give the added Gaya store stock for every active catalogue variant.
insert into inventory (store_id, variant_id, qty, low_at)
select s.id, v.id, 20 + (v.id % 12), 8
from stores s
cross join product_variants v
where s.code = 'BR-GAY'
on conflict (store_id, variant_id) do nothing;

-- Add a visible Bihar-specific category with regional staples and treats.
insert into categories (slug, name, blurb, image_key, sort, visible, archived)
values (
  'bihar-favourites',
  'Bihar Favourites',
  'Regional staples, Mithila makhana and traditional treats',
  'bihar-favourites',
  18,
  true,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  blurb = excluded.blurb,
  visible = true,
  archived = false;

insert into categories (parent_id, slug, name, blurb, image_key, sort, visible, archived)
select id, 'sattu-litti', 'Sattu & Litti Essentials', 'The essentials for a Bihar classic', 'sattu-litti', 1, true, false
from categories where slug = 'bihar-favourites'
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  blurb = excluded.blurb,
  visible = true,
  archived = false;

insert into categories (parent_id, slug, name, blurb, image_key, sort, visible, archived)
select id, 'mithila-makhana', 'Mithila Makhana', 'Makhana from the Mithila region', 'mithila-makhana', 2, true, false
from categories where slug = 'bihar-favourites'
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  blurb = excluded.blurb,
  visible = true,
  archived = false;

insert into categories (parent_id, slug, name, blurb, image_key, sort, visible, archived)
select id, 'bihari-sweets', 'Bihari Sweets', 'Traditional sweets and teatime favourites', 'bihari-sweets', 3, true, false
from categories where slug = 'bihar-favourites'
on conflict (slug) do update set
  parent_id = excluded.parent_id,
  name = excluded.name,
  blurb = excluded.blurb,
  visible = true,
  archived = false;

-- Localise a few hero products while retaining the existing demo catalogue IDs.
update products
set brand = 'Bihar Harvest',
    name = 'Malbhog Banana',
    description = 'A familiar regional banana variety for everyday snacking.'
where id = 4;

update products
set brand = 'Mithila Farms',
    name = 'Muzaffarpur Litchi',
    description = 'Seasonal litchi from Muzaffarpur, Bihar. Availability depends on the season.'
where id = 5;

update products
set category_id = (select id from categories where slug = 'sattu-litti'),
    brand = 'Bihar Harvest',
    name = 'Litti Atta',
    description = 'Whole-wheat flour for traditional Bihari litti.'
where id = 14;

update products
set category_id = (select id from categories where slug = 'sattu-litti'),
    brand = 'Bihar Harvest',
    name = 'Chana Sattu',
    description = 'Roasted gram flour for sattu sharbat, parathas and everyday Bihar meals.'
where id = 15;

update products
set category_id = (select id from categories where slug = 'mithila-makhana'),
    brand = 'Mithila Harvest',
    name = 'Mithila Makhana',
    description = 'Makhana, a much-loved speciality of the Mithila region.'
where id = 18;

update products
set category_id = (select id from categories where slug = 'mithila-makhana'),
    brand = 'Mithila Harvest',
    name = 'Roasted Masala Makhana',
    description = 'Crunchy roasted makhana with a light masala coating.'
where id = 19;

update products
set category_id = (select id from categories where slug = 'bihari-sweets'),
    brand = 'Bihar Sweets',
    name = 'Bihari Thekua',
    description = 'A traditional Bihari wheat-and-jaggery sweet for tea time.'
where id = 20;

update products
set category_id = (select id from categories where slug = 'rice'),
    brand = 'Bihar Harvest',
    name = 'Chura (Flattened Rice)',
    description = 'Flattened rice for dahi-chura, a familiar Bihar breakfast.'
where id = 27;

-- Keep pack details and stock quantities aligned with the revised product names.
update product_variants set sku = 'BR-LITCHI-500', barcode = 'BR-LITCHI-500'
where id = 5;

update product_variants set sku = 'BR-LITTI-1', barcode = 'BR-LITTI-1'
where id = 16;

update product_variants set sku = 'BR-LITTI-5', barcode = 'BR-LITTI-5'
where id = 17;

update product_variants set sku = 'BR-SAT-500', barcode = 'BR-SAT-500'
where id = 18;

update product_variants
set name = '100 g', unit = '100 g', weight_g = 100,
    mrp_paise = 19900, price_paise = 17900,
    sku = 'BR-MAK-100', barcode = 'BR-MAK-100'
where id = 21;

update product_variants
set mrp_paise = 9900, price_paise = 8900,
    sku = 'BR-MAK-MAS-200', barcode = 'BR-MAK-MAS-200'
where id = 22;

update product_variants set sku = 'BR-THEKUA-100', barcode = 'BR-THEKUA-100'
where id = 23;

update product_variants
set name = '500 g', unit = '500 g', weight_g = 500,
    sku = 'BR-CHURA-500', barcode = 'BR-CHURA-500'
where id = 30;

-- Bihar-led banners, offers and neutral contact/legal placeholders.
update banners set
  title = 'Bihar fresh picks',
  subtitle = 'Fresh vegetables and seasonal fruit for everyday cooking.',
  tone = 'brand',
  href = '/c/fruits-vegetables',
  sort = 1,
  active = true
where id = 1;

update banners set
  title = 'Mithila favourites',
  subtitle = 'Discover makhana and regional pantry favourites.',
  tone = 'ink',
  href = '/c/bihar-favourites',
  sort = 2,
  active = true
where id = 2;

update banners set
  title = 'Litti-chokha essentials',
  subtitle = 'Sattu, litti atta and the everyday pantry.',
  tone = 'cream',
  href = '/c/bihar-favourites',
  sort = 3,
  active = true
where id = 3;

update coupons set code = 'BIHAR50', description = 'Rs 50 off on orders above Rs 199'
where code = 'MEHRA50';

update coupons set code = 'BIHAR10', description = '10% off up to Rs 80 on orders above Rs 149'
where code = 'FRESH10';

insert into app_settings (key, value) values
  ('tagline', 'Everyday essentials. Bihar favourites.'),
  ('popular_searches', 'sattu,makhana,litti atta,chura,litchi,milk,rice,vegetables'),
  ('promise', '30–45 min'),
  ('support_phone', ''),
  ('support_email', ''),
  ('gstin', '')
on conflict (key) do update set value = excluded.value;
