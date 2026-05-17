import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "../../../constants/Theme";

interface CategoryCardProps {
  category: {
    Name: string;
    ImagePath?: string;
  };
  onPress: (category: any) => void;
}

// Fallback high-fidelity placeholder image
const PLACEHOLDER_IMAGE =
  "https://burst.shopifycdn.com/photos/model-in-gold-fashion.jpg?width=1000&format=pjpg&exif=0&iptc=0";

export const CategoryCard = ({ category, onPress }: CategoryCardProps) => {
  const validImageUri =
    category.ImagePath && category.ImagePath.startsWith("http")
      ? category.ImagePath
      : PLACEHOLDER_IMAGE;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category)}
      activeOpacity={0.75}
    >
      {/* Aspect ratio bounding box ensures perfect layout proportions on phone + tablet */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: validImageUri }} style={styles.image} />
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.categoryName} numberOfLines={1}>
          {category.Name}
        </Text>
        <Text style={styles.exploreLabel}>Explore Now</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    width: "100%", // Controlled fluidly by FlatList grid items
    marginBottom: 4,
    overflow: "hidden",

    // Subtle luxury outer border finish
    borderWidth: 1,
    borderColor: "#E2E8F0",

    // Smooth depth system
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1.3, // Keeps card layouts universally balanced on any form factor
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoBlock: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A", // Slate-900 high contrast
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  exploreLabel: {
    fontSize: 11,
    color: Colors.headerOne[0], // Your signature primary color brand accent
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
