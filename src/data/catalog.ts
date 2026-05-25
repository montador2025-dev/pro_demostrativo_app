import { Product } from '../types';

export const productCatalog: Product[] = [
  {
    id: 'prod-1',
    code: 'SOF001',
    name: 'Sofá Retrátil e Reclinável Imperial 2.30m',
    nickname: 'Sofazão Confort',
    description: 'Sofá retrátil e reclinável de alto padrão com molas ensacadas no assento e espuma D33. Tecido Suede importado macio e elegante.',
    specifications: 'Estrutura: Madeira de Reflorestamento Eucalipto | Assento: Molas Ensacadas + Fibra Siliconada (Espuma D33) | Encosto: Reclinável 5 posições | Dimensões: 2.30m largura x 1.05m fechado (1.80m aberto)',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    category: 'Estofados',
    price: 2499.90
  },
  {
    id: 'prod-2',
    code: 'CAM002',
    name: 'Cama Box Conjugada Casal Ortobom Ortopédica',
    nickname: 'Cama Casal Ortopédica',
    description: 'Cama box casal Ortobom de molas Bonnel de alta resistência. Conforto firme ideal para cuidados com a postura anatômica.',
    specifications: 'Marca: Ortobom | Tipo: Molas Bonnel | Densidade: EPS Firme | Altura total: 55cm | Dimensões: 1.38m x 1.88m | Tratamento: Antiácaro e Antialérgico',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
    category: 'Colchões & Camas',
    price: 1399.00
  },
  {
    id: 'prod-3',
    code: 'GUA003',
    name: 'Guarda-Roupa Casal 6 Portas e 4 Gavetas Premium com Espelho',
    nickname: 'Guarda-Roupa Gigante',
    description: 'Guarda-roupa gigante em MDF premium, ideal para casal. Cabideiros metálicos, corrediças telescópicas macias e espelhos inclusos na porta central.',
    specifications: 'Material: 100% MDF | Corrediças: Telescópicas | Altura: 2.30m | Largura: 2.40m | Profundidade: 55cm | Divisórias: Sistema colmeia inteligente',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
    category: 'Quarto',
    price: 1899.90
  },
  {
    id: 'prod-4',
    code: 'MES004',
    name: 'Mesa de Jantar Retangular Viena com 6 Cadeiras de Suede',
    nickname: 'Mesa de Jantar 6 Cadeiras',
    description: 'Mesa de jantar de 1.60m com tampo de MDF laqueado e vidro temperado. Acompanha 6 cadeiras estofadas em Suede luxo com design ergonômico.',
    specifications: 'Tampo: MDF + Vidro Cantos Copados | Base: Formato trapézio reforçado | Altura mesa: 80cm | Tecido cadeiras: Suede Pena Bege | Estrutura cadeiras: Madeira Maciça',
    imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80',
    category: 'Sala de Jantar',
    price: 1599.00
  },
  {
    id: 'prod-5',
    code: 'PAI005',
    name: 'Painel Home Suspenso para TV até 65 Polegadas com LED Ambar',
    nickname: 'Painel Home LED',
    description: 'Painel moderno de sala de TV com fita de LED quente inclusa, prateleira superior de 25mm e 2 portas basculantes com pistão a gás.',
    specifications: 'Suporte TV: Até 65" | Acabamento: Pintura UV texturizada | Iluminação: Fita de LED Embutida | Altura: 1.62m | Largura: 1.80m | Profundidade: 35cm',
    imageUrl: 'https://images.unsplash.com/photo-16074730318d2-672e68192974?w=500&q=80',
    category: 'Estantes e Painéis',
    price: 799.00
  },
  {
    id: 'prod-6',
    code: 'POL006',
    name: 'Poltrona do Papai Reclinável Confort Suede',
    nickname: 'Poltrona do Papai',
    description: 'Poltrona confortável reclinável de 3 posições. Ideal para leitura, descanso ou amamentação. Estrutura altamente resistente.',
    specifications: 'Estrutura: Madeira Maciça e Aço Carbono | Assento: Espuma D28 | Encosto: Fibra Siliconada Soft | Sustentação: Percintas Elásticas | Peso Suportado: Até 120kg',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80',
    category: 'Estofados',
    price: 999.00
  },
  {
    id: 'prod-7',
    code: 'COZ007',
    name: 'Armário de Cozinha Compacta Suspensa 4 Peças Línea',
    nickname: 'Cozinha Suspensa',
    description: 'Conjunto modulado prático para cozinhas de apartamentos ou espaços otimizados. Nichos decorativos e portas de correr em vidro canelado.',
    specifications: 'Módulos: 1 Paneleiro duplo, 1 Armário Aéreo com vidro, 1 Balcão Pia com tampo, 1 Aéreo geladeira | Puxadores: Alumínio slim | Corrediças: Amortecedor telescópico',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80',
    category: 'Cozinha',
    price: 1249.90
  },
  {
    id: 'prod-8',
    code: 'CAM008',
    name: 'Cama Beliche Juvenil Madeira Maciça Pinus Rústico',
    nickname: 'Beliche de Madeira',
    description: 'Beliche altamente segura construída inteiramente com pinus de alta qualidade tratado. Escada lateral de acesso suave.',
    specifications: 'Material: Madeira Maciça Pinus | Tratamento: Verniz PU Protetivo | Grade Anti-queda: Superior inclusa | Dimensões: Para colchão solteiro de 0.88m | Divisível: Pode ser usado como duas camas de solteiro separadas',
    imageUrl: 'https://images.unsplash.com/photo-1505693395321-883724634266?w=500&q=80',
    category: 'Quarto',
    price: 899.00
  }
];

/**
 * Searches the catalog safely by matching term against code, name, or nickname.
 * Returns the results as a standard JSON array.
 * Includes lowercase normalization and accented/special characters tolerance.
 */
export function searchProducts(searchTerm: string): Product[] {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }
  
  const cleanTerm = searchTerm
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();

  if (cleanTerm.length === 0) {
    return [];
  }

  return productCatalog.filter(product => {
    const nameMatch = product.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(cleanTerm);

    const codeMatch = product.code
      .toLowerCase()
      .trim()
      .includes(cleanTerm);

    const nicknameMatch = product.nickname
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(cleanTerm);

    const categoryMatch = product.category
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(cleanTerm);

    return nameMatch || codeMatch || nicknameMatch || categoryMatch;
  });
}
