import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import ConfettiCannon from "react-native-confetti-cannon";
const { width, height } = Dimensions.get("window");

const STREAMER_COUNT = 18;
const STAR_COUNT = 10;
const COLORS = [
  "#0077b6",
  "#00b4d8",
  "#90e0ef",
  "#FFD700",
  "#10b981",
  "#FF70A6",
];

interface CelebrationOverlayProps {
  visible: boolean;
  message?: string;
}

export const CelebrationOverlay = ({ visible }: CelebrationOverlayProps) => {
  const [internalVisible, setInternalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      const timer = setTimeout(() => setInternalVisible(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {internalVisible && (
        <View style={styles.container} pointerEvents="none">
          <ConfettiCannon
            count={80}
            origin={{ x: width / 2, y: Dimensions.get("window").height }}
            fadeOut={true}
            fallSpeed={3000}
            explosionSpeed={350}
            colors={COLORS}
          />

          {/* 3. Success Card */}
          <MotiView
            from={{ opacity: 0, scale: 0.8, translateY: 40 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, translateY: 40 }}
            transition={{ type: "spring", damping: 5, stiffness: 100 }}
            style={styles.floatingCard}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="checkmark-done-sharp" size={24} color="#fff" />
            </View>
            <View style={styles.textWrapper}>
              <Text style={styles.successTitle}>Verified</Text>
              <Text style={styles.successSub}>Verification Successfull!</Text>
            </View>
          </MotiView>
        </View>
      )}
    </AnimatePresence>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 70,
  },

  floatingCard: {
    flexDirection: "row",
    backgroundColor: "#001d3d",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    width: width * 0.88,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textWrapper: {
    flex: 1,
  },
  successTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  successSub: {
    color: "#cbd5e1",
    fontSize: 14,
    fontWeight: "500",
  },
});
