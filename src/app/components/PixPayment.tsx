'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';

interface PixPaymentProps {
  amount: number;
  productName: string;
  cartItems?: { id: number; name: string; quantity: number; price: number }[];
  handleSaveOrder?: (order: any) => void;
  onPaymentComplete?: () => void;
  clienteData?: {
    nome: string;
    telefone: string;
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

export default function PixPayment({ amount, productName, cartItems, handleSaveOrder, onPaymentComplete, clienteData }: PixPaymentProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [pixKey, setPixKey] = useState('');
  const [pixPayload, setPixPayload] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [pedidoSalvo, setPedidoSalvo] = useState(false);
  const [pedidoToken, setPedidoToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Gerar chave PIX do banco para o QR Code
  async function fetchPixKeyFromApi() {
    try {
      const res = await fetch('/api/configuracao');
      const data = await res.json();
      return data.pixKey || '';
    } catch {
      return '';
    }
  }

  // Função para calcular o CRC16-CCITT (XModem)
  function crc16(str: string) {
    let crc = 0xFFFF;
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc = crc << 1;
        }
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Função para montar o campo 26 (Merchant Account Information) corretamente
  function buildMerchantAccountInfo(pixKeyValue: string) {
    const gui = 'br.gov.bcb.pix';
    const guiField = '00' + gui.length.toString().padStart(2, '0') + gui;
    const keyField = '01' + pixKeyValue.length.toString().padStart(2, '0') + pixKeyValue;
    const value = guiField + keyField;
    return '26' + value.length.toString().padStart(2, '0') + value;
  }

  // Função para remover acentos e caracteres especiais
  function sanitize(str: string) {
    return str.normalize('NFD').replace(/[^\w\s]/gi, '').replace(/\s+/g, ' ').trim();
  }

  // Função para montar o payload PIX 100% conforme padrão BR Code
  const generatePixData = (pixKeyValue: string) => {
    const merchantName = sanitize('Bazar Elegante').substring(0, 25); // até 25 caracteres
    const merchantCity = sanitize('Curitiba').substring(0, 15); // até 15 caracteres
    const amountStr = (amount / 100).toFixed(2);
    // Campo 00: Payload Format Indicator
    const payloadFormat = '000201';
    // Campo 01: Point of Initiation Method (estático)
    const initiationMethod = '010212';
    // Campo 26: Merchant Account Information
    const gui = 'br.gov.bcb.pix';
    const guiField = '00' + gui.length.toString().padStart(2, '0') + gui;
    const keyField = '01' + pixKeyValue.length.toString().padStart(2, '0') + pixKeyValue;
    const merchantAccountInfoValue = guiField + keyField;
    const merchantAccountInfo = '26' + merchantAccountInfoValue.length.toString().padStart(2, '0') + merchantAccountInfoValue;
    // Campo 52: Merchant Category Code
    const merchantCategoryCode = '52040000';
    // Campo 53: Transaction Currency
    const currency = '5303986';
    // Campo 54: Transaction Amount
    const valueField = '54' + amountStr.length.toString().padStart(2, '0') + amountStr;
    // Campo 58: Country Code
    const countryCode = '5802BR';
    // Campo 59: Merchant Name
    const nameField = '59' + merchantName.length.toString().padStart(2, '0') + merchantName;
    // Campo 60: Merchant City
    const cityField = '60' + merchantCity.length.toString().padStart(2, '0') + merchantCity;
    // Campo 62: Additional Data Field Template (Txid)
    const txidValue = '***';
    const txidField = '05' + txidValue.length.toString().padStart(2, '0') + txidValue;
    const additionalData = '62' + txidField.length.toString().padStart(2, '0') + txidField;
    // Monta o payload sem o CRC
    const payload = [
      payloadFormat,
      initiationMethod,
      merchantAccountInfo,
      merchantCategoryCode,
      currency,
      valueField,
      countryCode,
      nameField,
      cityField,
      additionalData
    ].join('');
    // Adiciona campo do CRC16
    const toCrc = payload + '6304';
    const crc = crc16(toCrc);
    return toCrc + crc;
  };

  // Atualizar handleGeneratePix para buscar a chave Pix do banco
  const handleGeneratePix = async () => {
    const key = await fetchPixKeyFromApi();
    setPixKey(key);
    setPixPayload(generatePixData(key));
    setShowQRCode(true);
    setPaymentStatus('pending');
    // Gerar orderId apenas quando necessário
    if (!orderId) {
      setOrderId(`#${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSimulatePayment = async () => {
    setPaymentStatus('processing');
    setTimeout(async () => {
      const success = Math.random() > 0.3;
      if (success) {
        setPaidAt(new Date().toLocaleString('pt-BR'));
        // Salvar pedido no banco
        if (!pedidoSalvo) {
          try {
            // Salvar pedido
            const pedidoResponse = await fetch('/api/pedidos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chavePix: pixKey,
                total: amount,
                produtos: cartItems && cartItems.length > 0 ? cartItems : [{ name: productName, quantity: 1, price: amount }],
                status: 'aprovado',
                ...clienteData
              })
            });

            if (pedidoResponse.ok) {
              const pedidoData = await pedidoResponse.json();
              setPedidoToken(pedidoData.token);
              
              // Atualizar estoque dos produtos vendidos
              if (cartItems && cartItems.length > 0) {
                const estoqueResponse = await fetch('/api/produtos/atualizar-estoque', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    produtos: cartItems.map(item => ({
                      id: item.id || 1, // Fallback para ID 1 se não houver
                      quantity: item.quantity
                    }))
                  })
                });

                if (!estoqueResponse.ok) {
                  console.warn('Erro ao atualizar estoque:', await estoqueResponse.text());
                }
              }
              // Salvar no histórico do usuário
              if (handleSaveOrder) {
                handleSaveOrder({
                  orderId,
                  paidAt: new Date().toLocaleString('pt-BR'),
                  pixKey,
                  cartItems,
                  productName,
                  amount,
                  token: pedidoData.token
                });
              }
            }
            setPedidoSalvo(true);
          } catch (error) {
            console.error('Erro ao salvar pedido:', error);
          }
        }
      }
      setPaymentStatus(success ? 'completed' : 'failed');
    }, 3000);
  };

  const handleReset = () => {
    setShowQRCode(false);
    setPaymentStatus('pending');
    setPixKey('');
    setPixPayload('');
  };

  // Função para gerar mensagem do pedido para WhatsApp
  function getWhatsappMessage() {
    let msg = `*Novo pedido recebido!*%0A`;
    msg += `*Pedido:* ${orderId}%0A`;
    if (pedidoToken) {
      msg += `*Token de Segurança:* ${pedidoToken}%0A`;
    }
    msg += `*Data:* ${paidAt}%0A`;
    msg += `*Chave PIX:* ${pixKey}%0A`;
    msg += `*Produtos:*%0A`;
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach(item => {
        msg += `- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}%0A`;
      });
    } else {
      msg += `- ${productName} - R$ ${amount.toFixed(2)}%0A`;
    }
    msg += `*Total:* R$ ${amount.toFixed(2)}%0A`;
    return msg;
  }

  // Função para baixar comprovante em PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(16);
    doc.text('Comprovante do Pedido', 15, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Pedido: ${orderId}`, 15, y);
    y += 8;
    if (pedidoToken) {
      doc.text(`Token de Segurança: ${pedidoToken}`, 15, y);
      y += 8;
      doc.setFontSize(10);
      doc.text('Guarde este token para acompanhar seu pedido', 15, y);
      y += 8;
      doc.setFontSize(12);
    }
    doc.text(`Data: ${paidAt || '-'}`, 15, y);
    y += 8;
    doc.text(`Chave PIX: ${pixKey}`, 15, y);
    y += 8;
    doc.text('Produtos:', 15, y);
    y += 8;
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach(item => {
        doc.text(`- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}`, 18, y);
        y += 7;
      });
    } else {
      doc.text(`- ${productName} - R$ ${amount.toFixed(2)}`, 18, y);
      y += 7;
    }
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: R$ ${amount.toFixed(2)}`, 15, y);
    doc.save(`comprovante-pedido-${orderId}.pdf`);
  };

  return (
    <div className="bg-white rounded-lg p-8 max-w-md mx-auto">
      {!mounted ? (
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : !showQRCode ? (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Pagamento via PIX
          </h3>
          <p className="text-gray-600 mb-6">
            Valor: <span className="font-bold text-green-600">{(amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </p>
          <p className="text-gray-600 mb-6">
            Produto: <span className="font-semibold">{productName}</span>
          </p>
          <button 
            onClick={() => handleGeneratePix()}
            className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Gerar PIX
          </button>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            QR Code PIX
          </h3>
          {paymentStatus === 'pending' && (
            <>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                {pixPayload && (
                  <QRCode 
                    value={pixPayload}
                    size={200}
                    level="M"
                    className="mx-auto"
                    title="QR Code PIX"
                  />
                )}
              </div>
              <p className="text-gray-600 mb-4">
                Escaneie o QR Code com seu app bancário
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Chave PIX:</strong> {pixKey}
                </p>
              </div>
              <button 
                onClick={handleSimulatePayment}
                className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors mr-2"
              >
                Simular Pagamento
              </button>
              <button 
                onClick={handleReset}
                className="bg-gray-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </>
          )}

          {paymentStatus === 'processing' && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Processando pagamento...</p>
            </div>
          )}

          {paymentStatus === 'completed' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-green-600 mb-2">
                Pagamento Aprovado!
              </h4>
              <p className="text-gray-600 mb-4">
                Seu pedido foi confirmado e será processado em breve.
              </p>
              {/* Comprovante */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 text-left text-sm">
                <div className="mb-2 font-bold text-gray-800">Comprovante do Pedido</div>
                <div className="mb-1"><span className="font-semibold text-gray-700">Pedido:</span> <span className="text-gray-900">{orderId}</span></div>
                {pedidoToken && (
                  <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="mb-1"><span className="font-semibold text-yellow-800">Token de Segurança:</span> <span className="text-yellow-900 font-mono">{pedidoToken}</span></div>
                    <div className="text-xs text-yellow-700">Guarde este token para acompanhar seu pedido</div>
                  </div>
                )}
                <div className="mb-1"><span className="font-semibold text-gray-700">Data:</span> <span className="text-gray-900">{paidAt}</span></div>
                <div className="mb-1"><span className="font-semibold text-gray-700">Chave PIX:</span> <span className="text-gray-900">{pixKey}</span></div>
                <div className="mb-2"><span className="font-semibold text-gray-700">Produtos:</span></div>
                <ul className="mb-2 pl-4 list-disc">
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, idx) => (
                      <li key={idx} className="text-gray-900">
                        <span className="font-semibold text-gray-800">{item.name}</span> <span className="text-gray-700">(x{item.quantity})</span> - <span className="text-gray-800">{(item.price * item.quantity / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-900">{productName} - {(amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</li>
                  )}
                </ul>
                <div className="font-bold text-right text-green-700">Total: {(amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDownloadPDF}
                  className="bg-blue-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
                >
                  Baixar Comprovante
                </button>
                {onPaymentComplete && (
                  <button
                    onClick={onPaymentComplete}
                    className="bg-purple-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Voltar para a loja
                  </button>
                )}
              </div>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-red-600 mb-2">
                Pagamento Recusado
              </h4>
              <p className="text-gray-600 mb-4">
                Houve um problema com o pagamento. Tente novamente.
              </p>
              <button 
                onClick={handleReset}
                className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 