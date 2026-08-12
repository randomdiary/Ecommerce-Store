import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../types";

type Item = Product & { quantity:number };
type CartState = { items:Item[]; add:(p:Product)=>void; remove:(id:string)=>void; clear:()=>void; total:()=>number };

export const useCart = create<CartState>()(persist((set,get)=>({
  items:[],
  add:(p)=>set(s=>({items:s.items.some(i=>i.id===p.id)?s.items.map(i=>i.id===p.id?{...i,quantity:i.quantity+1}:i):[...s.items,{...p,quantity:1}]})),
  remove:(id)=>set(s=>({items:s.items.flatMap(i=>i.id===id?(i.quantity>1?[{...i,quantity:i.quantity-1}]:[]):[i])})),
  clear:()=>set({items:[]}),
  total:()=>get().items.reduce((sum,i)=>sum+(i.sale_price ?? i.price)*i.quantity,0)
}),{name:"ms-collection-cart"}));