import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "../../../constants/Theme";

const { width } = Dimensions.get("window");

export const CategoryCard = ({
  category,
  onPress,
  width: customWidth,
  height: customHeight,
}) => {
  const cardWidth = customWidth || (Dimensions.get("window").width - 55) / 2;
  const cardHeight = customHeight || 120;

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => onPress(category)}
    >
      <View style={[styles.imageContainer, { height: cardHeight }]}>
        <Image
          source={{
            uri:
              category.ImagePath ||
              "data:image/png;base64,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",
          }}
          style={styles.image}
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {category.Name}
        </Text>
        <Text style={styles.exploreText}>View Products</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    width: (width - 45) / 2,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.secondary,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: Colors.secondary,
  },
  image: { width: "100%", height: "100%" },
  info: { padding: 12 },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textMain,
    marginBottom: 4,
  },
  exploreText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "600",
  },
});
