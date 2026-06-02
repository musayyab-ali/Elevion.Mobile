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
  "data:image/jpeg;base64,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";

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
