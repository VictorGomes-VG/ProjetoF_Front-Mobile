import { useSyncExternalStore } from "react";
import {
  type AuthPayload,
  type UserProfile,
  fetchCurrentUser,
  loginWithPassword,
  registerUser,
  setApiAccessToken,
} from "../services/friendZoneApi";
import { resetEncontrosState } from "./encontrosStore";

type Listener = () => void;

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};

type RegisterInput = {
  fullName: string;
  email: string;
  password: string;
  city: string;
  bio: string;
};

const listeners = new Set<Listener>();

let authState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: true,
  error: null,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setState(nextState: AuthState) {
  authState = nextState;
  emitChange();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return authState;
}

function applySession(payload: AuthPayload | null) {
  setApiAccessToken(payload?.accessToken ?? null);
  if (!payload) {
    resetEncontrosState();
  }
  setState({
    user: payload?.user ?? null,
    accessToken: payload?.accessToken ?? null,
    isLoading: false,
    isInitialized: true,
    error: null,
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useAuthSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function login(email: string, password: string) {
  setState({
    ...authState,
    isLoading: true,
    error: null,
  });

  try {
    const payload = await loginWithPassword(email, password);
    applySession(payload);
    return payload.user;
  } catch (error) {
    const message = getErrorMessage(error, "Nao foi possivel entrar.");
    setState({
      ...authState,
      isLoading: false,
      error: message,
      isInitialized: true,
    });
    throw error;
  }
}

export async function register(input: RegisterInput) {
  setState({
    ...authState,
    isLoading: true,
    error: null,
  });

  try {
    const payload = await registerUser(input);
    applySession(payload);
    return payload.user;
  } catch (error) {
    const message = getErrorMessage(error, "Nao foi possivel criar sua conta.");
    setState({
      ...authState,
      isLoading: false,
      error: message,
      isInitialized: true,
    });
    throw error;
  }
}

export async function refreshCurrentUser() {
  if (!authState.accessToken) {
    return null;
  }

  try {
    const user = await fetchCurrentUser();
    setState({
      ...authState,
      user,
      error: null,
    });
    return user;
  } catch (error) {
    applySession(null);
    throw error;
  }
}

export function logout() {
  applySession(null);
}
