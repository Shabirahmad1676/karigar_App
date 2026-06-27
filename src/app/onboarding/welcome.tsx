import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { Button } from "../../components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../features/auth/store";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { setAsGuest } = useAuth();

  // --- Animation References ---
  const fadePageAnim = useRef(new Animated.Value(0)).current;
  const slidePageAnim = useRef(new Animated.Value(30)).current;
  const springLogoAnim = useRef(new Animated.Value(0.3)).current;

  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadePageAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slidePageAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1)),
        useNativeDriver: true,
      }),
      Animated.spring(springLogoAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const createFloatingLoop = (
      animRef: Animated.Value,
      duration: number,
      yOffset: number,
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animRef, {
            toValue: yOffset,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(animRef, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
    };

    Animated.parallel([
      createFloatingLoop(floatAnim1, 2200, -6),
      createFloatingLoop(floatAnim2, 2600, 5),
      createFloatingLoop(floatAnim3, 1900, -4),
    ]).start();
  }, []);

  const handleEmailSignIn = () => {
    router.push("/(auth)/login");
  };

  const handleGuestSkip = () => {
    setAsGuest();
    router.replace("/(client)");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.colors.background}
      />
      <View style={styles.bgGradientCircle} />

      <Animated.View
        style={[
          styles.contentContainer,
          { opacity: fadePageAnim, transform: [{ translateY: slidePageAnim }] },
        ]}
      >
        <View style={styles.heroSection}>
          <View style={styles.brandVisualWrapper}>
            <Animated.View style={[styles.avatarBubble, styles.avatar1, { transform: [{ translateY: floatAnim1 }] }]}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1676210134188-4c05dd172f89?w=500&auto=format&fit=crop" }} style={styles.avatarImg} />
            </Animated.View>

            <Animated.View style={[styles.avatarBubble, styles.avatar2, { transform: [{ translateY: floatAnim2 }] }]}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=500&auto=format&fit=crop" }} style={styles.avatarImg} />
            </Animated.View>

            <Animated.View style={[styles.avatarBubble, styles.avatar3, { transform: [{ translateY: floatAnim3 }] }]}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1659353588842-891391e6fcd4?w=500&auto=format&fit=crop" }} style={styles.avatarImg} />
            </Animated.View>

            <Animated.View style={[styles.logoBadge, { transform: [{ scale: springLogoAnim }] }]}>
              <Text style={styles.logoText}>K</Text>
            </Animated.View>
          </View>

          <View style={{ paddingHorizontal: theme.spacing.md, marginTop: theme.spacing.lg }}>
            <Text style={styles.editorialHeadline}>
            Your home services.{"\n"}
            Fixed <Text style={styles.italicText}>fast</Text> with <Text style={styles.brandText}>Karigar</Text>.
          </Text>
          
          <Text style={styles.subheadline}>
            Connect instantly with verified local technicians across Pakistan for plumbing, electrical work, carpentry, and more.
          </Text> 
          </View>
        </View>

        <View style={styles.actionControlsStack}>
          <Button 
            label="Get Started" 
            onPress={handleEmailSignIn} 
            variant="primary" 
            style={styles.emailBtn} 
          />
          <Text onPress={handleGuestSkip} style={styles.skipLink}>Skip for now</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  bgGradientCircle: { 
    position: "absolute", 
    top: -height * 0.1, 
    right: -width * 0.15, 
    width: width * 1.2, 
    height: width * 1.2, 
    borderRadius: (width * 1.2) / 2, 
    backgroundColor: theme.colors.primaryMuted, 
    opacity: 0.35 
  },
  contentContainer: { 
    flex: 1, 
    paddingHorizontal: theme.spacing.xl, 
    justifyContent: "space-between", 
    paddingVertical: theme.spacing.xl, 
    zIndex: 2 
  },
  heroSection: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: height > 700 ? theme.spacing.xl : 0 
  },
  brandVisualWrapper: { 
    width: 200, 
    height: 200, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: height > 700 ? theme.spacing.xl : theme.spacing.md 
  },
  logoBadge: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    backgroundColor: theme.colors.primary, 
    justifyContent: "center", 
    alignItems: "center", 
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoText: { 
    color: theme.colors.surface, 
    fontSize: 42, 
    fontWeight: theme.typography.fontWeights.bold 
  },
  avatarBubble: { 
    position: "absolute", 
    borderRadius: 100, 
    overflow: "hidden", 
    borderWidth: 2, 
    borderColor: theme.colors.surface, 
    backgroundColor: theme.colors.border, 
    zIndex: 5 
  },
  avatar1: { width: 48, height: 48, top: 15, left: 15 },
  avatar2: { width: 42, height: 42, top: 5, right: 25 },
  avatar3: { width: 38, height: 38, bottom: 35, left: 5 },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  editorialHeadline: { 
    fontSize: width > 360 ? 32 : 28, 
    fontWeight: "700", 
    color: theme.colors.textPrimary, 
    lineHeight: width > 360 ? 44 : 38, 
    textAlign: "center", 
    letterSpacing: -0.6 
  },
  italicText: { fontStyle: "italic", fontWeight: "400", color: theme.colors.textPrimary },
  brandText: { fontWeight: "800", color: theme.colors.primary },
  subheadline: { 
    fontSize: theme.typography.fontSizes.md, 
    fontWeight: theme.typography.fontWeights.regular, 
    color: theme.colors.textSecondary, 
    textAlign: "center", 
    lineHeight: theme.typography.lineHeights.relaxed, 
    paddingHorizontal: theme.spacing.sm, 
    marginTop: theme.spacing.md 
  },
  actionControlsStack: { 
    width: "100%", 
    alignItems: "center", 
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md
  },
  emailBtn: { 
    width: "100%", 
    backgroundColor: theme.colors.textPrimary, 
    borderRadius: theme.spacing.cardRadius, 
    paddingVertical: theme.spacing.lg, 
    height: 54,
    justifyContent: "center",
    alignItems: "center"
  },
  skipLink: { 
    fontSize: theme.typography.fontSizes.sm, 
    fontWeight: theme.typography.fontWeights.semibold, 
    color: theme.colors.textSecondary, 
    textDecorationLine: "underline", 
    paddingVertical: theme.spacing.xs 
  },
});