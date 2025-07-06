import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function gerarTokenPedido() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const token = req.nextUrl.searchParams.get('token');
    if (id) {
      const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
      if (!pedido) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }
      if (pedido.token && pedido.token !== token) {
        return NextResponse.json({ error: 'Token inválido' }, { status: 403 });
      }
      return NextResponse.json(pedido);
    }
    if (token) {
      const pedido = await prisma.pedido.findFirst({ where: { token } });
      if (!pedido) {
        return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
      }
      return NextResponse.json(pedido);
    }
    const pedidos = await prisma.pedido.findMany({ orderBy: { data: 'desc' } });
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
    const token = gerarTokenPedido();
    const novo = await prisma.pedido.create({ 
      data: {
        chavePix: pedido.chavePix,
        total: pedido.total,
        produtos: pedido.produtos,
        status: pedido.status,
        nome: pedido.nome,
        telefone: pedido.telefone,
        cep: pedido.cep,
        endereco: pedido.endereco,
        numero: pedido.numero,
        bairro: pedido.bairro,
        cidade: pedido.cidade,
        estado: pedido.estado,
        token
      }
    });
    console.log('Pedido criado:', novo);
    return NextResponse.json({ ...novo, token });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 });
    }
    const pedidoAtualizado = await prisma.pedido.update({
      where: { id },
      data: { status }
    });
    return NextResponse.json(pedidoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status do pedido' }, { status: 500 });
  }
} 