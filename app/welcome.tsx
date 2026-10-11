import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Colors } from "../constants/Theme";
import { useBranding } from "@/features/branding/hooks/BrandingProvider";
import { welcomeSlides } from "@/features/branding/utils/brandingModel";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SlideItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  accentColor: string;
}

export default function WelcomeScreen() {
  const router = useRouter();
  const { branding } = useBranding();
  const ONBOARDING_SLIDES = useMemo<SlideItem[]>(
    () => welcomeSlides(branding, [Colors.primary, Colors.accent, Colors.success, Colors.error]) as SlideItem[],
    [branding],
  );
  const flatListRef = useRef<FlatList<SlideItem>>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Mark onboarding complete and initialize layout swap
  const completeOnboarding = async () => {
    try {
      await SecureStore.setItemAsync("HAS_LAUNCHED", "true");
      router.replace("/(tabs)");
    } catch (error) {
      console.log("Could not write onboarding tokens:", error);
      router.replace("/(tabs)");
    }
  };

  // Process manual sliding step increments
  const handleNextAction = () => {
    const nextIndex = currentSlideIndex + 1;
    if (nextIndex < ONBOARDING_SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentSlideIndex(nextIndex);
    } else {
      completeOnboarding();
    }
  };

  // Sync index on human touch gestures
  const updateMomentumIndex = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const computedIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentSlideIndex(computedIndex);
  };

  return (
    <View style={styles.container}>
      {/* 🌟 THE TOP CONTROL: Skip button for real-world production setups */}
      <View style={styles.headerControls}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={completeOnboarding}
          style={styles.skipTouchBlock}
        >
          <Text style={styles.skipText}>Skip</Text>
          <Ionicons name="chevron-forward" size={14} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* 🌟 THE MIDDLE GROUND: FlatList slider with full layout width pagination parameters */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={updateMomentumIndex}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.slideCanvas}>
            {/* Soft vector layout placeholder box layered with entrance scale micro-animations */}
            <MotiView
              from={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 400 }}
              style={styles.illustrationCard}
            >
              <View
                style={[
                  styles.avatarCircle,
                  { backgroundColor: "rgba(255,255,255,0.06)" },
                ]}
              >
                {item.id === "2" ? (
                  <Ionicons
                    name="shirt-outline"
                    size={82}
                    color={Colors.white}
                  />
                ) : (
                  <Ionicons
                    name={item.icon as any}
                    size={82}
                    color={Colors.white}
                  />
                )}
              </View>
            </MotiView>

            <View style={styles.typographyFrame}>
              <Text style={styles.titleString}>{item.title}</Text>
              <Text style={styles.descriptionString}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* 🌟 THE BASEBOARD: Layout pagination dots and shifting structural actions */}
      <View style={styles.footerLayout}>
        {/* Active Dot Indicators */}
        <View style={styles.indicatorContainer}>
          {ONBOARDING_SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dotElement,
                currentSlideIndex === index ? styles.activeDotElement : null,
              ]}
            />
          ))}
        </View>

        {/* Dynamic Context Button Change */}
        <TouchableOpacity
          style={styles.actionPillButton}
          activeOpacity={0.85}
          onPress={handleNextAction}
        >
          <Text style={styles.actionPillText}>
            {currentSlideIndex === ONBOARDING_SLIDES.length - 1
              ? "GET STARTED"
              : "CONTINUE"}
          </Text>
          <Ionicons
            name={
              currentSlideIndex === ONBOARDING_SLIDES.length - 1
                ? "checkmark-circle"
                : "arrow-forward"
            }
            size={16}
            color="#0F172A"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#1E3A8A",
    backgroundColor: Colors.headerOne[1],
  },
  headerControls: {
    height: 60,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 40,
    zIndex: 10,
  },
  skipTouchBlock: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skipText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 2,
  },
  slideCanvas: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  illustrationCard: {
    width: SCREEN_WIDTH * 0.75,
    height: SCREEN_HEIGHT * 0.32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  typographyFrame: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  titleString: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  descriptionString: {
    fontSize: 14,
    color: "#93C5FD", // Lighter slate blue accent line copy text
    textAlign: "center",
    lineHeight: 22,
  },
  footerLayout: {
    paddingHorizontal: 32,
    paddingBottom: 60,
    alignItems: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  dotElement: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 5,
  },
  activeDotElement: {
    width: 24, // High-end dynamic capsule expansion active indicator highlight
    backgroundColor: "#FFFFFF",
  },
  actionPillButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  actionPillText: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
