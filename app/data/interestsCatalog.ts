export const interestsCatalog = [
  "Cafe",
  "Happy hour",
  "Board games",
  "Networking",
  "Corrida",
  "Caminhadas",
  "Cinema",
  "Museus",
  "Livros",
  "Musica",
  "Tecnologia",
  "Idiomas",
] as const;

export type InterestOption = (typeof interestsCatalog)[number];
