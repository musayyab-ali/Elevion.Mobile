import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useReviews } from "../../../features/customer/hooks/useReviews";
import { ReviewItem } from "../../../features/customer/components/ReviewItem";
import { Colors } from "../../../constants/Theme";

const AllReviewsScreen = () => {
  const router = useRouter();

  // Explicitly fetch everything using the 'all' endpoint modifier configuration
  const { reviews, loading, refresh } = useReviews("all");
  const handlePressDetails = (productId: number) => {
    router.push({
      pathname: "/(tabs)/category/product-details",
      params: { productId: String(productId) },
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
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
            <Ionicons
              name="chatbox-ellipses-outline"
              size={64}
              color={Colors.tertiary}
            />
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
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, color: Colors.tertiary, fontSize: 16 },
});
