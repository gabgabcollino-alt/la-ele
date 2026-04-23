import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LOGO_URL } from "../lib/assets";
import { toast, Toaster } from "sonner";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/admin");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Falha no login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <Toaster theme="dark" position="top-center" />
      <form
        onSubmit={onSubmit}
        data-testid="admin-login-form"
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0E0E0E] p-6 space-y-4 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-2">
          <img
            src={LOGO_URL}
            alt="TBX"
            className="w-16 h-16 rounded-xl object-cover ring-1 ring-white/15"
          />
          <h1 className="font-bangers text-4xl tracking-wider text-white">
            ADMIN TBX
          </h1>
          <p className="text-xs uppercase tracking-widest text-white/50 font-body">
            Painel da organizada
          </p>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60 font-body">
            Email
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="admin-email-input"
            className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-white/40"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60 font-body">
            Senha
          </label>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid="admin-password-input"
            className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body focus:outline-none focus:border-white/40"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          data-testid="admin-login-submit"
          className="w-full py-3 rounded-lg bg-white text-black font-body font-bold uppercase tracking-wider hover:bg-white/90 disabled:opacity-50 tbx-btn-glow"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
        <a
          href="/"
          className="block text-center text-xs uppercase tracking-widest text-white/40 hover:text-white/70 font-body"
        >
          Voltar para a loja
        </a>
      </form>
    </div>
  );
}
