import React, { useEffect, useState } from "react";
import { X, Copy, Check, MessageCircle } from "lucide-react";
import { api, formatBRL } from "../lib/api";
import { useCart } from "../context/CartContext";
import { toast, Toaster } from "sonner";

export default function CheckoutModal({ open, onClose }) {
  const { items, subtotal, clear } = useCart();
  const [config, setConfig] = useState(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [notes, setNotes] = useState("");
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      api.get("/config").then((r) => setConfig(r.data)).catch(() => {});
      setOrder(null);
      setCopied(false);
    }
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      toast.error("Preencha nome e contato.");
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      const { data } = await api.post("/orders", {
        customer_name: name,
        customer_contact: contact,
        notes,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
        })),
      });
      setOrder(data);
      clear();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail
          ? String(err.response.data.detail)
          : "Erro ao criar pedido"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyPix = async () => {
    if (!config?.pix_key) return;
    try {
      await navigator.clipboard.writeText(config.pix_key);
      setCopied(true);
      toast.success("Chave Pix copiada!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  };

  const buildWhatsappLink = () => {
    if (!config?.whatsapp) return "#";
    const itemsText = order
      ? order.items
          .map((i) => `- ${i.quantity}x ${i.name} (${formatBRL(i.price_cents)})`)
          .join("\n")
      : "";
    const text = encodeURIComponent(
      `Olá TBX! Acabei de gerar o pedido ${order?.code}.\n\n${itemsText}\n\nTotal: ${formatBRL(order?.subtotal_cents || 0)}\n\nSegue comprovante do Pix.`
    );
    return `https://wa.me/${config.whatsapp}?text=${text}`;
  };

  return (
    <>
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-[#141414] border border-white/10 text-white",
          },
        }}
      />
      <div
        className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`}
      >
        <div
          onClick={onClose}
          className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`relative mx-auto my-6 md:my-16 max-w-lg w-[calc(100%-24px)] bg-[#0E0E0E] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-transform ${
            open ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          data-testid="checkout-modal"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h3 className="font-bangers text-3xl tracking-wider text-white">
              CHECKOUT PIX
            </h3>
            <button
              onClick={onClose}
              data-testid="checkout-close-btn"
              className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!order ? (
            <form onSubmit={submit} className="p-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 font-body">
                  Seu nome
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="checkout-name-input"
                  className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-white/40"
                  placeholder="Seu nome ou da organizada"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 font-body">
                  Contato (WhatsApp ou Discord)
                </label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  data-testid="checkout-contact-input"
                  className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-white/40"
                  placeholder="Ex: 11 91234-5678 ou @usuario"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-white/60 font-body">
                  Observações (opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  data-testid="checkout-notes-input"
                  rows={2}
                  className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-white/40"
                  placeholder="Nome da torcida, ID do servidor, etc."
                />
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-white/60 text-sm font-body uppercase tracking-wider">
                  Total
                </span>
                <span className="font-body text-2xl font-extrabold text-white">
                  {formatBRL(subtotal)}
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting || items.length === 0}
                data-testid="checkout-submit-btn"
                className="w-full py-3 rounded-lg bg-white text-black font-body font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 tbx-btn-glow"
              >
                {submitting ? "Gerando pedido..." : "Gerar Pix"}
              </button>
            </form>
          ) : (
            <div className="p-4 space-y-4">
              <div className="rounded-lg border border-white/10 bg-black p-3">
                <div className="text-xs uppercase tracking-widest text-white/50 font-body">
                  Pedido
                </div>
                <div
                  data-testid="checkout-order-code"
                  className="font-bangers text-3xl tracking-wider text-white"
                >
                  {order.code}
                </div>
                <div className="mt-1 font-body text-white/70 text-sm">
                  Total:{" "}
                  <span className="text-white font-extrabold">
                    {formatBRL(order.subtotal_cents)}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#141414] p-3 space-y-2">
                <div className="text-xs uppercase tracking-widest text-white/50 font-body">
                  Chave Pix ({config?.pix_key_type || "—"})
                </div>
                <div className="flex items-center gap-2">
                  <code
                    data-testid="checkout-pix-key"
                    className="flex-1 bg-black border border-white/10 rounded px-2 py-2 text-white font-mono text-sm break-all"
                  >
                    {config?.pix_key || "—"}
                  </code>
                  <button
                    onClick={copyPix}
                    data-testid="checkout-pix-copy-btn"
                    className="px-3 py-2 rounded-md border border-white/20 bg-white/5 hover:bg-white/10 tbx-btn-glow"
                    aria-label="Copiar chave Pix"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {config?.pix_receiver && (
                  <div className="text-xs text-white/50 font-body">
                    Recebedor:{" "}
                    <span className="text-white/80">{config.pix_receiver}</span>
                  </div>
                )}
              </div>

              <a
                href={buildWhatsappLink()}
                target="_blank"
                rel="noreferrer"
                data-testid="checkout-whatsapp-btn"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-white text-black font-body font-bold uppercase tracking-wider hover:bg-white/90 tbx-btn-glow"
              >
                <MessageCircle className="w-4 h-4" /> Enviar comprovante no WhatsApp
              </a>
              <p className="text-[11px] text-white/50 font-body text-center">
                Após o Pix, envie o comprovante para liberarmos seu pedido.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
