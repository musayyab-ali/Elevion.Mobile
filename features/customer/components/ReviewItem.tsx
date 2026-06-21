import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";

interface ReviewItemProps {
  item: any;
  onPressDetails?: () => void;
}

// Universal parser capable of translating both formatting variants cleanly
const formatReviewDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    // 1. Detect if it's the ISO standard variant string style: "2026-06-20 08:05:47"
    if (dateString.includes("-")) {
      // Standardize the spacing variant to allow Javascript's native engine to parse safely
      const normalizedString = dateString.replace(" ", "T");
      const nativeDate = new Date(normalizedString);

      if (!isNaN(nativeDate.getTime())) {
        return (
          nativeDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) +
          " at " +
          nativeDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        );
      }
    }

    // 2. Fallback parser signature engine matching the slashing design format: "6/15/2026 3:45:09 PM"
    const parts = dateString.split(" ");
    if (parts.length >= 2) {
      const datePart = parts[0];
      const timePart = parts[1];
      const ampm = parts[2] ? ` ${parts[2]}` : "";

      const [m, d, y] = datePart.split("/");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const monthName = months[parseInt(m, 10) - 1] || m;

      const timeChunks = timePart.split(":");
      const simpleTime =
        timeChunks.length >= 2 ? `${timeChunks[0]}:${timeChunks[1]}` : timePart;

      return `${monthName} ${d}, ${y} at ${simpleTime}${ampm}`;
    }

    return dateString;
  } catch (e) {
    console.log("Error parsing date variation layout structure", e);
    return dateString;
  }
};

export const ReviewItem = ({ item, onPressDetails }: ReviewItemProps) => {
  const formattedDate = formatReviewDate(item?.ReviewPostedDate);

  return (
    <View style={styles.reviewCard}>
      {/* Product Information Header */}
      <View style={styles.headerRow}>
        <Image source={{ uri: item.ImagePath }} style={styles.productImg} />
        <View style={styles.content}>
          <View style={styles.metaTop}>
            <Text style={styles.categoryBadge}>
              {item?.Category?.CategoryName || "Verified Purchase"}
            </Text>
            {formattedDate ? (
              <Text style={styles.dateText}>{formattedDate}</Text>
            ) : null}
          </View>

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
                style={{ marginRight: 2 }}
              />
            ))}
            <Text style={styles.ratingText}>({item.Rating}.0)</Text>
          </View>
        </View>
      </View>

      {/* Modern Feedback Review Body Block */}
      <View style={styles.reviewBubble}>
        <Ionicons
          name="chatbubble-ellipses"
          size={16}
          color="#CBD5E1"
          style={styles.quoteIcon}
        />
        <Text style={styles.reviewText}>{item.Review}</Text>
      </View>

      {/* Card Action Row footer layout */}
      {onPressDetails && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={onPressDetails}
          >
            <Text style={styles.detailsButtonText}>View Product</Text>
            <Ionicons name="arrow-forward" size={14} color="#0284C7" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  reviewCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  content: {
    marginLeft: 14,
    flex: 1,
  },
  metaTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 11,
    color: "#94A3B8",
    marginLeft: "auto",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 6,
  },
  reviewBubble: {
    marginTop: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
    position: "relative",
  },
  quoteIcon: {
    position: "absolute",
    top: -6,
    left: 8,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 4,
  },
  reviewText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    fontWeight: "400",
    paddingTop: 2,
  },
  actionRow: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    marginTop: 12,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F0F9FF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0284C7",
  },
});
