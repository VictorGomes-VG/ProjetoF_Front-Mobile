import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { router } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView from "react-native-maps";
import { Marker, Callout } from "react-native-maps";


const locais = [
  {
    id: 1,
    tipo: "restaurante",
    nome: "Pizzaria do Zé",
    descricao: "Melhor pizza da região, forno à lenha.",
    lat: -23.55052,
    lng: -46.633308,
  },
  {
    id: 2,
    tipo: "parque",
    nome: "Parque Central",
    descricao: "Espaço verde para caminhar e relaxar.",
    lat: -23.55152,
    lng: -46.638308,
  },
  {
    id: 3,
    tipo: "hospital",
    nome: "Hospital Vida",
    descricao: "Atendimento 24h com pronto-socorro.",
    lat: -23.54852,
    lng: -46.631308,
  },
];

const getIconByTipo = (tipo: string) => {
  switch (tipo) {
    case "restaurante":
      return <FontAwesome5 name="utensils" size={20} color="#fff" />;
    case "parque":
      return <FontAwesome5 name="tree" size={20} color="#fff" />;
    case "hospital":
      return <FontAwesome5 name="hospital" size={20} color="#fff" />;
    default:
      return <FontAwesome5 name="map-marker-alt" size={20} color="#fff" />;
  }
};

const getColorByTipo = (tipo: string) => {
  switch (tipo) {
    case "restaurante":
      return "#FF6B6B";
    case "parque":
      return "#4CAF50";
    case "hospital":
      return "#2196F3";
    default:
      return "#2c2c88";
  }
};

export default function MapaComMarcadores() {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: -23.55052,
        longitude: -46.633308,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {locais.map((local) => {
        const scaleAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 12,
            speed: 8,
          }).start();
        }, []);

        return (
          <Marker
            key={local.id}
            coordinate={{ latitude: local.lat, longitude: local.lng }}
          >
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }], alignItems: "center" }}
            >
              <View
                style={{
                  padding: 10,
                  borderRadius: 24,
                  backgroundColor: getColorByTipo(local.tipo),
                }}
              >
                {getIconByTipo(local.tipo)}
              </View>
            </Animated.View>

            <Callout>
              <View>
                <Text style={{ fontWeight: "bold" }}>{local.nome}</Text>
                <Text>{local.descricao}</Text>
              </View>
            </Callout>
          </Marker>
        );
      })}
    </MapView>
  );
}