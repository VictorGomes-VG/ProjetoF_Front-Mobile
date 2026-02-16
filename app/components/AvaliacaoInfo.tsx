import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  nota: number;
  totalAvaliacoes: number;
  compact?: boolean;
};

export function getMedalhaAvaliacao(nota: number, totalAvaliacoes: number) {
  if (totalAvaliacoes >= 30 && nota >= 4.8) {
    return "Top Friend";
  }
  if (totalAvaliacoes >= 15 && nota >= 4.6) {
    return "Destaque da comunidade";
  }
  return null;
}

export default function AvaliacaoInfo({ nota, totalAvaliacoes, compact = false }: Props) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Ionicons name="star" size={13} color="#F59E0B" />
      <Text style={styles.nota}>{nota.toFixed(1)}</Text>
      <Text style={styles.total}>{`(${totalAvaliacoes})`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rowCompact: {
    gap: 3,
  },
  nota: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  total: {
    fontSize: 12,
    color: "#64748B",
  },
});
