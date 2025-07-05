const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const produtos = [
  {
    nome: "Vestido Floral",
    descricao: "Vestido leve e confortável, perfeito para o verão",
    preco: 89.90,
    imagem: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80",
    estoque: 10
  },
  {
    nome: "Blusa Básica",
    descricao: "Blusa versátil que combina com tudo",
    preco: 45.90,
    imagem: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80",
    estoque: 15
  },
  {
    nome: "Calça Skinny",
    descricao: "Calça jeans de alta qualidade e caimento perfeito",
    preco: 129.90,
    imagem: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80",
    estoque: 8
  },
  {
    nome: "Saia Plissada",
    descricao: "Saia plissada midi, elegante e moderna",
    preco: 69.90,
    imagem: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80",
    estoque: 12
  },
  {
    nome: "Macacão Preto",
    descricao: "Macacão preto sofisticado para eventos especiais",
    preco: 119.90,
    imagem: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80",
    estoque: 6
  },
  {
    nome: "Jaqueta Jeans",
    descricao: "Jaqueta jeans clássica, peça coringa para o guarda-roupa",
    preco: 159.90,
    imagem: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    estoque: 4
  },
  {
    nome: "Cropped Listrado",
    descricao: "Cropped listrado, ideal para dias quentes",
    preco: 39.90,
    imagem: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=400&q=80",
    estoque: 20
  },
  {
    nome: "Blazer Rosa",
    descricao: "Blazer rosa para um look moderno e sofisticado",
    preco: 139.90,
    imagem: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
    estoque: 7
  },
  {
    nome: "Camisa Social Branca",
    descricao: "Camisa social branca, básica e elegante",
    preco: 69.90,
    imagem: "https://images.unsplash.com/photo-1469398715555-76331a6c7c9b?auto=format&fit=crop&w=400&q=80",
    estoque: 18
  },
  {
    nome: "Shorts Alfaiataria",
    descricao: "Shorts de alfaiataria, confortável e estiloso",
    preco: 59.90,
    imagem: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80",
    estoque: 14
  }
];

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Limpar produtos existentes
    await prisma.produto.deleteMany();
    console.log('🗑️ Produtos existentes removidos');
    
    // Inserir novos produtos
    for (const produto of produtos) {
      await prisma.produto.create({
        data: produto
      });
    }
    
    console.log(`✅ ${produtos.length} produtos criados com sucesso!`);
    
    // Listar produtos criados
    const produtosCriados = await prisma.produto.findMany();
    console.log('\n📋 Produtos criados:');
    produtosCriados.forEach(p => {
      console.log(`- ${p.nome}: R$ ${p.preco} (Estoque: ${p.estoque})`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 