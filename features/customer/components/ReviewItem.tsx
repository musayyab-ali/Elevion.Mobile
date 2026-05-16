import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";

export const ReviewItem = ({ item }: { item: any }) => (
  <View style={styles.reviewCard}>
    <View style={styles.row}>
      <Image source={{ uri: item.ImagePath }} style={styles.productImg} />
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.ProductName}
        </Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.Rating ? "star" : "star-outline"}
              size={14}
              color="#EAB308"
            />
          ))}
          <Text style={styles.date}>
            {new Date(item.ReviewPostedDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
    <Text style={styles.reviewText}>{item.Review}</Text>
  </View>
);

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  row: { flexDirection: "row", alignItems: "center" },
  productImg: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  content: { marginLeft: 12, flex: 1 },
  productName: { fontSize: 14, fontWeight: "700", color: Colors.textMain },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  date: { fontSize: 11, color: Colors.tertiary, marginLeft: 8 },
  reviewText: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
    fontStyle: "italic",
  },
});
