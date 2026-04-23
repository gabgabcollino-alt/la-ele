import React from "react";
import { Search, Headphones, ShoppingCart, BadgeCheck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { LOGO_URL } from "../lib/assets";

export default function Header({ onOpenSupport }) {
  const { count, setOpen } = useCart();
  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 backdrop-blur-xl bg-black/70 border-b border-white/10"
    >
      <div className="mx-auto max-w-6xl px-3 md:px-6 py-3 flex items-center gap-3">
        <a href="/" className="flex items-center gap-3 min-w-0" data-testid="brand-home-link">
          <img
            src={LOGO_URL}
            alt="TBX"
            className="w-11 h-11 md:w-12 md:h-12 rounded-lg object-cover ring-1 ring-white/15"
          />
          <div className="flex items-center gap-1 min-w-0">
            <span className="font-bangers text-2xl md:text-3xl tracking-wider text-white truncate">
              Torciblox
            </span>
            <BadgeCheck className="w-5 h-5 text-[#4AA1FF]" aria-hidden />
          </div>
        </a>
        <div className="flex-1" />
        <button
          aria-label="Buscar"
          data-testid="header-search-btn"
          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center tbx-btn-glow"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
        <button
          aria-label="Suporte"
          data-testid="header-support-btn"
          onClick={onOpenSupport}
          className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center tbx-btn-glow"
        >
          <Headphones className="w-4 h-4 text-white" />
        </button>
        <button
          aria-label="Carrinho"
          data-testid="header-cart-btn"
          onClick={() => setOpen(true)}
          className="relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center tbx-btn-glow"
        >
          <ShoppingCart className="w-4 h-4 text-white" />
          {count > 0 && (
            <span
              data-testid="header-cart-count"
              className="absolute -top-1.5 -right-1.5 bg-white text-black text-[10px] font-bold font-body rounded-full min-w-[18px] h-[18px] px-1 grid place-items-center"
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
