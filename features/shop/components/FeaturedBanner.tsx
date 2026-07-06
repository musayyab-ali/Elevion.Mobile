import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Theme";

interface FeaturedBannerProps {
  data: any[];
  onPress: (item: any) => void;
  variant?: "home" | "minimal";
}

const PLACEHOLDER_IMAGE_BANNER =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/No-Image-Placeholder-banner.svg/1280px-No-Image-Placeholder-banner.svg.png";

export const FeaturedBanner = ({
  data,
  onPress,
  variant = "home",
}: FeaturedBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isMinimal = variant === "minimal";

  const maxContainerWidth = windowWidth > 768 ? 720 : windowWidth;
  const itemWidth = isMinimal ? maxContainerWidth - 32 : maxContainerWidth;

  useEffect(() => {
    if (data.length <= 1) return;

    const interval = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= data.length) nextIndex = 0;

      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, data.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / itemWidth);
    if (index !== activeIndex && index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const title = item.BannerText || item.Name;

    return (
      <TouchableOpacity
        style={[
          styles.bannerCard,
          { width: itemWidth },
          isMinimal && styles.minimalCard,
        ]}
        onPress={() => onPress(item)}
        disabled={!item.Clickable}
        activeOpacity={item.Clickable ? 0.85 : 1}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri: item.ImagePath || PLACEHOLDER_IMAGE_BANNER,
            }}
            style={[styles.bannerImage, isMinimal && styles.minimalImage]}
          />
          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.75)"]}
            style={[styles.bannerGradient, isMinimal && styles.minimalGradient]}
          >
            <View style={styles.textContainer}>
              <Text style={styles.bannerText} numberOfLines={2}>
                {title}
              </Text>
              {!isMinimal && item.BannerSubText && (
                <Text style={styles.actionSubtitle} numberOfLines={3}>
                  {item.BannerSubText}
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.featuredWrapper,
        isMinimal && styles.minimalWrapper,
        { width: maxContainerWidth, alignSelf: "center" },
      ]}
    >
      {isMinimal && <Text style={styles.minimalHeading}>New Arrivals</Text>}

      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled={!isMinimal}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          (
            item.BannerId ||
            item.ProductId ||
            item.CategoryId ||
            index
          ).toString()
        }
        onMomentumScrollEnd={handleScroll}
      />

      {data.length > 1 && (
        <View
          style={[
            styles.indicatorContainer,
            isMinimal && styles.minimalIndicators,
          ]}
        >
          {data.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicatorDot,
                activeIndex === index ? styles.activeDot : styles.inactiveDot,
                isMinimal &&
                  (activeIndex === index
                    ? styles.activeDotMinimal
                    : styles.inactiveDotMinimal),
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  featuredWrapper: {
    paddingTop: 16, // Cleaned up header breathing space clearance matrix
    paddingBottom: 20,
    borderBottomRightRadius: 32,
    borderBottomLeftRadius: 32,
  },
  minimalWrapper: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  minimalHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 16,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  bannerCard: {
    paddingHorizontal: 16,
    height: 185,
  },
  minimalCard: {
    paddingHorizontal: 16,
    height: 190,
  },
  imageWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  minimalImage: {
    borderRadius: 16,
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 20,
  },
  minimalGradient: {
    borderRadius: 16,
  },
  textContainer: {
    maxWidth: "85%",
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  actionSubtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    position: "absolute",
    bottom: 28,
    left: 0,
    right: 0,
  },
  minimalIndicators: {
    position: "relative",
    bottom: 0,
    marginTop: 12,
  },
  indicatorDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 18,
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    width: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  activeDotMinimal: {
    backgroundColor: Colors.headerOne[0],
    width: 18,
  },
  inactiveDotMinimal: {
    backgroundColor: "#CBD5E1",
    width: 6,
  },
});
