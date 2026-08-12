import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../store/cart";

export default function Header(){
  const [open,setOpen]=useState(false);
  const count=useCart(s=>s.items.reduce((n,i)=>n+i.quantity,0));
  return <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#faf8f3]/95 backdrop-blur">
    <div className="container flex h-20 items-center justify-between">
      <Link to="/" className="font-display text-2xl tracking-wide">M.S <span className="text-champagne">Collection</span></Link>
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <Link to="/">Home</Link><Link to="/shop">Shop</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link>
      </nav>
      <div className="flex items-center gap-4">
        <Link to="/account" aria-label="Account">Account</Link>
        <Link to="/cart" className="relative" aria-label="Cart"><ShoppingBag size={20}/>{count>0&&<span className="absolute -right-3 -top-3 rounded-full bg-black px-1.5 text-xs text-white">{count}</span>}</Link>
        <button className="md:hidden" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
      </div>
    </div>
    {open&&<div className="border-t bg-[#faf8f3] p-5 md:hidden"><div className="container grid gap-4"><Link onClick={()=>setOpen(false)} to="/">Home</Link><Link onClick={()=>setOpen(false)} to="/shop">Shop</Link><Link onClick={()=>setOpen(false)} to="/about">About</Link><Link onClick={()=>setOpen(false)} to="/contact">Contact</Link></div></div>}
  </header>
}