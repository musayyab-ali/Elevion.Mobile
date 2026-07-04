import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useReviews } from "../../features/customer/hooks/useReviews";
import { ReviewItem } from "../../features/customer/components/ReviewItem";
import { Colors } from "../../constants/Theme";

const AllReviewsScreen = () => {
  const router = useRouter();
  const { reviews, loading, refresh } = useReviews("all");
  const handlePressDetails = (productId: number) => {
    router.push({
      pathname: "/(product)/product-details",
      params: { productId: String(productId) },
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => item.ProductId.toString() + index}
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
            onPressDetails={() => handlePressDetails(item.ProductId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refresh}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={32}
                color={Colors.white}
              />
            </View>
            <Text style={styles.emptyText}>
              You haven't written any reviews yet.
            </Text>
          </View>
        }
      />
    </View>
  );
};

export default AllReviewsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { color: Colors.accent, fontSize: 16 },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
});
