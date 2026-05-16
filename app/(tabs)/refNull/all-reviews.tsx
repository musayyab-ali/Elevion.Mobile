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
  const { reviews, loading, refresh } = useReviews();

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item, index) => item.ProductId.toString() + index}
        renderItem={({ item }) => <ReviewItem item={item} />}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60, // Adjust based on your status bar height
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.headerOne[0],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.white },
  listContent: { padding: 20, paddingBottom: 40 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, color: Colors.tertiary, fontSize: 16 },
});
