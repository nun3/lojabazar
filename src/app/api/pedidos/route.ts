import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Buscando pedidos...');
    const pedidos = await prisma.pedido.findMany({ orderBy: { data: 'desc' } });
    console.log('Pedidos encontrados:', pedidos.length);
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const pedido = await req.json();
    console.log('Recebendo pedido:', pedido);
    
    const novo = await prisma.pedido.create({ 
      data: {
        chavePix: pedido.chavePix,
        total: pedido.total,
        produtos: pedido.produtos,
        status: pedido.status
      }
    });
    
    console.log('Pedido criado:', novo);
    return NextResponse.json(novo);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 