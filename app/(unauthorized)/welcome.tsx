import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView, MotiText } from "moti";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Theme";
import { AppButton } from "../../components/AppButton";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Responsive helper
const isTablet = SCREEN_WIDTH > 600;

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Background Gradient (Dark Bluish Theme) */}
      <LinearGradient
        // colors={["#001d3d", "#000814"]}
        colors={[Colors.textMain, Colors.primary]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.contentContainer}>
        {/* 2. Top Section: Logo & Branding */}
        <MotiView
          from={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          style={styles.logoWrapper}
        >
          <Image
            source={require("../../assets/images/gemini-logo.png")} // Use your transparent logo PNG
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <MotiText
            from={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 300 }}
            style={styles.brandTitle}
          >
            THE LINK
          </MotiText>
          <Text style={styles.brandSlogan}>Everything. Delivered Fast.</Text>
        </MotiView>

        {/* 3. Bottom Section: Curved Glassmorphism Card */}
        <MotiView
          from={{ translateY: SCREEN_HEIGHT * 0.4 }}
          animate={{ translateY: 0 }}
          transition={{ type: "spring", damping: 15 }}
          style={styles.bottomCard}
        >
          <View style={styles.cardContent}>
            <Text style={styles.welcomeBackText}>Welcome Back!</Text>
            <View style={styles.accentLine} />

            <View style={styles.buttonGroup}>
              <AppButton
                title="LOGIN TO ACCOUNT"
                onPress={() => router.push("/(unauthorized)/login")}
                style={styles.loginBtn}
                textStyle={styles.btnText}
              />

              <AppButton
                title="CREATE ACCOUNT"
                variant="outline"
                onPress={() => router.push("/(unauthorized)/register")}
                style={styles.registerBtn}
                textStyle={styles.registerBtnText}
              />
            </View>
          </View>
        </MotiView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { flex: 1, alignItems: "center" },

  // -- Logo Section --
  logoWrapper: {
    marginTop: SCREEN_HEIGHT * 0.12,
    alignItems: "center",
    width: "100%",
  },
  logoIcon: {
    width: isTablet ? 200 : 140,
    height: isTablet ? 200 : 140,
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: isTablet ? 48 : 36,
    fontWeight: "900",
    color: Colors.secondary, // Cyan-blue glow
    letterSpacing: 4,
  },
  brandSlogan: {
    fontSize: 16,
    color: "#e0e1dd",
    marginTop: 5,
    fontWeight: "500",
    opacity: 0.8,
  },

  // -- Bottom Card (The Curve) --
  bottomCard: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Glass effect
    borderTopLeftRadius: 80,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: isTablet ? 80 : 40,
    paddingTop: 40,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Additional layer for glassmorphism
  },
  welcomeBackText: {
    fontSize: isTablet ? 38 : 30,
    fontWeight: "700",
    color: Colors.secondary,
    textAlign: "center",
  },
  accentLine: {
    width: 60,
    height: 4,
    backgroundColor: "#00b4d8",
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 40,
  },

  // -- Buttons --
  buttonGroup: {
    width: "100%",
    gap: 15,
  },
  loginBtn: {
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0077b6",
    shadowColor: "#00b4d8",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  registerBtn: {
    height: 60,
    borderRadius: 30,
    borderColor: "#60efff",
    borderWidth: 1.5,
    backgroundColor: Colors.secondary,
  },
  btnText: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  registerBtnText: {
    color: "#60efff",
    fontWeight: "800",
  },
});
