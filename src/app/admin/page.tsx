"use client";
import { useState, useEffect } from "react";
import React from "react";
import emailjs from '@emailjs/browser';

const USERS = [{ user: "admin", pass: "admin123" }];

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"pedidos" | "produtos">("pedidos");
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem: "",
    estoque: "",
    destaque: false
  });
  const [pixKey, setPixKey] = useState("");
  const [pixKeyLoading, setPixKeyLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixKeyInput, setPixKeyInput] = useState("");
  const [pixKeyMsg, setPixKeyMsg] = useState("");
  const [pending2faCode, setPending2faCode] = useState<string | null>(null);
  const [pending2faEmail, setPending2faEmail] = useState<string | null>(null);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (USERS.some(u => u.user === user && u.pass === pass)) {
      setIsAuth(true);
      setError("");
    } else {
      setError("Usuário ou senha inválidos");
    }
  }

  // Carregar dados
  useEffect(() => {
    if (isAuth) {
      if (tab === "pedidos") {
        loadPedidos();
      } else if (tab === "produtos") {
        loadProdutos();
      }
    }
  }, [isAuth, tab]);

  // Buscar chave Pix ao autenticar
  useEffect(() => {
    if (isAuth) {
      fetchPixKey();
    }
  }, [isAuth]);

  const loadPedidos = async () => {
    setLoading(true);
    try {
      console.log("Carregando pedidos...");
      const res = await fetch("/api/pedidos");
      const data = await res.json();
      console.log("Pedidos carregados:", data);
      setPedidos(data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar valor como moeda BRL
  function formatarMoeda(valor: string) {
    const num = Number(valor.replace(/[^\d]/g, '')) / 100;
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para converter string de moeda para centavos
  function moedaParaCentavos(valor: string) {
    if (!valor) return 0;
    // Remove tudo que não for número
    const limpo = valor.replace(/[^\d]/g, '');
    return Number(limpo);
  }

  // Gestão de produtos
  const handleCreateProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const precoCentavos = moedaParaCentavos(formData.preco);
    try {
      const res = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, preco: precoCentavos, destaque: formData.destaque })
      });

      if (res.ok) {
        setFormData({ nome: "", descricao: "", preco: "", imagem: "", estoque: "", destaque: false });
        setShowForm(false);
        loadProdutos();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      alert("Erro ao criar produto");
    }
  };

  const handleUpdateProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduto) return;

    const precoCentavos = moedaParaCentavos(formData.preco);
    try {
      const res = await fetch("/api/produtos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, id: editingProduto.id, preco: precoCentavos, destaque: formData.destaque })
      });

      if (res.ok) {
        setFormData({ nome: "", descricao: "", preco: "", imagem: "", estoque: "", destaque: false });
        setEditingProduto(null);
        setShowForm(false);
        loadProdutos();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto");
    }
  };

  const handleDeleteProduto = async (id: number) => {
    if (!confirm("Tem certeza que deseja remover este produto?")) return;

    try {
      const res = await fetch(`/api/produtos?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        loadProdutos();
      } else {
        const error = await res.json();
        alert(`Erro: ${error.error}`);
      }
    } catch (error) {
      console.error("Erro ao remover produto:", error);
      alert("Erro ao remover produto");
    }
  };

  const handleEditProduto = (produto: Produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toString(),
      imagem: produto.imagem,
      estoque: produto.estoque.toString(),
      destaque: !!produto.destaque
    });
    setShowForm(true);
  };

  const handleNewProduto = () => {
    setEditingProduto(null);
    setFormData({ nome: "", descricao: "", preco: "", imagem: "", estoque: "", destaque: false });
    setShowForm(true);
  };

  async function fetchPixKey() {
    setPixKeyLoading(true);
    try {
      const res = await fetch("/api/configuracao");
      const data = await res.json();
      setPixKey(data.pixKey || "");
      setPixKeyInput(data.pixKey || "");
    } catch (e) {
      setPixKey("");
    } finally {
      setPixKeyLoading(false);
    }
  }

  // Enviar código de verificação real por e-mail usando EmailJS
  async function send2faEmail(email: string, code: string) {
    try {
      await emailjs.send(
        'service_gvn0q11',
        'template_xmti31o',
        { code, to_email: email },
        'kP9lxh5VvGzdz5HSe'
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  // Salvar dados (abre modal e envia código real)
  async function handlePixKeySave(e: React.FormEvent) {
    e.preventDefault();
    setPixKeyMsg("");
    // Gerar código aleatório de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setPending2faCode(code);
    setPending2faEmail(pixKeyInput);
    setShowPixModal(true);
    // Enviar código por e-mail
    const ok = await send2faEmail(pixKeyInput, code);
    if (!ok) {
      setPixKeyMsg("Erro ao enviar código de verificação por e-mail. Tente novamente.");
      setShowPixModal(false);
    }
  }

  // Confirmar código de verificação
  async function handlePixKeyConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!pending2faCode || pixCode !== pending2faCode) {
      setPixKeyMsg("Código incorreto. Tente novamente.");
      return;
    }
    setPixKeyLoading(true);
    try {
      const res = await fetch("/api/configuracao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey: pixKeyInput })
      });
      const data = await res.json();
      setPixKey(data.pixKey);
      setPixKeyMsg("Dados atualizados com sucesso!");
      setShowPixModal(false);
      setPixCode("");
      setPending2faCode(null);
      setPending2faEmail(null);
    } catch (e) {
      setPixKeyMsg("Erro ao atualizar dados.");
    } finally {
      setPixKeyLoading(false);
    }
  }

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Painel Admin</h2>
          <input
            type="text"
            placeholder="Usuário"
            className="border rounded px-4 py-2"
            value={user}
            onChange={e => setUser(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="border rounded px-4 py-2"
            value={pass}
            onChange={e => setPass(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button type="submit" className="bg-pink-500 text-white py-2 rounded font-semibold hover:bg-pink-600 transition-colors">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-8">
      <div className="mb-6">
        <a href="/" className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded transition">Voltar para área de vendas</a>
      </div>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Painel Administrativo</h1>
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded font-semibold ${tab === "pedidos" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setTab("pedidos")}
              >
                Pedidos
              </button>
              <button
                className={`px-4 py-2 rounded font-semibold ${tab === "produtos" ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-700"}`}
                onClick={() => setTab("produtos")}
              >
                Produtos
              </button>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAuth(false);
              setUser("");
              setPass("");
              setPedidos([]);
              setProdutos([]);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sair
          </button>
        </div>

        {tab === "pedidos" ? (
          <div>
            <h3 className="text-xl font-bold mb-4 text-gray-900">Pedidos Recebidos</h3>
            {loading ? (
              <div className="text-gray-500">Carregando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div className="text-gray-500">Nenhum pedido recebido ainda.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border text-gray-900">ID</th>
                      <th className="p-2 border text-gray-900">Data</th>
                      <th className="p-2 border text-gray-900">Produtos</th>
                      <th className="p-2 border text-gray-900">Chave PIX</th>
                      <th className="p-2 border text-gray-900">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map((p) => (
                      <tr key={p.id} className="bg-white">
                        <td className="p-2 border text-center text-gray-800">{p.id}</td>
                        <td className="p-2 border text-center text-gray-800">{new Date(p.data).toLocaleString("pt-BR")}</td>
                        <td className="p-2 border text-gray-800">
                          <ul className="list-disc pl-4">
                            {Array.isArray(p.produtos) ? p.produtos.map((item: any, idx: number) => (
                              <li key={idx}>{item.name} (x{item.quantity}) - {(item.price * item.quantity / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                            )) : null}
                          </ul>
                        </td>
                        <td className="p-2 border text-center text-gray-800">{p.chavePix}</td>
                        <td className={
                          `p-2 border text-center font-bold text-gray-800 ` +
                          (p.status === 'aprovado' || p.status === 'pago' ? 'text-green-800' :
                          p.status === 'enviado' ? 'text-blue-800' :
                          p.status === 'cancelado' ? 'text-red-800' :
                          'text-yellow-800')
                        }>
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Gerenciar Produtos</h3>
              <button
                onClick={handleNewProduto}
                className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600 transition-colors"
              >
                + Novo Produto
              </button>
            </div>

            {showForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">{editingProduto ? "Editar Produto" : "Novo Produto"}</h4>
                <form onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    className="border rounded px-3 py-2 placeholder-gray-600 text-gray-900"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL da imagem"
                    className="border rounded px-3 py-2 placeholder-gray-600 text-gray-900"
                    value={formData.imagem}
                    onChange={e => setFormData({...formData, imagem: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Descrição"
                    className="border rounded px-3 py-2 md:col-span-2 placeholder-gray-600 text-gray-900"
                    rows={3}
                    value={formData.descricao}
                    onChange={e => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-gray-700 font-semibold">R$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Preço"
                      className="border rounded pl-10 pr-3 py-2 placeholder-gray-600 text-gray-900 w-full"
                      value={formData.preco ? formatarMoeda(formData.preco) : ''}
                      onChange={e => {
                        // Remove tudo que não for número
                        const limpo = e.target.value.replace(/[^\d]/g, '');
                        setFormData({...formData, preco: limpo});
                      }}
                      required
                    />
                  </div>
                  <input
                    type="number"
                    placeholder="Estoque"
                    className="border rounded px-3 py-2 placeholder-gray-600 text-gray-900"
                    value={formData.estoque}
                    onChange={e => setFormData({...formData, estoque: e.target.value})}
                    required
                  />
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={formData.destaque}
                      onChange={e => setFormData({ ...formData, destaque: e.target.checked })}
                    />
                    <span className="text-gray-800">Destaque no Bazar</span>
                  </label>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition-colors"
                    >
                      {editingProduto ? "Atualizar" : "Criar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduto(null);
                        setFormData({ nome: "", descricao: "", preco: "", imagem: "", estoque: "", destaque: false });
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="text-gray-500">Carregando produtos...</div>
            ) : produtos.length === 0 ? (
              <div className="text-gray-500">Nenhum produto cadastrado.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 border text-gray-900">ID</th>
                      <th className="p-2 border text-gray-900">Nome</th>
                      <th className="p-2 border text-gray-900">Descrição</th>
                      <th className="p-2 border text-gray-900">Preço</th>
                      <th className="p-2 border text-gray-900">Estoque</th>
                      <th className="p-2 border text-gray-900">Valor Total</th>
                      <th className="p-2 border text-gray-900">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id} className="bg-white">
                        <td className="p-2 border text-center text-gray-800">{produto.id}</td>
                        <td className="p-2 border font-semibold text-gray-800">{produto.nome}</td>
                        <td className="p-2 border text-gray-800">{produto.descricao}</td>
                        <td className="p-2 border text-center text-green-700 font-semibold">
                          {(Number(produto.preco) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2 border text-center">
                          <span className={`px-2 py-1 rounded text-xs font-bold text-gray-900 ` +
                            (produto.estoque > 10 ? 'bg-green-100' :
                            produto.estoque > 0 ? 'bg-yellow-100' :
                            'bg-red-100')
                          }>
                            {produto.estoque}
                          </span>
                        </td>
                        <td className="p-2 border text-center text-blue-700 font-semibold">
                          {((Number(produto.preco) * Number(produto.estoque)) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="p-2 border text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditProduto(produto)}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduto(produto.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                            >
                              Remover
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Modal de verificação Pix */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Verificação de Segurança</h3>
            <p className="mb-2 text-gray-700">Digite o código enviado para o seu e-mail.</p>
            <form onSubmit={handlePixKeyConfirm} className="flex flex-col gap-3">
              <input
                type="text"
                className="border rounded px-3 py-2 text-gray-900"
                value={pixCode}
                onChange={e => setPixCode(e.target.value)}
                placeholder="Código de verificação"
                required
              />
              {pixKeyMsg && <div className="text-red-600 text-sm">{pixKeyMsg}</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600 transition-colors">Confirmar</button>
                <button type="button" onClick={() => { setShowPixModal(false); setPixCode(""); }} className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 