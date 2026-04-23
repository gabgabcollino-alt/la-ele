import React from "react";
import {
  ShoppingBasket,
  Coins,
  Shirt,
  Server,
  Shield,
  Hammer,
  Swords,
  Skull,
  Ticket,
} from "lucide-react";
import { formatBRL } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Lightning } from "./Lightning";
import { LOGO_URL } from "../lib/assets";

// Category visual config: background image + overlay color + icon
const CATEGORY_VISUALS = {
  servicos: {
    icon: Shield,
    tint: "linear-gradient(135deg, rgba(30,30,30,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?q=80&w=900&auto=format&fit=crop",
  },
  torcoins: {
    icon: Coins,
    tint: "linear-gradient(135deg, rgba(60,35,5,0.45), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=900&auto=format&fit=crop",
  },
  sistema: {
    icon: Server,
    tint: "linear-gradient(135deg, rgba(20,25,55,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=900&auto=format&fit=crop",
  },
  fardamentos: {
    icon: Shirt,
    tint: "linear-gradient(135deg, rgba(35,35,35,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=900&auto=format&fit=crop",
  },
  itens_mensais: {
    icon: Hammer,
    tint: "linear-gradient(135deg, rgba(30,25,20,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1504222490345-c075b6008014?q=80&w=900&auto=format&fit=crop",
  },
  itens_30: {
    icon: Swords,
    tint: "linear-gradient(135deg, rgba(30,25,25,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=900&auto=format&fit=crop",
  },
  itens_wipe: {
    icon: Skull,
    tint: "linear-gradient(135deg, rgba(70,10,10,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1517976547714-720226b864c1?q=80&w=900&auto=format&fit=crop",
  },
  acesso: {
    icon: Ticket,
    tint: "linear-gradient(135deg, rgba(35,20,55,0.55), rgba(10,10,10,0.92))",
    img: "https://images.unsplash.com/photo-1572204097183-e1ab140342ed?q=80&w=900&auto=format&fit=crop",
  },
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const vis = CATEGORY_VISUALS[product.category] || CATEGORY_VISUALS.servicos;
  const Icon = vis.icon;
  const hasImage = Boolean(product.image_url);
  const imageSrc = hasImage
    ? `${process.env.REACT_APP_BACKEND_URL}${product.image_url}`
    : vis.img;
  return (
    <article
      data-testid={`product-card-${product.id}`}
      className="tbx-card relative rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden group"
    >
      {/* Image panel */}
      <div className="relative h-44 md:h-52 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${imageSrc}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: hasImage ? "contrast(1.05)" : "grayscale(40%) contrast(1.05)",
          }}
        />
        {!hasImage && (
          <div className="absolute inset-0" style={{ background: vis.tint }} />
        )}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
        )}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-screen pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cfilter id='g'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")",
          }}
        />

        <img
          src={LOGO_URL}
          alt=""
          className="absolute top-2 left-2 w-8 h-8 md:w-9 md:h-9 rounded-md object-cover ring-1 ring-white/20 opacity-95"
        />
        <Lightning
          side="right"
          className="absolute top-1 right-1 w-6 h-9 md:w-7 md:h-10 opacity-80"
        />
        <Lightning
          side="left"
          className="absolute bottom-1 left-1 w-5 h-8 md:w-6 md:h-9 opacity-50"
        />

        {/* Big category icon fallback only when no image */}
        {!hasImage && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl opacity-40 bg-white/30 rounded-full" />
              <Icon
                className="relative w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.9)]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute inset-x-0 bottom-0 flex items-end">
          <h3
            className="w-full text-center pb-3 px-2 font-marker text-xl md:text-2xl leading-tight text-white"
            style={{
              textShadow:
                "0 2px 0 rgba(0,0,0,0.95), 0 0 12px rgba(255,255,255,0.22)",
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
