import { View, StyleSheet } from "react-native";
import MapaComMarcadores from "../components/MapaComMarcadores";
import FiltroFlutuante from "../components/FiltroFlutuante";
import AcoesInferiores from "../components/AcoesInferiores";


export default function Buscar() {
  return (
    <View style={styles.container}>
      <MapaComMarcadores />
      <FiltroFlutuante />
      <AcoesInferiores />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
