export type EncontroTipo = "esporte" | "networking" | "games" | "musica" | "cafe";

export type EncontroPreco = "gratis" | "pago";

export type Encontro = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: EncontroTipo;
  comunidadeTags: string[];
  preco: EncontroPreco;
  data: string;
  hora: string;
  anfitriao: string;
  cidade: string;
  bairro: string;
  endereco: string;
  imagemUrl?: string;
  nota: number;
  totalAvaliacoes: number;
  participantes: number;
  capacidade: number;
  latitude: number;
  longitude: number;
};

export const encontrosMock: Encontro[] = [
  {
    id: "enc-1",
    titulo: "Corrida no Ibirapuera",
    descricao: "Treino leve de 5km para iniciantes e intermediarios.",
    tipo: "esporte",
    comunidadeTags: ["Bem-estar", "LGBTQIA+"],
    preco: "gratis",
    data: "2026-02-20",
    hora: "07:00",
    anfitriao: "Marina",
    cidade: "Sao Paulo",
    bairro: "Moema",
    endereco: "Portao 3, Parque Ibirapuera",
    imagemUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80",
    nota: 4.8,
    totalAvaliacoes: 52,
    participantes: 18,
    capacidade: 25,
    latitude: -23.587416,
    longitude: -46.657634,
  },
  {
    id: "enc-2",
    titulo: "Happy Hour de Networking",
    descricao: "Conexao entre devs, designers e pessoas de produto.",
    tipo: "networking",
    comunidadeTags: ["Tech", "Empreendedorismo"],
    preco: "pago",
    data: "2026-02-22",
    hora: "19:30",
    anfitriao: "Lucas",
    cidade: "Sao Paulo",
    bairro: "Vila Madalena",
    endereco: "Rua Harmonia, 312",
    imagemUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    nota: 4.6,
    totalAvaliacoes: 39,
    participantes: 34,
    capacidade: 40,
    latitude: -23.5568,
    longitude: -46.6919,
  },
  {
    id: "enc-3",
    titulo: "Noite de Jogos de Tabuleiro",
    descricao: "Partidas rapidas de jogos casuais para novos grupos.",
    tipo: "games",
    comunidadeTags: ["Nerd", "Geek"],
    preco: "gratis",
    data: "2026-02-21",
    hora: "18:00",
    anfitriao: "Ana",
    cidade: "Sao Paulo",
    bairro: "Pinheiros",
    endereco: "Av. Pedroso de Morais, 510",
    imagemUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    nota: 4.7,
    totalAvaliacoes: 27,
    participantes: 12,
    capacidade: 16,
    latitude: -23.5675,
    longitude: -46.6921,
  },
  {
    id: "enc-4",
    titulo: "Jam de Musica Acustica",
    descricao: "Encontro para tocar, cantar e conhecer outros musicos.",
    tipo: "musica",
    comunidadeTags: ["Artistas", "LGBTQIA+"],
    preco: "pago",
    data: "2026-02-23",
    hora: "20:00",
    anfitriao: "Rafa",
    cidade: "Sao Paulo",
    bairro: "Consolacao",
    endereco: "Rua Augusta, 900",
    imagemUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    nota: 4.5,
    totalAvaliacoes: 31,
    participantes: 20,
    capacidade: 24,
    latitude: -23.5532,
    longitude: -46.6602,
  },
  {
    id: "enc-5",
    titulo: "Cafe e Conversa",
    descricao: "Roda aberta para novos moradores da cidade.",
    tipo: "cafe",
    comunidadeTags: ["Novos na cidade", "Mães e pais"],
    preco: "gratis",
    data: "2026-02-19",
    hora: "10:00",
    anfitriao: "Bianca",
    cidade: "Sao Paulo",
    bairro: "Paulista",
    endereco: "Alameda Santos, 1437",
    imagemUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    nota: 4.9,
    totalAvaliacoes: 68,
    participantes: 10,
    capacidade: 14,
    latitude: -23.5614,
    longitude: -46.6558,
  },
  {
    id: "enc-6",
    titulo: "Futebol no Parque",
    descricao: "Partida amistosa 6x6. Leve chuteira society.",
    tipo: "esporte",
    comunidadeTags: ["Bem-estar", "Universitarios"],
    preco: "pago",
    data: "2026-02-24",
    hora: "08:30",
    anfitriao: "Pedro",
    cidade: "Sao Paulo",
    bairro: "Butanta",
    endereco: "Praca Elis Regina, 40",
    imagemUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
    nota: 4.4,
    totalAvaliacoes: 22,
    participantes: 9,
    capacidade: 12,
    latitude: -23.5713,
    longitude: -46.7192,
  },
];
