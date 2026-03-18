import Constants from "expo-constants";
import { Platform } from "react-native";
import { type Encontro, type NovoEncontroInput } from "../data/mockEncontros";

type EncontroApiResponse = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: Encontro["tipo"];
  comunidadeTags: string[];
  preco: Encontro["preco"];
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

type EncontroListResponse = {
  items: EncontroApiResponse[];
};

const API_PORT = 5065;

function resolveBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${API_PORT}`;
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${API_PORT}`;
  }

  return `http://localhost:${API_PORT}`;
}

function normalizeEncontro(item: EncontroApiResponse): Encontro {
  return {
    ...item,
    hora: item.hora.slice(0, 5),
  };
}

async function requestJson<T>(path: string, init?: RequestInit) {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API retornou ${response.status} em ${path}.`);
  }

  return (await response.json()) as T;
}

export async function fetchEncontros() {
  const response = await requestJson<EncontroListResponse>("/api/encontros?page=1&pageSize=100");
  return response.items.map(normalizeEncontro);
}

export async function fetchEncontroById(id: string) {
  const response = await requestJson<EncontroApiResponse>(`/api/encontros/${id}`);
  return normalizeEncontro(response);
}

export async function postEncontro(input: NovoEncontroInput) {
  const response = await requestJson<EncontroApiResponse>("/api/encontros", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      hora: input.hora.length === 5 ? `${input.hora}:00` : input.hora,
      nota: input.nota ?? 5,
      totalAvaliacoes: input.totalAvaliacoes ?? 1,
    }),
  });

  return normalizeEncontro(response);
}
