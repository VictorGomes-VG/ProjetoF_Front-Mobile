import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { friendsZoneTheme } from "../theme";

type SkeletonBlockProps = {
  style?: StyleProp<ViewStyle>;
};

export default function SkeletonBlock({ style }: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return <Animated.View style={[styles.block, style, { opacity }]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: friendsZoneTheme.colors.surfaceMuted,
    borderRadius: 14,
  },
});
