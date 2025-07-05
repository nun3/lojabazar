import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Atualizar estoque após venda
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produtos } = body;

    if (!produtos || !Array.isArray(produtos)) {
      return NextResponse.json(
        { error: 'Lista de produtos é obrigatória' },
        { status: 400 }
      );
    }

    // Atualizar estoque para cada produto vendido
    for (const item of produtos) {
      const { id, quantity } = item;
      
      if (!id || !quantity) {
        continue;
      }

      // Buscar produto atual
      const produto = await prisma.produto.findUnique({
        where: { id: parseInt(id) }
      });

      if (!produto) {
        console.warn(`Produto com ID ${id} não encontrado`);
        continue;
      }

      // Verificar se há estoque suficiente
      if (produto.estoque < quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para o produto ${produto.nome}` },
          { status: 400 }
        );
      }

      // Atualizar estoque
      await prisma.produto.update({
        where: { id: parseInt(id) },
        data: { estoque: produto.estoque - quantity }
      });
    }

    return NextResponse.json({ message: 'Estoque atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 