export type EncontroTipo =
  | "esporte"
  | "networking"
  | "games"
  | "musica"
  | "cafe";

export type EncontroPreco = "gratis" | "pago";

export type Encontro = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: EncontroTipo;
  preco: EncontroPreco;
  data: string;
  hora: string;
  anfitriao: string;
  bairro: string;
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
    preco: "gratis",
    data: "2026-02-20",
    hora: "07:00",
    anfitriao: "Marina",
    bairro: "Moema",
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
    preco: "pago",
    data: "2026-02-22",
    hora: "19:30",
    anfitriao: "Lucas",
    bairro: "Vila Madalena",
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
    preco: "gratis",
    data: "2026-02-21",
    hora: "18:00",
    anfitriao: "Ana",
    bairro: "Pinheiros",
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
    preco: "pago",
    data: "2026-02-23",
    hora: "20:00",
    anfitriao: "Rafa",
    bairro: "Consolacao",
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
    preco: "gratis",
    data: "2026-02-19",
    hora: "10:00",
    anfitriao: "Bianca",
    bairro: "Paulista",
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
    preco: "pago",
    data: "2026-02-24",
    hora: "08:30",
    anfitriao: "Pedro",
    bairro: "Butanta",
    participantes: 9,
    capacidade: 12,
    latitude: -23.5713,
    longitude: -46.7192,
  },
];

