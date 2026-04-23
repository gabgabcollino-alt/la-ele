import React from "react";
import { ShoppingBasket } from "lucide-react";
import { formatBRL } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Lightning } from "./Lightning";
import { LOGO_URL } from "../lib/assets";

const CATEGORY_BG = {
  servicos:
    "linear-gradient(135deg, rgba(30,30,30,0.9), rgba(10,10,10,0.95))",
  brasas:
    "linear-gradient(135deg, rgba(40,15,5,0.9), rgba(10,10,10,0.95))",
  sistema:
    "linear-gradient(135deg, rgba(15,20,40,0.9), rgba(10,10,10,0.95))",
  fardamentos:
    "linear-gradient(135deg, rgba(35,35,35,0.9), rgba(10,10,10,0.95))",
  itens_mensais:
    "linear-gradient(135deg, rgba(25,25,25,0.9), rgba(10,10,10,0.95))",
  itens_30:
    "linear-gradient(135deg, rgba(25,25,25,0.9), rgba(10,10,10,0.95))",
  itens_wipe:
    "linear-gradient(135deg, rgba(50,10,10,0.9), rgba(10,10,10,0.95))",
  acesso:
    "linear-gradient(135deg, rgba(20,15,40,0.9), rgba(10,10,10,0.95))",
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const bg = CATEGORY_BG[product.category] || CATEGORY_BG.servicos;
  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="tbx-card relative rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden group"
    >
      {/* Image panel */}
      <div
        className="relative h-40 md:h-48 overflow-hidden"
        style={{ background: bg }}
      >
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-screen"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1605602922835-a08452b4179d?q=80&w=800&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <img
          src={LOGO_URL}
          alt=""
          className="absolute top-2 left-2 w-8 h-8 md:w-9 md:h-9 rounded-md object-cover ring-1 ring-white/20 opacity-90"
        />
        <Lightning
          side="right"
          className="absolute top-1 right-1 w-6 h-9 md:w-7 md:h-10 opacity-80"
        />
        <Lightning
          side="left"
          className="absolute bottom-1 left-1 w-5 h-8 md:w-6 md:h-9 opacity-50"
        />
        <div className="absolute inset-0 flex items-end">
          <h3
            className="w-full text-center pb-3 px-2 font-marker text-xl md:text-2xl leading-tight text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.9)]"
            style={{
              textShadow:
                "0 2px 0 rgba(0,0,0,0.95), 0 0 12px rgba(255,255,255,0.2)",
            }}
          >
            {product.name.toUpperCase()}
          </h3>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 md:p-4 flex flex-col gap-2">
        <div className="text-[10px] md:text-xs uppercase tracking-widest text-white/50 font-body">
          {product.category_label}
        </div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              data-testid={`product-price-${product.id}`}
              className="text-xl md:text-2xl font-body font-extrabold text-white"
            >
              {formatBRL(product.price_cents)}
            </div>
            <div className="text-[11px] text-white/50 font-body">
              À vista no Pix
            </div>
          </div>
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border border-white/25 text-white/90 font-body"
            title="Pagamento via Pix"
          >
            PIX
          </span>
        </div>
        <button
          data-testid={`product-buy-${product.id}`}
          onClick={() => addItem(product, 1)}
          className="mt-1 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-black border border-white/20 text-white font-body font-bold uppercase text-sm tracking-wider tbx-btn-glow hover:bg-neutral-900"
        >
          <ShoppingBasket className="w-4 h-4" />
          Comprar agora
        </button>
      </div>
    </article>
  );
}
