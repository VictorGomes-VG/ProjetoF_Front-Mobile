import { type Encontro } from "../data/mockEncontros";

export type EventTimelineBucket = "upcoming" | "past";

export function getEventDateTime(encontro: Encontro) {
  return new Date(`${encontro.data}T${normalizeTime(encontro.hora)}:00`);
}

export function getEventTimelineBucket(encontro: Encontro, now = new Date()): EventTimelineBucket {
  return getEventDateTime(encontro).getTime() >= now.getTime() ? "upcoming" : "past";
}

export function normalizeTime(hora: string) {
  return hora.length >= 5 ? hora.slice(0, 5) : "00:00";
}
