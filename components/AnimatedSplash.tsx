import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Animated } from "react-native";
import { Colors } from "../constants/Theme";
import { MotiView, MotiText } from "moti";

// We split the name for staggered animation
const APP_NAME_PART1 = "THE--";
const APP_NAME_PART2 = "--LINK";

export const AnimatedSplash = () => {
  const [fadeAnim] = useState(new Animated.Value(1)); // For fading out the whole screen

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* 1. Moti Animation: Logo slides in and scales */}
      <MotiView
        from={{ opacity: 0, scale: 0.5, translateY: -20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 1000, delay: 200 }}
        style={styles.logoContainer}
      >
        <Image
          source={require("../assets/images/gemini-logo.png")} // Add your logo here
          style={styles.logo}
          resizeMode="contain"
        />
      </MotiView>

      {/* 2. Professional Staggered Text Animation */}
      <View style={styles.textContainer}>
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 800 }} // Wait for logo
          style={styles.brandTextMain}
        >
          {APP_NAME_PART1}
        </MotiText>
        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 800, delay: 1100 }} // Wait for part 1
          style={styles.brandTextAccent}
        >
          {APP_NAME_PART2}
        </MotiText>
      </View>

      {/* 3. Subtle Tagline */}
      <MotiText
        from={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ type: "timing", duration: 1000, delay: 1800 }} // Last thing to show
        style={styles.tagline}
      >
        Gen-Z E-Commerce Partner
      </MotiText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject, // IMPORTANT: Overlay above everything
    backgroundColor: Colors.primary, // Use your blue brand color
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, // IMPORTANT: Ensure it is on top
  },
  logoContainer: {
    marginBottom: 30,
    backgroundColor: Colors.white, // professional padding around logo
    padding: 10,
    borderRadius: 50,
    // Professional shadow
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  logo: {
    width: 80,
    height: 80,
  },
  textContainer: {
    flexDirection: "row", // Horizontal text layout
    alignItems: "center",
  },
  brandTextMain: {
    fontSize: 40,
    fontWeight: "900", // Very professional bold weight
    color: Colors.white,
    letterSpacing: -1,
  },
  brandTextAccent: {
    fontSize: 40,
    fontWeight: "900",
    color: Colors.textMain, // A slightly lighter/different blue/accent color
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 15,
    fontWeight: "500",
    letterSpacing: 1, // Professional spaced look
  },
});
