import React from "react";
import { LOGO_URL } from "../lib/assets";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-8 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
        <div className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="TBX"
            className="w-10 h-10 rounded-md object-cover ring-1 ring-white/15"
          />
          <div>
            <div className="font-bangers text-2xl tracking-wider text-white">
              TORCIBLOX
            </div>
            <div className="text-[11px] uppercase tracking-widest text-white/40 font-body">
              Loja oficial TBX — Torcida de verdade
            </div>
          </div>
        </div>
        <div className="text-xs text-white/40 font-body">
          © {new Date().getFullYear()} Torciblox — Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
