import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

type EntranceAnimationOptions = {
  delay?: number;
  duration?: number;
  distance?: number;
  scaleFrom?: number;
};

export function useEntranceAnimation(options?: EntranceAnimationOptions) {
  const {
    delay = 0,
    duration = 520,
    distance = 18,
    scaleFrom = 0.98,
  } = options ?? {};

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;
  const scale = useRef(new Animated.Value(scaleFrom)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        friction: 8,
        tension: 55,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [delay, duration, opacity, scale, translateY]);

  return {
    opacity,
    transform: [{ translateY }, { scale }],
  };
}
