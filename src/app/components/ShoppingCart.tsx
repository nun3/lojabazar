'use client';

import PixPayment from './PixPayment';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  handleCheckout: () => void;
  showPayment: boolean;
  getTotal: () => number;
  handleSaveOrder?: (order: any) => void;
}

export default function ShoppingCart({ isOpen, onClose, cartItems, removeFromCart, updateQuantity, handleCheckout, showPayment, getTotal, handleSaveOrder }: ShoppingCartProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [formError, setFormError] = useState('');

  function handleFormChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateForm() {
    for (const key in form) {
      if (!form[key as keyof typeof form]) {
        setFormError('Preencha todos os campos para prosseguir.');
        return false;
      }
    }
    setFormError('');
    return true;
  }

  function handleFormSubmit(e: any) {
    e.preventDefault();
    if (validateForm()) {
      setShowForm(false);
      handleCheckout();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Carrinho</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showPayment ? (
            <PixPayment
              amount={getTotal()}
              productName={`${cartItems.length} produto(s)`}
              cartItems={cartItems}
              handleSaveOrder={handleSaveOrder}
              onPaymentComplete={onClose}
              clienteData={form}
            />
          ) : showForm ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Dados para Entrega</h3>
              <input name="nome" value={form.nome} onChange={handleFormChange} placeholder="Nome completo" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="telefone" value={form.telefone} onChange={handleFormChange} placeholder="Telefone" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="cep" value={form.cep} onChange={handleFormChange} placeholder="CEP" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="endereco" value={form.endereco} onChange={handleFormChange} placeholder="Endereço" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="numero" value={form.numero} onChange={handleFormChange} placeholder="Número" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="bairro" value={form.bairro} onChange={handleFormChange} placeholder="Bairro" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="cidade" value={form.cidade} onChange={handleFormChange} placeholder="Cidade" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              <input name="estado" value={form.estado} onChange={handleFormChange} placeholder="Estado" className="w-full border rounded px-3 py-2 placeholder-gray-700 text-gray-900" />
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex gap-2 mt-2">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600 transition-colors">Prosseguir para Pagamento</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-500 text-white px-4 py-2 rounded font-semibold hover:bg-gray-600 transition-colors">Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Seu carrinho está vazio</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{item.name.split(' ')[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {(item.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-pink-400 text-white rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-bold text-purple-600">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {(getTotal() / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full bg-green-500 text-white py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                    >
                      Finalizar Compra
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 