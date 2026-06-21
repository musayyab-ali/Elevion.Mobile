import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

interface CategoryCardProps {
  category: {
    Name: string;
    ImagePath?: string;
  };
  onPress: (category: any) => void;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80";

export const CategoryCard = React.memo(
  ({ category, onPress }: CategoryCardProps) => {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={() => onPress(category)}
        activeOpacity={0.8}
      >
        <View style={styles.circleOuterRing}>
          <Image
            source={{ uri: category.ThumbnailImagePath || PLACEHOLDER_IMAGE }}
            style={styles.image}
          />
        </View>
        <Text
          style={styles.categoryName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {category.Name}
        </Text>
      </TouchableOpacity>
    );
  },
);

CategoryCard.displayName = "CategoryCard";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: 80, // Increased width
    marginHorizontal: 8,
  },
  circleOuterRing: {
    width: 80, // Increased size
    height: 80, // Increased size
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    padding: 3,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    marginBottom: 8,
    // Add shadow back
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    lineHeight: 16, // Better for 2 lines
    width: "100%",
  },
});
