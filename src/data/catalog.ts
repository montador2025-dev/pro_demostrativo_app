import { Product } from '../types';

export const productCatalog: (Product & { segment?: 'furniture' | 'clothing' | 'shoes' | 'perfume' })[] = [
  // --- MÓVEIS (FURNITURE) ---
  {
    id: 'prod-1',
    code: 'SOF001',
    name: 'Sofá Retrátil e Reclinável Imperial 2.30m',
    nickname: 'Sofazão Confort',
    description: 'Sofá retrátil e reclinável de alto padrão com molas ensacadas no assento e espuma D33. Tecido Suede importado macio e elegante.',
    specifications: 'Ambiente: Sala de Estar | Material: Estrutura Eucalipto e Assento de Molas Ensacadas | Dimensões: 2.30m largura x 1.05m fechado | Montagem Inclusa: Sim',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80',
    category: 'Estofados',
    price: 2499.90,
    segment: 'furniture'
  },
  {
    id: 'prod-2',
    code: 'CAM002',
    name: 'Cama Box Conjugada Casal Ortobom Ortopédica',
    nickname: 'Cama Casal Ortopédica',
    description: 'Cama box casal Ortobom de molas Bonnel de alta resistência. Conforto firme ideal para cuidados com a postura anatômica.',
    specifications: 'Ambiente: Quarto | Material: EPS Firme e Molas Bonnel | Dimensões: 1.38m largura x 1.88m comprimento | Montagem Inclusa: Não',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80',
    category: 'Colchões & Camas',
    price: 1399.00,
    segment: 'furniture'
  },
  {
    id: 'prod-3',
    code: 'GUA003',
    name: 'Guarda-Roupa Casal 6 Portas e 4 Gavetas Premium com Espelho',
    nickname: 'Guarda-Roupa Gigante',
    description: 'Guarda-roupa gigante em MDF premium, ideal para casal. Cabideiros metálicos, corrediças telescópicas macias e espelhos inclusos na porta central.',
    specifications: 'Ambiente: Quarto | Material: 100% MDF | Dimensões: 2.30m altura x 2.40m largura x 55cm profundidade | Montagem Inclusa: Sim (Profissional)',
    imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80',
    category: 'Quarto',
    price: 1899.90,
    segment: 'furniture'
  },
  {
    id: 'prod-4',
    code: 'MES004',
    name: 'Mesa de Jantar Retangular Viena com 6 Cadeiras de Suede',
    nickname: 'Mesa de Jantar 6 Cadeiras',
    description: 'Mesa de jantar de 1.60m com tampo de MDF laqueado e vidro temperado. Acompanha 6 cadeiras estofadas em Suede luxo com design ergonômico.',
    specifications: 'Ambiente: Sala de Jantar | Material: Tampo de MDF com Vidro e Cadeiras de Madeira Maciça | Dimensões: 1.60m largura x 80cm altura | Montagem Inclusa: Sim',
    imageUrl: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80',
    category: 'Sala de Jantar',
    price: 1599.00,
    segment: 'furniture'
  },
  {
    id: 'prod-5',
    code: 'PAI005',
    name: 'Painel Home Suspenso para TV até 65 Polegadas com LED Ambar',
    nickname: 'Painel Home LED',
    description: 'Painel moderno de sala de TV com fita de LED quente inclusa, prateleira superior de 25mm e 2 portas basculantes com pistão a gás.',
    specifications: 'Ambiente: Sala de Estar | Material: MDP/MDF Pintura UV | Dimensões: 1.62m altura x 1.80m largura x 35cm profundidade | Montagem Inclusa: Sim',
    imageUrl: 'https://images.unsplash.com/photo-16074730318d2-672e68192974?w=500&q=80',
    category: 'Estantes e Painéis',
    price: 799.00,
    segment: 'furniture'
  },
  {
    id: 'prod-6',
    code: 'POL006',
    name: 'Poltrona do Papai Reclinável Confort Suede',
    nickname: 'Poltrona do Papai',
    description: 'Poltrona confortável reclinável de 3 posições. Ideal para leitura, descanso ou amamentação. Estrutura altamente resistente.',
    specifications: 'Ambiente: Sala de Estar / Quarto | Material: Madeira e Aço Carbono com Tecido Suede | Dimensões: 95cm largura x 1.00m altura | Montagem Inclusa: Não',
    imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80',
    category: 'Estofados',
    price: 999.00,
    segment: 'furniture'
  },
  {
    id: 'prod-7',
    code: 'COZ007',
    name: 'Armário de Cozinha Compacta Suspensa 4 Peças Línea',
    nickname: 'Cozinha Suspensa',
    description: 'Conjunto modulado prático para cozinhas de apartamentos ou espaços otimizados. Nichos decorativos e portas de correr em vidro canelado.',
    specifications: 'Ambiente: Cozinha | Material: MDP com Vidro canelado | Dimensões: Cozinha Planejada Completa Modulada | Montagem Inclusa: Sim',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80',
    category: 'Cozinha',
    price: 1249.90,
    segment: 'furniture'
  },
  {
    id: 'prod-8',
    code: 'CAM008',
    name: 'Cama Beliche Juvenil Madeira Maciça Pinus Rústico',
    nickname: 'Beliche de Madeira',
    description: 'Beliche altamente segura construída inteiramente com pinus de alta qualidade tratado. Escada lateral de acesso suave.',
    specifications: 'Ambiente: Quarto | Material: Madeira Maciça Pinus Verniz PU | Dimensões: Colchão Solteiro de 0.88m | Montagem Inclusa: Não',
    imageUrl: 'https://images.unsplash.com/photo-1505693395321-883724634266?w=500&q=80',
    category: 'Quarto',
    price: 899.00,
    segment: 'furniture'
  },

  // --- ROUPAS (CLOTHING) ---
  {
    id: 'prod-c1',
    code: 'CLO001',
    name: 'Camisa Polo de Algodão Egípcio Premium Pima',
    nickname: 'Polo Pima Premium',
    description: 'Camisa polo elegante confeccionada em algodão egípcio legítimo com elastano que se adapta perfeitamente ao corpo.',
    specifications: 'Tamanho: P, M, G, GG | Cor / Estampa: Azul Marinho Clássico | Gênero: Masculino | Tecido: 97% Algodão Pima, 3% Elastano',
    imageUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&q=80',
    category: 'Camisas & Polos',
    price: 119.90,
    segment: 'clothing'
  },
  {
    id: 'prod-c2',
    code: 'CLO002',
    name: 'Calça Jeans Masculina Slim Fit Comfort Estonada',
    nickname: 'Jeans Comfort Slim',
    description: 'Calça stretch de altíssima durabilidade com lavagem ecológica clássica escura ideal para o dia a dia e trabalho.',
    specifications: 'Tamanho: 38, 40, 42, 44, 46, 48 | Cor / Estampa: Azul Escuro Estonado | Gênero: Unissex | Tecido: Jeans Algodão com Lycra Nobre',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80',
    category: 'Calças',
    price: 189.00,
    segment: 'clothing'
  },
  {
    id: 'prod-c3',
    code: 'CLO003',
    name: 'Blazer Feminino Alfaiataria Luxo com Botão Duplo',
    nickname: 'Blazer Alfaiataria',
    description: 'Blazer estruturado com ombreiras suaves, forro completo acetinado e corte modelador cinturado clássico.',
    specifications: 'Tamanho: PP, P, M, G, GG | Cor / Estampa: Off-White Imperial | Gênero: Feminino | Tecido: Poliéster Crepe Alfaiataria com Elastano',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&q=80',
    category: 'Casacos & Blazers',
    price: 299.90,
    segment: 'clothing'
  },
  {
    id: 'prod-c4',
    code: 'CLO004',
    name: 'Vestido Midi Casual Romântico Floral Lastex',
    nickname: 'Vestido Midi Floral',
    description: 'Vestido fresco de comprimento midi com manga bufante adaptável e costas em lastex para caimento perfeitamente maleável.',
    specifications: 'Tamanho: Único (Veste do 36 ao 42) | Cor / Estampa: Floral Primavera Fundo Creme | Gênero: Feminino | Tecido: Viscose 100% de Toque Macio',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80',
    category: 'Vestidos',
    price: 159.90,
    segment: 'clothing'
  },

  // --- CALÇADOS (SHOES) ---
  {
    id: 'prod-s1',
    code: 'SHO001',
    name: 'Tênis Running Ultra Célula Speed 3',
    nickname: 'Tênis Running Speed',
    description: 'Tênis de corrida de alta performance com placa de propulsão e entressola amortecedora de gel ativo responsivo.',
    specifications: 'Numeração: 36 ao 44 | Cor: Preto com Detalhes Neon | Material: Mesh Tecnológico Sintético Respirável | Tipo: Esportivo / Performance',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    category: 'Esportivo',
    price: 349.95,
    segment: 'shoes'
  },
  {
    id: 'prod-s2',
    code: 'SHO002',
    name: 'Sapato Social Masculino Derby Italiano em Couro Legitimo',
    nickname: 'Social Derby Couro',
    description: 'Sapataria fina clássica feita à mão em couro nobre curtido. Palmilha de PU gel macio que previne dores lombares.',
    specifications: 'Numeração: 37 ao 43 | Cor: Café Escuro Sfumato | Material: 100% Couro Bovino Natural Legitimo | Tipo: Social Moderno',
    imageUrl: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500&q=80',
    category: 'Social',
    price: 249.00,
    segment: 'shoes'
  },
  {
    id: 'prod-s3',
    code: 'SHO003',
    name: 'Sandália Feminina Plataforma Anabela Cortiça Camurça',
    nickname: 'Sandália Anabela Cortiça',
    description: 'Sandália salto anabela leve texturizado com cortiça natural e tiras transversais macias de camurça com fecho de segurança.',
    specifications: 'Numeração: 34 ao 40 | Cor: Caramelo Terroso | Material: Salto Cortiça e cabedal Camurça de microfibra | Tipo: Plataforma Casual Casada',
    imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&q=80',
    category: 'Sandálias',
    price: 120.00,
    segment: 'shoes'
  },
  {
    id: 'prod-s4',
    code: 'SHO004',
    name: 'Bota Coturno Tratorada Grunge Couro Macio',
    nickname: 'Bota Tratorada Grunge',
    description: 'Bota estilo coturno com solado alto tratorado emborrachado e costura de biqueira selada ideal para frio ou estilo arrojado.',
    specifications: 'Numeração: 35 ao 42 | Cor: Preto Fosco Nobuck | Material: Couro Tracionado Macio | Tipo: Coturno Casual Robust',
    imageUrl: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&q=80',
    category: 'Botas',
    price: 289.90,
    segment: 'shoes'
  },

  // --- PERFUMARIA E COSMÉTICOS (PERFUME) ---
  {
    id: 'prod-p1',
    code: 'PER001',
    name: 'Colônia Desodorante Floratta Blossom O Boticário 75ml',
    nickname: 'Floratta Blossom',
    description: 'Colônia feminina de buquê floral cintilante perfeito para o dia a dia, trazendo um aroma leve, fresco e estimulante.',
    specifications: 'Volumetria: 75ml | Concentração: Deo Colônia | Família Olfativa: Floral Bouquet do Campo | Marca: O Boticário',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&q=80',
    category: 'Colônias Femininas',
    price: 149.90,
    segment: 'perfume'
  },
  {
    id: 'prod-p2',
    code: 'PER002',
    name: 'Eau de Parfum Malbec Black Royal Extreme 100ml',
    nickname: 'Malbec Black Extreme',
    description: 'Uma fragrância fascinante e robusta que combina as notas amadeiradas de Malbec com o calor do couro e âmbar negro.',
    specifications: 'Volumetria: 100ml | Concentração: Eau de Parfum (EDP) | Família Olfativa: Amadeirado Intenso Especiado | Marca: O Boticário',
    imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500&q=80',
    category: 'Eau de Parfum Masculino',
    price: 219.90,
    segment: 'perfume'
  },
  {
    id: 'prod-p3',
    code: 'PER003',
    name: 'Creme Hidratante Corporal Velvet Lilac Care 400g',
    nickname: 'Velvet Lilac 400g',
    description: 'Loção corporal hidratante com ativos do lilás que acalmam e perfumam a pele de forma aveludada por até 48 horas seguidas.',
    specifications: 'Volumetria: 400g | Concentração: Loção Hidratante de Rápida Absorção | Família Olfativa: Lilás de Algodão Soft | Marca: O Boticário',
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=500&q=80',
    category: 'Cosméticos & Corpo',
    price: 69.90,
    segment: 'perfume'
  },
  {
    id: 'prod-p4',
    code: 'PER004',
    name: 'Fragrância Francesa L\'Extase Absolu Elegance 90ml',
    nickname: 'L\'Extase Absolu',
    description: 'Perfume francês importado de alta fixação para ocasiões nobres. Combina baunilha de Madagascar e pétalas raras orientais.',
    specifications: 'Volumetria: 90ml | Concentração: Pure Parfum | Família Olfativa: Oriental Vanílico Magnótico | Marca: Elite French Imports',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500&q=80',
    category: 'Importados Luxo',
    price: 389.00,
    segment: 'perfume'
  }
];

export function getRawCatalogBySegment(segment: 'furniture' | 'clothing' | 'shoes' | 'perfume' = 'furniture') {
  return productCatalog.filter(p => !p.segment || p.segment === segment);
}

/**
 * Searches the catalog safely by matching term against code, name, or nickname.
 * Returns the results as a standard JSON array.
 * Includes lowercase normalization and accented/special characters tolerance.
 */
export function searchProducts(searchTerm: string, segment: 'furniture' | 'clothing' | 'shoes' | 'perfume' = 'furniture'): Product[] {
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }
  
  const cleanTerm = searchTerm
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();

  const segmentCatalog = getRawCatalogBySegment(segment);

  if (cleanTerm.length === 0) {
    return segmentCatalog;
  }

  return segmentCatalog.filter(product => {
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
