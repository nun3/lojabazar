import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os produtos
export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { id: 'asc' }
    });
    
    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar novo produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descricao, preco, imagem, estoque, destaque } = body;

    // Validação básica
    if (!nome || !descricao || !preco || !imagem || estoque === undefined) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem,
        estoque: parseInt(estoque),
        destaque: Boolean(destaque)
      }
    });

    return NextResponse.json(produto, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar produto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nome, descricao, preco, imagem, estoque, destaque } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    const produto = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        imagem,
        estoque: parseInt(estoque),
        destaque: Boolean(destaque)
      }
    });

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover produto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do produto é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.produto.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 