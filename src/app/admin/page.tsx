"use client";
import { useState, useEffect } from "react";
import React from "react";
import emailjs from '@emailjs/browser';
import Link from "next/link";

const USERS = [{ user: "admin", pass: "admin123" }];

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  estoque: number;
  destaque: boolean;
}

interface ProdutoPedido {
  price: number;
  quantity: number;
}

interface Pedido {
  id: number;
  data: string;
  produtos: ProdutoPedido[];
  nome: string;
  telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  chavePix: string;
  status: string;
  total: number;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"pedidos" | "produtos">("pedidos");
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
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
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixKeyMsg, setPixKeyMsg] = useState("");
  const [pending2faCode, setPending2faCode] = useState<string | null>(null);

  // Estados para filtros e paginação
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroCliente, setFiltroCliente] = useState<string>("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(10);

  // Estados para filtros de produtos
  const [filtroNomeProduto, setFiltroNomeProduto] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState("todos");
  const [filtroDestaque, setFiltroDestaque] = useState("todos");

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
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
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

  // Funções de filtro e paginação
  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchStatus = filtroStatus === "todos" || pedido.status === filtroStatus;
    const matchCliente = !filtroCliente || 
      pedido.nome?.toLowerCase().includes(filtroCliente.toLowerCase()) ||
      pedido.telefone?.includes(filtroCliente);
    const matchData = !filtroData || 
      new Date(pedido.data).toLocaleDateString('pt-BR') === filtroData;
    
    return matchStatus && matchCliente && matchData;
  });

  const totalPaginas = Math.ceil(pedidosFiltrados.length / itensPorPagina) || 1;
  const pedidosPaginados = pedidosFiltrados.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  const limparFiltros = () => {
    setFiltroStatus("todos");
    setFiltroData("");
    setFiltroCliente("");
    setPaginaAtual(1);
  };

  const calcularTotalPedido = (produtos: ProdutoPedido[]) => {
    return produtos.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Função de filtro de produtos
  const produtosFiltrados = produtos.filter(produto => {
    const matchNome = !filtroNomeProduto || produto.nome.toLowerCase().includes(filtroNomeProduto.toLowerCase());
    const matchEstoque =
      filtroEstoque === "todos" ? true :
      filtroEstoque === "sem" ? produto.estoque === 0 :
      filtroEstoque === "baixo" ? produto.estoque > 0 && produto.estoque <= 5 :
      filtroEstoque === "ok" ? produto.estoque > 5 : true;
    const matchDestaque = filtroDestaque === "todos" ? true :
      filtroDestaque === "sim" ? produto.destaque :
      filtroDestaque === "nao" ? !produto.destaque : true;
    return matchNome && matchEstoque && matchDestaque;
  });

  // Função para atualizar status do pedido
  const handleStatusChange = async (pedidoId: number, novoStatus: string) => {
    try {
      const res = await fetch(`/api/pedidos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId, status: novoStatus })
      });
      if (res.ok) {
        setPedidos(pedidos => pedidos.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p));
      } else {
        alert('Erro ao atualizar status do pedido.');
      }
    } catch {
      alert('Erro ao atualizar status do pedido.');
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Painel Admin</h2>
          <input
            type="text"
            placeholder="Usuário"
            className="border rounded px-4 py-2 placeholder-gray-400 text-gray-800"
            value={user}
            onChange={e => setUser(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="border rounded px-4 py-2 placeholder-gray-400 text-gray-800"
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
      <Link href="/" className="mb-6 inline-block bg-white border border-pink-500 text-pink-600 font-bold px-6 py-2 rounded-lg shadow hover:bg-pink-50 transition-colors text-base">← Voltar para área de compras</Link>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Pedidos Recebidos</h3>
              <div className="text-sm text-gray-600">
                Total: {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="aprovado">Aprovado</option>
                    <option value="pago">Pago</option>
                    <option value="enviado">Enviado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input
                    type="text"
                    placeholder="Nome ou telefone"
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={limparFiltros}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span className="ml-2 text-gray-600">Carregando pedidos...</span>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {pedidos.length === 0 ? "Nenhum pedido recebido ainda." : "Nenhum pedido encontrado com os filtros aplicados."}
              </div>
            ) : (
              <>
                {/* Cards de pedidos */}
                <div className="grid gap-4 mb-6">
                  {pedidosPaginados.map((pedido) => (
                    <div key={pedido.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Pedido #{pedido.id}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(pedido.data).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <select
                            value={pedido.status}
                            onChange={e => handleStatusChange(pedido.id, e.target.value)}
                            className="px-3 py-1 rounded border border-gray-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                          >
                            <option value="pendente">Pendente</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="pago">Pago</option>
                            <option value="enviado">Enviado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                          <div className="mt-1 text-lg font-bold text-green-600">
                            {(calcularTotalPedido(pedido.produtos) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Produtos */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Produtos</h5>
                          <div className="space-y-2">
                            {Array.isArray(pedido.produtos) ? pedido.produtos.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.name} (x{item.quantity})</span>
                                <span className="font-medium text-gray-900">
                                  {(item.price * item.quantity / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                            )) : null}
                          </div>
                        </div>

                        {/* Cliente */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Cliente</h5>
                          <div className="space-y-1 text-sm">
                            <div><span className="font-medium text-gray-700">Nome:</span> {pedido.nome || '-'}</div>
                            <div><span className="font-medium text-gray-700">Telefone:</span> {pedido.telefone || '-'}</div>
                            <div><span className="font-medium text-gray-700">CEP:</span> {pedido.cep || '-'}</div>
                          </div>
                        </div>

                        {/* Endereço */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Endereço</h5>
                          <div className="space-y-1 text-sm">
                            <div>{pedido.endereco || '-'}, {pedido.numero || '-'}</div>
                            <div>{pedido.bairro || '-'}</div>
                            <div>{pedido.cidade || '-'} - {pedido.estado || '-'}</div>
                            <div className="mt-2">
                              <span className="font-medium text-gray-700">PIX:</span> {pedido.chavePix || '-'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginação */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                      disabled={paginaAtual === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setPaginaAtual(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            paginaAtual === page
                              ? 'bg-pink-500 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                      disabled={paginaAtual === totalPaginas}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                )}

                {/* Informações da paginação */}
                <div className="text-center text-sm text-gray-600 mt-4">
                  {pedidosFiltrados.length > 0 ? (
                    `Mostrando ${((paginaAtual - 1) * itensPorPagina) + 1} a ${Math.min(paginaAtual * itensPorPagina, pedidosFiltrados.length)} de ${pedidosFiltrados.length} pedidos`
                  ) : (
                    "Nenhum pedido encontrado"
                  )}
                </div>
              </>
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

            {/* Filtros de produtos */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    value={filtroNomeProduto}
                    onChange={e => setFiltroNomeProduto(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <select
                    value={filtroEstoque}
                    onChange={e => setFiltroEstoque(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  >
                    <option value="todos">Todos</option>
                    <option value="sem">Sem estoque</option>
                    <option value="baixo">Baixo estoque (1-5)</option>
                    <option value="ok">Em estoque (&gt;5)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destaque</label>
                  <select
                    value={filtroDestaque}
                    onChange={e => setFiltroDestaque(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-400 text-gray-800"
                  >
                    <option value="todos">Todos</option>
                    <option value="sim">Apenas destaque</option>
                    <option value="nao">Sem destaque</option>
                  </select>
                </div>
              </div>
            </div>

            {showForm && (
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">{editingProduto ? "Editar Produto" : "Novo Produto"}</h4>
                <form onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nome do produto"
                    className="border rounded px-3 py-2 placeholder-gray-400 text-gray-800"
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="URL da imagem"
                    className="border rounded px-3 py-2 placeholder-gray-400 text-gray-800"
                    value={formData.imagem}
                    onChange={e => setFormData({...formData, imagem: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Descrição"
                    className="border rounded px-3 py-2 md:col-span-2 placeholder-gray-400 text-gray-800"
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
                      className="border rounded pl-10 pr-3 py-2 placeholder-gray-400 text-gray-800 w-full"
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
                    className="border rounded px-3 py-2 placeholder-gray-400 text-gray-800"
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
            ) : produtosFiltrados.length === 0 ? (
              <div className="text-gray-500">Nenhum produto encontrado.</div>
            ) : (
              <div className="grid gap-4 mb-6">
                {produtosFiltrados.map((produto) => (
                  <div key={produto.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{produto.nome}</h4>
                        <p className="text-sm text-gray-600">ID: {produto.id}</p>
                      </div>
                      <div className="flex gap-2">
                            <button
                              onClick={() => handleEditProduto(produto)}
                          className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 transition-colors text-xs font-semibold"
                          title="Editar"
                            >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-2.828 0L9 13zm0 0V17h4" /></svg>
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteProduto(produto.id)}
                          className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded shadow hover:bg-red-600 transition-colors text-xs font-semibold"
                          title="Remover"
                            >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                              Remover
                            </button>
                          </div>
                    </div>
                    <div className="mb-2 text-gray-800">{produto.descricao}</div>
                    <div className="flex flex-wrap gap-4 items-center text-sm">
                      <div className="font-bold text-green-700">
                        Preço: {(Number(produto.preco) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-bold text-gray-900 ` +
                          (produto.estoque > 10 ? 'bg-green-100' :
                          produto.estoque > 0 ? 'bg-yellow-100' :
                          'bg-red-100')
                        }>
                          Estoque: {produto.estoque}
                        </span>
                      </div>
                      <div className="font-bold text-blue-700">
                        Valor Total: {((Number(produto.preco) * Number(produto.estoque)) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                      {produto.destaque && (
                        <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs font-bold">Destaque</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 