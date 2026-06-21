import { TextStyle } from "react-native";

export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    h1: 32,
  },
  fontWeights: {
    regular: "400" as TextStyle["fontWeight"],
    medium: "500" as TextStyle["fontWeight"],
    semibold: "600" as TextStyle["fontWeight"],
    bold: "700" as TextStyle["fontWeight"],
  },
  lineHeights: {
    tight: 18,
    normal: 22,
    relaxed: 26,
    heading: 38,
  }
};

export type TypographyType = typeof typography;