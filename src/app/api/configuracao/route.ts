import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: retorna a chave Pix, celular e email atual
export async function GET() {
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    // Se não existir, cria uma default
    config = await prisma.configuracao.create({ data: { pixKey: '', celular: '', email: '' } });
  }
  return NextResponse.json({ pixKey: config.pixKey, celular: config.celular, email: config.email });
}

// POST: atualiza a chave Pix, celular e/ou email
export async function POST(req: NextRequest) {
  const { pixKey, celular, email } = await req.json();
  let config = await prisma.configuracao.findFirst();
  if (!config) {
    config = await prisma.configuracao.create({ data: { pixKey: pixKey || '', celular: celular || '', email: email || '' } });
  } else {
    config = await prisma.configuracao.update({ where: { id: config.id }, data: { pixKey: pixKey ?? config.pixKey, celular: celular ?? config.celular, email: email ?? config.email } });
  }
  return NextResponse.json({ pixKey: config.pixKey, celular: config.celular, email: config.email });
} 