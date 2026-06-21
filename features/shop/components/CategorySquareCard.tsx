import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80";

export const CategorySquareCard = React.memo(({ category, onPress }: any) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category)}
      activeOpacity={0.85}
    >
      <Image
        source={{
          uri: category.ThumbnailImagePath || PLACEHOLDER_IMAGE,
        }}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {category.Name}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    margin: 6,
    flex: 1,
  },
  image: {
    width: "100%",
    height: 100,
  },
  textContainer: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
});
