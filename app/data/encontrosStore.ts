import { useSyncExternalStore } from "react";
import { encontrosMock, type Encontro, type EncontroPreco, type EncontroTipo } from "./mockEncontros";

type Listener = () => void;

let encontrosState: Encontro[] = [...encontrosMock];
const listeners = new Set<Listener>();

export type NovoEncontroInput = {
  titulo: string;
  descricao: string;
  tipo: EncontroTipo;
  preco: EncontroPreco;
  data: string;
  hora: string;
  anfitriao: string;
  bairro: string;
  endereco: string;
  imagemUrl?: string;
  nota?: number;
  totalAvaliacoes?: number;
  participantes: number;
  capacidade: number;
  latitude: number;
  longitude: number;
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return encontrosState;
}

export function useEncontros() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addEncontro(input: NovoEncontroInput) {
  const novoEncontro: Encontro = {
    id: `enc-${Date.now()}`,
    ...input,
    nota: input.nota ?? 5,
    totalAvaliacoes: input.totalAvaliacoes ?? 1,
  };

  encontrosState = [novoEncontro, ...encontrosState];
  emitChange();
  return novoEncontro;
}
