import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: retorna a chave Pix atual
export async function GET() {
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    // Se não existir, cria uma default
    config = await prisma.configuracao.create({ data: { pixKey: '' } });
  }
  return NextResponse.json({ pixKey: config.pixKey });
}

// POST: atualiza a chave Pix
export async function POST(req: NextRequest) {
  const { pixKey } = await req.json();
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    config = await prisma.configuracao.create({ data: { pixKey: pixKey || '' } });
  } else {
    config = await prisma.configuracao.update({ where: { id: config.id }, data: { pixKey: pixKey ?? config.pixKey } });
  }
  return NextResponse.json({ pixKey: config.pixKey });
} 