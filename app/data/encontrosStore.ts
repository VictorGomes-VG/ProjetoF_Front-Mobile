import { useEffect, useSyncExternalStore } from "react";
import { fetchEncontroById, fetchEncontros, postEncontro } from "../services/friendZoneApi";
import { encontrosMock, type Encontro, type NovoEncontroInput } from "./mockEncontros";

type Listener = () => void;

type EncontrosState = {
  items: Encontro[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  source: "api" | "mock";
};

const listeners = new Set<Listener>();

let encontrosState: EncontrosState = {
  items: [...encontrosMock],
  isLoading: false,
  isInitialized: false,
  error: null,
  source: "mock",
};

let pendingHydration: Promise<void> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: EncontrosState) {
  encontrosState = nextState;
  emitChange();
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

function sortEncontros(items: Encontro[]) {
  return [...items].sort((left, right) => {
    const leftKey = `${left.data}T${normalizeHora(left.hora)}`;
    const rightKey = `${right.data}T${normalizeHora(right.hora)}`;
    return leftKey.localeCompare(rightKey);
  });
}

function normalizeHora(hora: string) {
  return hora.length >= 5 ? hora.slice(0, 5) : hora;
}

export async function hydrateEncontros(force = false) {
  if (pendingHydration && !force) {
    return pendingHydration;
  }

  setState({
    ...encontrosState,
    isLoading: true,
    error: null,
  });

  pendingHydration = (async () => {
    try {
      const items = await fetchEncontros();
      setState({
        items: sortEncontros(items),
        isLoading: false,
        isInitialized: true,
        error: null,
        source: "api",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel carregar os encontros.";
      setState({
        ...encontrosState,
        items: encontrosState.items.length > 0 ? encontrosState.items : [...encontrosMock],
        isLoading: false,
        isInitialized: true,
        error: message,
        source: "mock",
      });
    } finally {
      pendingHydration = null;
    }
  })();

  return pendingHydration;
}

export async function loadEncontroById(id: string) {
  const existing = encontrosState.items.find((item) => item.id === id);
  if (existing) {
    return existing;
  }

  try {
    const encontro = await fetchEncontroById(id);
    const items = sortEncontros([encontro, ...encontrosState.items]);
    setState({
      ...encontrosState,
      items,
      source: "api",
    });
    return encontro;
  } catch {
    return null;
  }
}

export function useEncontros() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!snapshot.isInitialized && !snapshot.isLoading) {
      void hydrateEncontros();
    }
  }, [snapshot.isInitialized, snapshot.isLoading]);

  return snapshot.items;
}

export function useEncontrosStatus() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (!snapshot.isInitialized && !snapshot.isLoading) {
      void hydrateEncontros();
    }
  }, [snapshot.isInitialized, snapshot.isLoading]);

  return {
    isLoading: snapshot.isLoading,
    isInitialized: snapshot.isInitialized,
    error: snapshot.error,
    source: snapshot.source,
  };
}

export async function addEncontro(input: NovoEncontroInput) {
  try {
    const novoEncontro = await postEncontro(input);
    setState({
      ...encontrosState,
      items: sortEncontros([novoEncontro, ...encontrosState.items.filter((item) => item.id !== novoEncontro.id)]),
      source: "api",
      error: null,
      isInitialized: true,
    });

    return novoEncontro;
  } catch {
    const novoEncontro: Encontro = {
      id: `local-${Date.now()}`,
      ...input,
      hora: normalizeHora(input.hora),
      nota: input.nota ?? 5,
      totalAvaliacoes: input.totalAvaliacoes ?? 1,
    };

    setState({
      ...encontrosState,
      items: sortEncontros([novoEncontro, ...encontrosState.items]),
      error: "API indisponivel no momento. O encontro foi salvo apenas localmente.",
      isInitialized: true,
      source: "mock",
    });

    return novoEncontro;
  }
}
