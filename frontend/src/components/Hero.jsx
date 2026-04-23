import React from "react";
import { LOGO_URL } from "../lib/assets";
import { Lightning } from "./Lightning";

export default function Hero() {
  return (
    <section
      data-testid="hero-section"
      className="relative overflow-hidden border-b border-white/5"
    >
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-screen"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1605602922835-a08452b4179d?q=80&w=1600&auto=format&fit=crop')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
      </div>

      <Lightning side="right" className="absolute top-6 right-4 w-10 h-14 opacity-80" />
      <Lightning side="left" className="absolute bottom-6 left-4 w-8 h-12 opacity-60" />

      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-16 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-white/5 blur-xl" />
          <img
            src={LOGO_URL}
            alt="TBX Torciblox"
            className="relative w-36 h-36 md:w-48 md:h-48 rounded-2xl object-cover ring-1 ring-white/15"
          />
        </div>
        <div className="text-center md:text-left">
          <h1 className="font-bangers tbx-title text-5xl md:text-7xl leading-none text-white">
            TORCIDA DE VERDADE
            <br />
            <span className="opacity-80">ITEM NA RUA</span>
          </h1>
          <p className="mt-4 font-body text-sm md:text-base text-white/70 max-w-xl">
            Loja oficial TBX — Serviços, Brasas, Fardamentos e Itens para sua
            organizada. Pix na hora, atendimento direto no WhatsApp ou Discord.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
            <a
              href="#catalogo"
              data-testid="hero-catalog-btn"
              className="tbx-btn-glow font-body font-bold uppercase text-sm tracking-wider px-5 py-2.5 rounded-lg bg-white text-black hover:bg-white/90"
            >
              Ver catálogo
            </a>
            <a
              href="https://discord.gg/QdgCXuGJNK"
              target="_blank"
              rel="noreferrer"
              data-testid="hero-discord-btn"
              className="tbx-btn-glow font-body font-bold uppercase text-sm tracking-wider px-5 py-2.5 rounded-lg border border-[#5865F2]/50 bg-[#5865F2]/10 text-[#AAB3FF] hover:bg-[#5865F2]/20"
            >
              Entrar no Discord
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
