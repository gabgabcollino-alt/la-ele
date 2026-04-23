import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import Header from "../components/Header";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import CartDrawer from "../components/CartDrawer";
import SupportFab from "../components/SupportFab";
import Footer from "../components/Footer";

const CATEGORY_ORDER = [
  { key: "servicos", label: "SERVIÇOS" },
  { key: "torcoins", label: "TORCOINS" },
  { key: "fardamentos", label: "FARDAMENTOS" },
  { key: "itens_mensais", label: "ITENS MENSAIS" },
  { key: "itens_30", label: "ITENS 30 DIAS" },
  { key: "itens_wipe", label: "ITENS WIPE" },
  { key: "sistema", label: "SISTEMA" },
  { key: "acesso", label: "ACESSO" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .finally(() => setLoading(false));
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    for (const p of products) {
      (map[p.category] = map[p.category] || []).push(p);
    }
    return map;
  }, [products]);

  return (
    <div className="min-h-screen">
      <Header onOpenSupport={() => setSupportOpen(true)} />
      <Hero />
      <main id="catalogo" className="pb-20">
        {loading ? (
          <div className="text-center py-20 text-white/60 font-body">
            Carregando catálogo...
          </div>
        ) : (
          CATEGORY_ORDER.map((c) => (
            <CategorySection
              key={c.key}
              id={c.key}
              title={c.label}
              products={grouped[c.key] || []}
            />
          ))
        )}
      </main>
      <Footer />
      <CartDrawer />
      <SupportFab openPanel={supportOpen} setOpenPanel={setSupportOpen} />
    </div>
  );
}
