import React, { useState } from "react";
import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatBRL } from "../lib/api";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
  const { items, open, setOpen, updateQty, removeItem, subtotal, clear } =
    useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        data-testid="cart-backdrop"
      />
      {/* Panel */}
      <aside
        data-testid="cart-drawer"
        className={`fixed z-50 top-0 right-0 h-full w-full sm:w-[420px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          <h3 className="font-bangers text-3xl tracking-wider text-white">
            CARRINHO
          </h3>
          <button
            aria-label="Fechar carrinho"
            data-testid="cart-close-btn"
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto tbx-scroll p-4 space-y-3">
          {items.length === 0 && (
            <div className="text-white/60 text-sm font-body mt-10 text-center">
              Seu carrinho está vazio.
            </div>
          )}
          {items.map((i) => (
            <div
              key={i.product_id}
              data-testid={`cart-item-${i.product_id}`}
              className="rounded-xl border border-white/10 bg-[#141414] p-3 flex gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-white/50 font-body">
                  {i.category_label}
                </div>
                <div className="font-body font-semibold text-white truncate">
                  {i.name}
                </div>
                <div className="mt-1 font-body font-bold text-white">
                  {formatBRL(i.price_cents * i.quantity)}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-white/10">
                  <button
                    data-testid={`cart-dec-${i.product_id}`}
                    onClick={() => updateQty(i.product_id, i.quantity - 1)}
                    className="w-7 h-7 grid place-items-center hover:bg-white/10"
                    aria-label="Diminuir"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-body">
                    {i.quantity}
                  </span>
                  <button
                    data-testid={`cart-inc-${i.product_id}`}
                    onClick={() => updateQty(i.product_id, i.quantity + 1)}
                    className="w-7 h-7 grid place-items-center hover:bg-white/10"
                    aria-label="Aumentar"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => removeItem(i.product_id)}
                data-testid={`cart-remove-${i.product_id}`}
                className="self-start text-white/40 hover:text-white"
                aria-label="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm font-body uppercase tracking-wider">
              Subtotal
            </span>
            <span
              data-testid="cart-subtotal"
              className="font-body text-2xl font-extrabold text-white"
            >
              {formatBRL(subtotal)}
            </span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
            data-testid="cart-checkout-btn"
            className="w-full py-3 rounded-lg bg-white text-black font-body font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/90 tbx-btn-glow"
          >
            Finalizar via Pix
          </button>
          {items.length > 0 && (
            <button
              onClick={clear}
              data-testid="cart-clear-btn"
              className="w-full py-2 text-xs uppercase tracking-wider text-white/40 hover:text-white/70 font-body"
            >
              Esvaziar carrinho
            </button>
          )}
        </div>
      </aside>
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}
