import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback, Animated } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../../theme";
import { Button } from "../ui/Button";
import { useAuth } from "../../features/auth/store";

export const AuthGateModal: React.FC = () => {
  const router = useRouter();
  const { registerModalTrigger } = useAuth();
  const [visible, setVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    registerModalTrigger(() => openModal());
  }, []);

  const openModal = () => {
    setVisible(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleNavigate = (path: "/(auth)/login" | "/(auth)/register") => {
    closeModal();
    router.push(path);
  };

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeModal}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.indicator} />
          
          <Text style={styles.title}>Account Required</Text>
          <Text style={styles.subtitle}>
            Please log in or register a profile to request home services and contact local technicians.
          </Text>

          <Button
            label="Log In to Existing Account"
            onPress={() => handleNavigate("/(auth)/login")}
            variant="primary"
            style={styles.button}
          />

          <Button
            label="Create New Profile"
            onPress={() => handleNavigate("/(auth)/register")}
            variant="secondary"
            style={styles.button}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, background: "#1A1A1A" },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.cardRadius,
    borderTopRightRadius: theme.spacing.cardRadius,
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    alignItems: "center",
  },
  indicator: {
    width: 40,
    height: 4,
    background: theme.colors.border,
    borderRadius: 2,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xl,
  },
  button: { width: "100%", marginBottom: theme.spacing.md },
});