import Constants from "expo-constants";
import { Platform } from "react-native";
import { type Encontro, type NovoEncontroInput } from "../data/mockEncontros";

type EventApiResponse = {
  id: string;
  eventCode: string;
  hostUserId: string;
  title: string;
  description: string;
  category: Encontro["tipo"];
  communityTags: string[];
  pricing: Encontro["preco"];
  date: string;
  time: string;
  host: string;
  city: string;
  district: string;
  address: string;
  imageUrl?: string;
  rating: number;
  totalRatings: number;
  participants: number;
  capacity: number;
  latitude: number;
  longitude: number;
  isOwner: boolean;
  isJoined: boolean;
};

type EventListResponse = {
  items: EventApiResponse[];
};

type UserProfileApiResponse = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  bio: string;
  interests: string[];
  plan: "starter" | "plus" | "friend";
  maxEventCapacity: number;
};

type AuthTokenApiResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: UserProfileApiResponse;
};

type MyEventsApiResponse = {
  created: EventListResponse;
  joined: EventListResponse;
};

type ApiRequestInit = RequestInit & {
  auth?: boolean;
};

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  city: string;
  bio: string;
  interests: string[];
  plan: "starter" | "plus" | "friend";
  maxEventCapacity: number;
};

export type AuthPayload = {
  accessToken: string;
  expiresAtUtc: string;
  user: UserProfile;
};

const API_PORT = 5085;
let accessToken: string | null = null;

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

function normalizeEncontro(item: EventApiResponse): Encontro {
  return {
    id: item.id,
    codigo: item.eventCode,
    hostUserId: item.hostUserId,
    titulo: item.title,
    descricao: item.description,
    tipo: item.category,
    comunidadeTags: item.communityTags,
    preco: item.pricing,
    data: item.date,
    hora: item.time.slice(0, 5),
    anfitriao: item.host,
    cidade: item.city,
    bairro: item.district,
    endereco: item.address,
    imagemUrl: item.imageUrl,
    nota: item.rating,
    totalAvaliacoes: item.totalRatings,
    participantes: item.participants,
    capacidade: item.capacity,
    latitude: item.latitude,
    longitude: item.longitude,
    isOwner: item.isOwner,
    isJoined: item.isJoined,
  };
}

function toEventPayload(input: NovoEncontroInput) {
  return {
    title: input.titulo,
    description: input.descricao,
    category: input.tipo,
    communityTags: input.comunidadeTags,
    pricing: input.preco,
    date: input.data,
    time: input.hora.length === 5 ? `${input.hora}:00` : input.hora,
    city: input.cidade,
    district: input.bairro,
    address: input.endereco,
    imageUrl: input.imagemUrl,
    rating: input.nota ?? 5,
    totalRatings: input.totalAvaliacoes ?? 1,
    latitude: input.latitude,
    longitude: input.longitude,
  };
}

function normalizeUser(item: UserProfileApiResponse): UserProfile {
  return {
    id: item.id,
    fullName: item.fullName,
    email: item.email,
    city: item.city,
    bio: item.bio,
    interests: item.interests,
    plan: item.plan,
    maxEventCapacity: item.maxEventCapacity,
  };
}

function normalizeAuthPayload(item: AuthTokenApiResponse): AuthPayload {
  return {
    accessToken: item.accessToken,
    expiresAtUtc: item.expiresAtUtc,
    user: normalizeUser(item.user),
  };
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const directMessage = "message" in payload ? payload.message : undefined;
    if (typeof directMessage === "string" && directMessage.trim()) {
      return directMessage;
    }

    const title = "title" in payload ? payload.title : undefined;
    if (typeof title === "string" && title.trim()) {
      return title;
    }

    const errors = "errors" in payload ? payload.errors : undefined;
    if (errors && typeof errors === "object") {
      const firstErrorGroup = Object.values(errors as Record<string, unknown>).find(Array.isArray);
      if (firstErrorGroup && firstErrorGroup.length > 0 && typeof firstErrorGroup[0] === "string") {
        return firstErrorGroup[0];
      }
    }
  }

  return fallback;
}

async function requestJson<T>(path: string, init?: ApiRequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  if (init?.auth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(getErrorMessage(payload, `API retornou ${response.status} em ${path}.`));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function setApiAccessToken(nextAccessToken: string | null) {
  accessToken = nextAccessToken;
}

export async function fetchEncontros() {
  const response = await requestJson<EventListResponse>("/api/events?page=1&pageSize=100", { auth: true });
  return response.items.map(normalizeEncontro);
}

export async function fetchEncontroById(id: string) {
  const response = await requestJson<EventApiResponse>(`/api/events/${id}`, { auth: true });
  return normalizeEncontro(response);
}

export async function postEncontro(input: NovoEncontroInput) {
  const response = await requestJson<EventApiResponse>("/api/events", {
    auth: true,
    method: "POST",
    body: JSON.stringify(toEventPayload(input)),
  });

  return normalizeEncontro(response);
}

export async function joinEvent(id: string) {
  await requestJson<void>(`/api/events/${id}/join`, {
    auth: true,
    method: "POST",
  });
}

export async function leaveEvent(id: string) {
  await requestJson<void>(`/api/events/${id}/join`, {
    auth: true,
    method: "DELETE",
  });
}

export async function fetchMyEvents() {
  const response = await requestJson<MyEventsApiResponse>("/api/events/mine", { auth: true });
  return {
    created: response.created.items.map(normalizeEncontro),
    joined: response.joined.items.map(normalizeEncontro),
  };
}

export async function loginWithPassword(email: string, password: string) {
  const response = await requestJson<AuthTokenApiResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return normalizeAuthPayload(response);
}

export async function registerUser(input: {
  fullName: string;
  email: string;
  password: string;
  city: string;
  bio: string;
  interests: string[];
}) {
  const response = await requestJson<AuthTokenApiResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return normalizeAuthPayload(response);
}

export async function fetchCurrentUser() {
  const response = await requestJson<UserProfileApiResponse>("/api/auth/me", { auth: true });
  return normalizeUser(response);
}
