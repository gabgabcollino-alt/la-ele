import React, { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { api } from "../lib/api";

export default function SupportFab({ openPanel, setOpenPanel }) {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    api.get("/config").then((r) => setConfig(r.data)).catch(() => {});
  }, []);
  const whatsappHref = config?.whatsapp
    ? `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(
        "Olá TBX! Preciso de suporte."
      )}`
    : "#";
  const discordHref = config?.discord || "#";
  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Abrir suporte"
        data-testid="fab-support-btn"
        onClick={() => setOpenPanel(true)}
        className="fixed z-40 bottom-5 right-5 w-14 h-14 rounded-full bg-white text-black grid place-items-center shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:scale-105 transition"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {openPanel && (
        <div className="fixed z-50 inset-0">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpenPanel(false)}
          />
          <div
            data-testid="support-panel"
            className="absolute bottom-24 right-4 w-[92%] max-w-sm rounded-2xl border border-white/10 bg-[#0E0E0E] p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bangers text-2xl tracking-wider text-white">
                SUPORTE TBX
              </h4>
              <button
                onClick={() => setOpenPanel(false)}
                aria-label="Fechar"
                className="w-8 h-8 grid place-items-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-white/70 font-body mb-3">
              Fale com a gente agora mesmo:
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                data-testid="support-whatsapp-link"
                className="text-center py-2.5 rounded-lg bg-white text-black font-body font-bold uppercase tracking-wider tbx-btn-glow"
              >
                WhatsApp
              </a>
              <a
                href={discordHref}
                target="_blank"
                rel="noreferrer"
                data-testid="support-discord-link"
                className="text-center py-2.5 rounded-lg border border-[#5865F2]/50 bg-[#5865F2]/10 text-[#AAB3FF] hover:bg-[#5865F2]/20 font-body font-bold uppercase tracking-wider tbx-btn-glow"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
