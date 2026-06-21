import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { theme } from "../../theme";

interface AvatarProps {
  sourceUrl?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ sourceUrl, size = 40 }) => {
  const fallbackImage = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image
        source={{ uri: sourceUrl || fallbackImage }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    background: theme.colors.border,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
});