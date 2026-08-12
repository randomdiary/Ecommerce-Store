insert into storage.buckets (id, name, public)
values ('product-images','product-images',true)
on conflict (id) do nothing;

create policy "public can view product images storage"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "admins upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins update product images"
on storage.objects for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admins delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and public.is_admin());