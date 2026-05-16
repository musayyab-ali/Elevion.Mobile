import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useWishlist } from "../hooks/useWishlist";
import { Colors } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { ErrorMessage } from "@/components/ErrorMessage";

export const WishlistScreen = () => {
  const {
    items,
    loading,
    refreshing,
    fetchWishlist,
    removeFromWishlist,
    apiMessage,
  } = useWishlist();

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.headerOne[0]} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.ProductImage }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {item.ProductName}
        </Text>
        <Text style={styles.category}>{item.Category?.CategoryName}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            ${item.DiscountedPrice || item.Price}
          </Text>
          {item.Discount > 0 && (
            <Text style={styles.oldPrice}>${item.Price}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFromWishlist(item.WishListId)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>}
      <FlatList
        data={items}
        keyExtractor={(item) => item.WishListId.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchWishlist(true)}
            tintColor={Colors.headerOne[0]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="heart-dislike-outline"
              size={60}
              color={Colors.secondary}
            />
            <Text style={styles.emptyText}>Your wishlist is empty</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 15 },
  card: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 15,
    padding: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: "center",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  details: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
  category: { fontSize: 12, color: Colors.tertiary, marginTop: 2 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  price: { fontSize: 15, fontWeight: "700", color: Colors.headerOne[0] },
  oldPrice: {
    fontSize: 12,
    color: Colors.tertiary,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#FF4D4D",
    padding: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  empty: { marginTop: 100, alignItems: "center" },
  emptyText: { marginTop: 10, color: Colors.tertiary, fontSize: 16 },
});
