"use client";
import { useState } from "react";
import Link from "next/link";

interface ProdutoPedido {
  name: string;
  quantity: number;
  price: number;
}

interface Pedido {
  id: number;
  status: string;
  data: string;
  total: number;
  produtos: ProdutoPedido[];
  nome?: string;
  telefone?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export default function AcompanharPedido() {
  const [token, setToken] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const buscarPedido = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setPedido(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos?token=${token}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Pedido não encontrado");
      }
      const data: Pedido = await res.json();
      if (!data || !data.id) throw new Error("Pedido não encontrado");
      setPedido(data);
    } catch (e) {
      if (e instanceof Error) setErro(e.message || "Erro ao buscar pedido");
      else setErro("Erro ao buscar pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Acompanhar Pedido</h2>
        <Link href="/" className="mb-6 inline-block bg-white border border-pink-500 text-pink-600 font-bold px-4 py-1.5 rounded-lg shadow hover:bg-pink-50 transition-colors text-base">← Voltar para Home</Link>
        <form onSubmit={buscarPedido} className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Token de segurança"
            className="border rounded px-4 py-2 placeholder-gray-400 text-gray-800"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-pink-500 text-white py-2 rounded font-semibold hover:bg-pink-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Buscando..." : "Ver status"}
          </button>
        </form>
        {erro && <div className="text-red-600 text-center mb-2">{erro}</div>}
        {pedido && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pedido #{pedido.id}</h3>
            <div className="mb-2 text-gray-800">Status: <span className={`font-bold px-2 py-1 rounded text-white ${
              pedido.status === 'aprovado' || pedido.status === 'pago' ? 'bg-green-500' :
              pedido.status === 'enviado' ? 'bg-blue-500' :
              pedido.status === 'cancelado' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}>
              {pedido.status}
            </span></div>
            <div className="mb-2 text-gray-800">Data: {new Date(pedido.data).toLocaleString("pt-BR")}</div>
            <div className="mb-2 text-gray-800">Total: <span className="font-bold text-green-700">{(pedido.total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
            <div className="mb-2 text-gray-800">Produtos:</div>
            <ul className="list-disc pl-6 text-gray-800 mb-2">
              {Array.isArray(pedido.produtos) && pedido.produtos.map((item, idx: number) => (
                <li key={idx}>{item.name} (x{item.quantity}) - {(item.price * item.quantity / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
              ))}
            </ul>
            <div className="mb-2 text-gray-800">Cliente: <span className="font-semibold">{pedido.nome || '-'}</span></div>
            <div className="mb-2 text-gray-800">Telefone: {pedido.telefone || '-'}</div>
            <div className="mb-2 text-gray-800">Endereço: {pedido.endereco || '-'}, {pedido.numero || '-'} - {pedido.bairro || '-'} - {pedido.cidade || '-'} - {pedido.estado || '-'}</div>
          </div>
        )}
      </div>
    </div>
  );
} 