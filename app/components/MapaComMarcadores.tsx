import { View, Text } from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";
import { useEncontros } from "../data/encontrosStore";

const corPorTipo = {
  esporte: "#2B9348",
  networking: "#3A86FF",
  games: "#8338EC",
  musica: "#FB5607",
  cafe: "#6D4C41",
};

export default function MapaComMarcadores() {
  const encontros = useEncontros();

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -23.5606,
        longitude: -46.6614,
        latitudeDelta: 0.12,
        longitudeDelta: 0.12,
      }}
    >
      {encontros.map((encontro) => (
        <Marker
          key={encontro.id}
          coordinate={{ latitude: encontro.latitude, longitude: encontro.longitude }}
          pinColor={corPorTipo[encontro.tipo]}
        >
          <Callout>
            <View>
              <Text style={{ fontWeight: "700" }}>{encontro.titulo}</Text>
              <Text>{encontro.descricao}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
