insert into public.categories(name,slug) values
('Rings','rings'),('Earrings','earrings'),('Necklaces','necklaces'),('Bracelets','bracelets'),('Jewelry Sets','jewelry-sets')
on conflict (slug) do nothing;

insert into public.products(name,slug,description,price,sale_price,sku,stock_quantity,category_id,is_featured,is_new,is_sample)
select 'Aurora Pearl Earrings','aurora-pearl-earrings','Elegant pearl-inspired earrings.',2499,1999,'MS-EAR-001',12,id,true,true,true from public.categories where slug='earrings'
on conflict (slug) do nothing;

insert into public.products(name,slug,description,price,sku,stock_quantity,category_id,is_featured,is_sample)
select 'Noir Gold Ring','noir-gold-ring','Minimal statement ring.',2999,'MS-RNG-001',8,id,true,true from public.categories where slug='rings'
on conflict (slug) do nothing;