import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { friendsZoneTheme } from "../theme";
import ScalePressable from "./ScalePressable";

export default function FloatingCreateButton() {
  const floatY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -5,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [floatY]);

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateY: floatY }] }]}>
      <ScalePressable style={styles.button} onPress={() => router.push("/criar-encontro")} pressedScale={0.94}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.text}>Criar encontro</Text>
      </ScalePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    bottom: 98,
  },
  button: {
    backgroundColor: friendsZoneTheme.colors.secondary,
    minHeight: 48,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    ...friendsZoneTheme.shadows.card,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});
