import { useRef } from "react";
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type ScalePressableProps = Omit<PressableProps, "style"> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

export default function ScalePressable({
  children,
  style,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  ...props
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function animateTo(nextValue: number) {
    Animated.spring(scale, {
      toValue: nextValue,
      friction: 7,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }

  function handlePressIn(event: GestureResponderEvent) {
    animateTo(pressedScale);
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    animateTo(1);
    onPressOut?.(event);
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable {...props} style={style} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {children}
      </Pressable>
    </Animated.View>
  );
}
