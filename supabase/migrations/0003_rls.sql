alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;

create policy "public can view active products" on public.products for select using (is_active = true or public.is_admin());
create policy "public can view categories" on public.categories for select using (true);
create policy "public can view product images" on public.product_images for select using (true);

create policy "users view own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "users update own profile" on public.profiles for update using (auth.uid() = id or public.is_admin());

create policy "users view own orders" on public.orders for select using (auth.uid() = user_id or public.is_admin());
create policy "users view own order items" on public.order_items for select using (
  exists(select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
);

create policy "users manage own wishlist" on public.wishlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "public view reviews" on public.reviews for select using (true);
create policy "users create own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "users manage own reviews" on public.reviews for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

create policy "admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage order items" on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());