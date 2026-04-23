import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatBRL } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { LOGO_URL } from "../lib/assets";
import { Plus, Pencil, Trash2, LogOut, X, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";

const CATEGORIES = [
  { key: "servicos", label: "Serviços" },
  { key: "brasas", label: "Brasas" },
  { key: "sistema", label: "Sistema" },
  { key: "fardamentos", label: "Fardamentos" },
  { key: "itens_mensais", label: "Itens Mensais" },
  { key: "itens_30", label: "Itens 30 Dias" },
  { key: "itens_wipe", label: "Itens Wipe" },
  { key: "acesso", label: "Acesso" },
];

const STATUSES = ["pending", "paid", "delivered", "cancelled"];

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  const loadProducts = async () => {
    const { data } = await api.get("/products", { params: { active_only: false } });
    setProducts(data);
  };
  const loadOrders = async () => {
    const { data } = await api.get("/orders");
    setOrders(data);
  };

  useEffect(() => {
    if (user) {
      loadProducts();
      loadOrders();
    }
  }, [user]);

  const onSaveProduct = async (form) => {
    try {
      const payload = {
        name: form.name,
        description: form.description || "",
        price_cents: Math.round(Number(form.price_reais) * 100),
        category: form.category,
        category_label: CATEGORIES.find((c) => c.key === form.category)?.label || "",
        active: form.active,
        sort: Number(form.sort || 0),
      };
      if (editing?.id) {
        await api.put(`/products/${editing.id}`, payload);
        toast.success("Produto atualizado");
      } else {
        await api.post("/products", payload);
        toast.success("Produto criado");
      }
      setShowForm(false);
      setEditing(null);
      loadProducts();
    } catch (e) {
      toast.error("Erro ao salvar produto");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Excluir produto?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Excluído");
    loadProducts();
  };

  const onUpdateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast.success("Status atualizado");
    loadOrders();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-white/60 font-body">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster theme="dark" position="top-center" />
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={LOGO_URL} alt="TBX" className="w-10 h-10 rounded-md object-cover ring-1 ring-white/15" />
          <h1 className="font-bangers text-3xl tracking-wider text-white">ADMIN TBX</h1>
          <div className="flex-1" />
          <button
            onClick={() => { loadProducts(); loadOrders(); }}
            data-testid="admin-refresh-btn"
            className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 grid place-items-center"
            aria-label="Recarregar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { logout(); navigate("/admin/login"); }}
            data-testid="admin-logout-btn"
            className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-widest font-body inline-flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2">
          {[
            { k: "products", l: "Produtos" },
            { k: "orders", l: "Pedidos" },
          ].map((t) => (
            <button
              key={t.k}
              data-testid={`admin-tab-${t.k}`}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-body border ${
                tab === t.k
                  ? "bg-white text-black border-white"
                  : "border-white/15 bg-white/5 text-white hover:bg-white/10"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "products" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bangers text-3xl tracking-wider text-white">
                PRODUTOS
              </h2>
              <button
                onClick={() => { setEditing(null); setShowForm(true); }}
                data-testid="admin-new-product-btn"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-body font-bold uppercase text-xs tracking-widest tbx-btn-glow"
              >
                <Plus className="w-4 h-4" /> Novo produto
              </button>
            </div>
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead className="bg-white/5 text-white/60 uppercase tracking-widest text-xs">
                  <tr>
                    <th className="text-left p-3">Nome</th>
                    <th className="text-left p-3 hidden md:table-cell">Categoria</th>
                    <th className="text-left p-3">Preço</th>
                    <th className="text-left p-3 hidden md:table-cell">Ativo</th>
                    <th className="text-right p-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-white/10" data-testid={`admin-row-${p.id}`}>
                      <td className="p-3 text-white">{p.name}</td>
                      <td className="p-3 text-white/70 hidden md:table-cell">{p.category_label}</td>
                      <td className="p-3 text-white font-bold">{formatBRL(p.price_cents)}</td>
                      <td className="p-3 hidden md:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${p.active ? "border-white/30 text-white" : "border-white/10 text-white/40"}`}>
                          {p.active ? "ativo" : "inativo"}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => { setEditing({ ...p, price_reais: (p.price_cents / 100).toFixed(2) }); setShowForm(true); }}
                            data-testid={`admin-edit-${p.id}`}
                            className="w-8 h-8 grid place-items-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(p.id)}
                            data-testid={`admin-delete-${p.id}`}
                            className="w-8 h-8 grid place-items-center rounded-md border border-white/15 bg-white/5 hover:bg-white/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={5} className="p-6 text-center text-white/50">Nenhum produto.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <h2 className="font-bangers text-3xl tracking-wider text-white mb-4">PEDIDOS</h2>
            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} data-testid={`admin-order-${o.id}`} className="rounded-xl border border-white/10 bg-[#121212] p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-bangers text-2xl tracking-wider text-white">{o.code}</div>
                    <div className="text-xs text-white/50 font-body">{new Date(o.created_at).toLocaleString("pt-BR")}</div>
                    <div className="flex-1" />
                    <select
                      value={o.status}
                      onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                      data-testid={`admin-order-status-${o.id}`}
                      className="bg-black border border-white/15 rounded px-2 py-1 text-xs uppercase tracking-widest font-body"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-2 text-sm font-body text-white/80">
                    <strong>{o.customer_name}</strong> — {o.customer_contact}
                  </div>
                  {o.notes && <div className="mt-1 text-xs text-white/60 font-body">Obs: {o.notes}</div>}
                  <ul className="mt-2 text-sm font-body text-white/80 list-disc pl-5">
                    {o.items.map((it, idx) => (
                      <li key={idx}>
                        {it.quantity}x {it.name} — {formatBRL(it.price_cents * it.quantity)}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 font-body">
                    Total: <span className="font-extrabold text-white">{formatBRL(o.subtotal_cents)}</span>
                  </div>
                </div>
              ))}
              {orders.length === 0 && (
                <div className="text-center text-white/50 py-10 font-body">Nenhum pedido ainda.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {showForm && (
        <ProductForm
          key={editing?.id || "new"}
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={onSaveProduct}
        />
      )}
    </div>
  );
}

function ProductForm({ initial, onClose, onSave }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    description: initial?.description || "",
    price_reais: initial?.price_reais || "",
    category: initial?.category || "servicos",
    active: initial?.active ?? true,
    sort: initial?.sort ?? 0,
  });
  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <form
        onSubmit={submit}
        data-testid="admin-product-form"
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0E0E0E] p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bangers text-2xl text-white">{initial ? "EDITAR" : "NOVO"} PRODUTO</h3>
          <button type="button" onClick={onClose} className="w-8 h-8 grid place-items-center rounded border border-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60 font-body">Nome</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            data-testid="admin-form-name"
            className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-widest text-white/60 font-body">Preço (R$)</label>
            <input required type="number" step="0.01" min="0"
              value={form.price_reais}
              onChange={(e) => setForm({ ...form, price_reais: e.target.value })}
              data-testid="admin-form-price"
              className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-white/60 font-body">Ordem</label>
            <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: e.target.value })}
              className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body" />
          </div>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60 font-body">Categoria</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            data-testid="admin-form-category"
            className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body"
          >
            {CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-white/60 font-body">Descrição</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="mt-1 w-full bg-black border border-white/15 rounded-lg px-3 py-2 text-white font-body" />
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-body text-white/80">
          <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
          Ativo
        </label>
        <button type="submit" data-testid="admin-form-submit"
          className="w-full py-2.5 rounded-lg bg-white text-black font-body font-bold uppercase tracking-widest tbx-btn-glow">
          Salvar
        </button>
      </form>
    </div>
  );
}
