'use client';

import { useState, useEffect } from 'react';
import Image from "next/image";
import ShoppingCart from './components/ShoppingCart';
import PixPayment from './components/PixPayment';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  estoque: number;
  quantity?: number;
  destaque: boolean;
}

// Carrossel de produtos em destaque
const featuredProducts = [
  {
    id: 101,
    name: "Macacão Listrado",
    price: 119.90,
    description: "Macacão confortável e estiloso para todas as ocasiões.",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    estoque: 5
  },
  {
    id: 102,
    name: "Saia Midi Floral",
    price: 79.90,
    description: "Saia midi com estampa floral, leve e elegante.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    estoque: 8
  },
  {
    id: 103,
    name: "Jaqueta Jeans",
    price: 159.90,
    description: "Jaqueta jeans clássica, peça coringa para o guarda-roupa.",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    estoque: 3
  },
  {
    id: 104,
    name: "Blazer Rosa",
    price: 139.90,
    description: "Blazer rosa para um look moderno e sofisticado.",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    estoque: 6
  },
  {
    id: 105,
    name: "Camisa Social Branca",
    price: 69.90,
    description: "Camisa social branca, básica e elegante.",
    image: "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
    estoque: 10
  }
];

function FeaturedCarousel({ featuredProducts, onBuy, getProductQuantity, updateQuantity, setIsCartOpen }: { featuredProducts: any[], onBuy: (product: any) => void, getProductQuantity: (id: number) => number, updateQuantity: (id: number, q: number) => void, setIsCartOpen: (open: boolean) => void }) {
  const [index, setIndex] = useState(0);
  const total = featuredProducts.length;
  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);
  if (total === 0) return null;
  const product = featuredProducts[index];
  const quantity = getProductQuantity(product.id);

  return (
    <section className="py-16 bg-gradient-to-r from-pink-100 to-purple-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Destaques do Bazar</h2>
        <div className="relative flex flex-col items-center bg-white rounded-xl shadow-lg p-6">
          <img src={product.image} alt={product.name} className="w-48 h-64 object-cover rounded-lg mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <span className="text-2xl font-bold text-pink-500 mb-4 block">
            {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <div className="text-sm text-gray-500 mb-2">Estoque: {product.estoque} unidades</div>
          <div className="flex justify-center items-center space-x-2 mb-2">
            {quantity > 0 ? (
              <>
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="w-8 h-8 bg-pink-400 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-8 text-center font-bold text-purple-600">{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.estoque}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    quantity >= product.estoque 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-purple-500 text-white hover:bg-purple-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="ml-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                  title="Ir para o Carrinho"
                >
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-1.7L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onBuy(product)}
                  disabled={product.estoque <= 0}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
                    product.estoque <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {product.estoque <= 0 ? 'Sem Estoque' : 'Comprar'}
                </button>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="ml-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                  title="Ir para o Carrinho"
                >
                  <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-1.7L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          <div className="flex justify-between w-full absolute top-1/2 left-0 px-4 -translate-y-1/2">
            <button onClick={prev} className="bg-pink-200 hover:bg-pink-400 text-pink-700 rounded-full p-2 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={next} className="bg-purple-200 hover:bg-purple-400 text-purple-700 rounded-full p-2 shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          {featuredProducts.map((_, i) => (
            <span key={i} className={`w-3 h-3 rounded-full ${i === index ? 'bg-pink-500' : 'bg-gray-300'}`}></span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  // Garante que todos os itens do carrinho tenham quantity definido ao carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cartItems');
    if (stored) {
      const parsed = JSON.parse(stored).map((item: any) => ({
        ...item,
        quantity: typeof item.quantity === 'number' ? item.quantity : 1
      }));
      setCartItems(parsed);
    }
  }, []);

  // Carregar produtos da API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/produtos');
        if (response.ok) {
          const data = await response.json();
          // Converter dados da API para o formato esperado pelo frontend
          const formattedProducts = data.map((produto: any) => ({
            id: produto.id,
            name: produto.nome,
            price: produto.preco,
            description: produto.descricao,
            image: produto.imagem,
            estoque: produto.estoque,
            destaque: produto.destaque
          }));
          setProducts(formattedProducts);
        } else {
          console.error('Erro ao carregar produtos');
          // Fallback para produtos estáticos se a API falhar
          setProducts([
            {
              id: 1,
              name: "Vestido Floral",
              price: 89.90,
              description: "Vestido leve e confortável, perfeito para o verão",
              image: "vestido",
              estoque: 10,
              destaque: true
            },
            {
              id: 2,
              name: "Blusa Básica",
              price: 45.90,
              description: "Blusa versátil que combina com tudo",
              image: "blusa",
              estoque: 15,
              destaque: true
            },
            {
              id: 3,
              name: "Calça Skinny",
              price: 129.90,
              description: "Calça jeans de alta qualidade e caimento perfeito",
              image: "calca",
              estoque: 8,
              destaque: true
            },
            {
              id: 4,
              name: "Saia Plissada",
              price: 69.90,
              description: "Saia plissada midi, elegante e moderna",
              image: "saia",
              estoque: 12,
              destaque: true
            },
            {
              id: 5,
              name: "Macacão Preto",
              price: 119.90,
              description: "Macacão preto sofisticado para eventos especiais",
              image: "macacao",
              estoque: 6,
              destaque: true
            },
            {
              id: 6,
              name: "Jaqueta Jeans",
              price: 159.90,
              description: "Jaqueta jeans clássica, peça coringa para o guarda-roupa",
              image: "jaqueta",
              estoque: 4,
              destaque: true
            },
            {
              id: 7,
              name: "Cropped Listrado",
              price: 39.90,
              description: "Cropped listrado, ideal para dias quentes",
              image: "cropped",
              estoque: 20,
              destaque: true
            },
            {
              id: 8,
              name: "Blazer Rosa",
              price: 139.90,
              description: "Blazer rosa para um look moderno e sofisticado",
              image: "blazer",
              estoque: 7,
              destaque: true
            },
            {
              id: 9,
              name: "Camisa Social Branca",
              price: 69.90,
              description: "Camisa social branca, básica e elegante",
              image: "camisa",
              estoque: 18,
              destaque: true
            },
            {
              id: 10,
              name: "Shorts Alfaiataria",
              price: 59.90,
              description: "Shorts de alfaiataria, confortável e estiloso",
              image: "shorts",
              estoque: 14,
              destaque: true
            }
          ]);
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Carregar histórico do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem('userOrders');
    if (saved) setUserOrders(JSON.parse(saved));
  }, []);

  const addToCart = (product: Product) => {
    if (product.estoque <= 0) {
      setToast(`"${product.name}" está sem estoque!`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const currentQuantity = existing.quantity || 0;
        if (currentQuantity >= product.estoque) {
          setToast(`Quantidade máxima de "${product.name}" já está no carrinho!`);
          return prev;
        }
        setToast(`Quantidade de "${product.name}" aumentada no carrinho!`);
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: currentQuantity + 1 } : item
        );
      }
      setToast(`"${product.name}" adicionado ao carrinho!`);
      return [...prev, { ...product, quantity: 1 }];
    });
    setTimeout(() => setToast(null), 2000);
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && quantity > product.estoque) {
      setToast(`Quantidade máxima disponível para "${product.name}" é ${product.estoque}!`);
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setShowPayment(true);
  };

  const handlePaymentComplete = () => {
    setShowPayment(false);
    setSelectedProduct(null);
    setCartItems([]);
    setIsCartOpen(false);
  };

  const getCartItemCount = () => cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Função para pegar a quantidade de um produto no carrinho
  const getProductQuantity = (productId: number) => {
    const item = cartItems.find(i => i.id === productId);
    return item ? (item.quantity || 0) : 0;
  };

  // Salvar novo pedido no histórico
  const handleSaveOrder = (order: any) => {
    const updated = [order, ...userOrders];
    setUserOrders(updated);
    localStorage.setItem('userOrders', JSON.stringify(updated));
  };

  // Produtos em destaque filtrados do banco
  const featuredProducts = products.filter(p => p.destaque);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Bazar Elegante</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-6">
                <a href="#produtos" className="text-gray-600 hover:text-pink-500 transition-colors">Produtos</a>
                <a href="#contato" className="text-gray-600 hover:text-pink-500 transition-colors">Contato</a>
                <a href="/admin" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">Área do Admin</a>
                <a href="/acompanhar-pedido" className="text-gray-600 hover:text-pink-500 transition-colors">Acompanhar Pedido</a>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
            Bazar de Roupas Femininas
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubra peças únicas e elegantes para renovar seu guarda-roupa. 
            Roupas de qualidade com preços imperdíveis!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="#produtos"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Ver Produtos
          </a>
          <a
              href="https://wa.me/5541991526177"
            target="_blank"
            rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-full font-semibold hover:bg-green-600 transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Entrega Rápida</h3>
              <p className="text-gray-600">Receba suas compras em até 48h</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Qualidade Garantida</h3>
              <p className="text-gray-600">Todas as peças são verificadas</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Pagamento PIX</h3>
              <p className="text-gray-600">Pagamento rápido e seguro</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nossos Produtos</h2>
          {loading ? (
            <div className="text-center text-gray-500">Carregando produtos...</div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => {
                  const quantity = getProductQuantity(product.id);
                  return (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                      <div className="h-64 bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg">{product.name}</span>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-4">{product.description}</p>
                        <div className="mb-3">
                          <span className="text-2xl font-bold text-pink-500">{(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          <div className="text-sm text-gray-500 mt-1">
                            Estoque: {product.estoque} unidades
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          {product.estoque <= 0 ? (
                            <span className="text-red-500 font-semibold">Sem Estoque</span>
                          ) : quantity > 0 ? (
                            <div className="flex space-x-2 items-center">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="w-8 h-8 bg-pink-400 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center font-bold text-purple-600">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                disabled={quantity >= product.estoque}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  quantity >= product.estoque 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-purple-500 text-white hover:bg-purple-700'
                                }`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setIsCartOpen(true)}
                                className="ml-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                                title="Ir para o Carrinho"
                              >
                                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-1.7L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <button 
                                onClick={() => addToCart(product)}
                                className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-colors"
                              >
                                Adicionar
                              </button>
                              <button
                                onClick={() => setIsCartOpen(true)}
                                className="ml-2 p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors"
                                title="Ir para o Carrinho"
                              >
                                <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 007.6 19h8.8a2 2 0 001.95-1.7L21 13M7 13V6a1 1 0 011-1h5a1 1 0 011 1v7" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Carrossel de Destaques */}
      <FeaturedCarousel
        featuredProducts={featuredProducts}
        onBuy={addToCart}
        getProductQuantity={getProductQuantity}
        updateQuantity={updateQuantity}
        setIsCartOpen={setIsCartOpen}
      />

      {/* Contact Section */}
      <section id="contato" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Entre em Contato</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">WhatsApp</p>
                    <p className="text-gray-600">(41) 99152-6177</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Instagram</p>
                    <p className="text-gray-600">@bazar_elegante</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-gray-600">contato@bazarelegante.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Horário de Atendimento</h3>
              <div className="space-y-2 text-gray-600">
                <p><span className="font-semibold">Segunda a Sexta:</span> 9h às 18h</p>
                <p><span className="font-semibold">Sábado:</span> 9h às 16h</p>
                <p><span className="font-semibold">Domingo:</span> Fechado</p>
              </div>
              <div className="mt-8">
                <a 
                  href="https://wa.me/5541991526177"
          target="_blank"
          rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <span>Falar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Bazar Elegante. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Shopping Cart Modal */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={handlePaymentComplete}
        cartItems={cartItems.map(item => ({ ...item, quantity: item.quantity || 1 }))}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        handleCheckout={handleCheckout}
        showPayment={showPayment}
        getTotal={getTotal}
        handleSaveOrder={handleSaveOrder}
      />

      {/* Payment Modal */}
      {showPayment && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pagamento</h2>
                <button
                  onClick={() => setShowPayment(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PixPayment
                amount={selectedProduct.price}
                productName={selectedProduct.name}
                cartItems={cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity || 1, price: item.price }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast visual */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg z-50 text-lg animate-bounce">
          {toast}
        </div>
      )}

      {/* Botão para abrir histórico de pedidos */}
      <button
        onClick={() => setShowOrders(true)}
        className="fixed bottom-6 right-6 bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-800 transition-colors z-50"
      >
        Meus Pedidos
      </button>

      {/* Modal de pedidos */}
      {showOrders && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl relative">
            <button
              onClick={() => setShowOrders(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Pedidos</h2>
            {userOrders.length === 0 ? (
              <div className="text-gray-500 text-center">Nenhum pedido realizado ainda.</div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {userOrders.map((order, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                    <div className="font-bold text-gray-700 mb-1">Pedido: <span className="text-gray-900">{order.orderId || '-'}</span></div>
                    {order.token && (
                      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <div className="text-sm font-semibold text-yellow-800 mb-1">Token de Segurança: <span className="text-yellow-900 font-mono">{order.token}</span></div>
                        <div className="text-xs text-yellow-700">Use este token para acompanhar seu pedido</div>
                      </div>
                    )}
                    <div className="text-gray-700 mb-1">Data: <span className="text-gray-900">{order.paidAt || '-'}</span></div>
                    <div className="text-gray-700 mb-1">Chave PIX: <span className="text-gray-900">{order.pixKey || '-'}</span></div>
                    <div className="text-gray-700 mb-1">Status: <span className={
                      order.status === 'aprovado' || order.status === 'pago' ? 'text-green-700 font-bold' :
                      order.status === 'enviado' ? 'text-blue-700 font-bold' :
                      order.status === 'cancelado' ? 'text-red-700 font-bold' :
                      'text-yellow-700 font-bold'
                    }>{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Aguardando'}</span></div>
                    <div className="text-gray-700 mb-1">Produtos:</div>
                    <ul className="pl-4 list-disc text-gray-900 mb-1">
                      {order.cartItems && order.cartItems.length > 0 ? (
                        order.cartItems.map((item: any, i: number) => (
                          <li key={i}>{item.name} (x{item.quantity}) - R$ {(item.price * item.quantity).toFixed(2)}</li>
                        ))
                      ) : (
                        <li>{order.productName} - R$ {order.amount?.toFixed(2)}</li>
                      )}
                    </ul>
                    <div className="font-bold text-green-700 text-right">Total: R$ {order.amount?.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
