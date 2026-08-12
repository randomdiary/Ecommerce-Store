import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../types";
import { useCart } from "../store/cart";

export default function ProductCard({p}:{p:Product}){
 const add=useCart(s=>s.add);
 return <article className="card group">
  <Link to={`/product/${p.id}`} className="block overflow-hidden bg-stone-100"><img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"/></Link>
  <div className="p-5"><div className="mb-2 flex items-start justify-between gap-2"><div><p className="text-xs uppercase tracking-widest text-stone-400">{p.category}</p><Link to={`/product/${p.id}`} className="mt-1 block font-display text-lg">{p.name}</Link></div><button aria-label="Wishlist"><Heart size={18}/></button></div>
  <div className="flex items-center justify-between"><div>{p.sale_price?<><span className="font-semibold">Rs. {p.sale_price.toLocaleString()}</span><span className="ml-2 text-sm text-stone-400 line-through">Rs. {p.price.toLocaleString()}</span></>:<span className="font-semibold">Rs. {p.price.toLocaleString()}</span>}</div><button className="btn btn-light !rounded-xl !p-2" onClick={()=>add(p)}><ShoppingBag size={18}/></button></div></div>
 </article>
}