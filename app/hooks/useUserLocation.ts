import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

export type UserLocationState = {
  latitude: number;
  longitude: number;
} | null;

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocationState>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permissao de localizacao negada.");
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    } catch {
      setError("Nao foi possivel obter sua localizacao.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  return { location, isLoading, error, refreshLocation };
}
