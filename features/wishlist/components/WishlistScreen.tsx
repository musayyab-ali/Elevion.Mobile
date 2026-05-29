// import React from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { useWishlist } from "../hooks/useWishlist";
// import { Colors } from "../../../constants/Theme";
// import { Ionicons } from "@expo/vector-icons";
// import { ErrorMessage } from "@/components/ErrorMessage";

// export const WishlistScreen = () => {
//   const {
//     items,
//     loading,
//     refreshing,
//     fetchWishlist,
//     removeFromWishlist,
//     apiMessage,
//   } = useWishlist();

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={Colors.headerOne[0]} />
//       </View>
//     );
//   }

//   const renderItem = ({ item }: { item: any }) => (
//     <View style={styles.card}>
//       <Image
//         source={{ uri: item.ProductImage }}
//         style={styles.image}
//         resizeMode="cover"
//       />
//       <View style={styles.details}>
//         <Text style={styles.name} numberOfLines={1}>
//           {item.ProductName}
//         </Text>
//         <Text style={styles.category}>{item.Category?.CategoryName}</Text>
//         <View style={styles.priceRow}>
//           <Text style={styles.price}>
//             ${item.DiscountedPrice || item.Price}
//           </Text>
//           {item.Discount > 0 && (
//             <Text style={styles.oldPrice}>${item.Price}</Text>
//           )}
//         </View>
//       </View>
//       <TouchableOpacity
//         style={styles.deleteButton}
//         onPress={() => removeFromWishlist(item.WishListId)}
//       >
//         <Ionicons name="trash-outline" size={20} color={Colors.white} />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>}
//       <FlatList
//         data={items}
//         keyExtractor={(item) => item.WishListId.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={() => fetchWishlist(true)}
//             tintColor={Colors.headerOne[0]}
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <Ionicons
//               name="heart-dislike-outline"
//               size={60}
//               color={Colors.secondary}
//             />
//             <Text style={styles.emptyText}>Your wishlist is empty</Text>
//           </View>
//         }
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.white },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   listContent: { padding: 15 },
//   card: {
//     flexDirection: "row",
//     backgroundColor: Colors.white,
//     borderRadius: 12,
//     marginBottom: 15,
//     padding: 10,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     alignItems: "center",
//   },
//   image: {
//     width: 80,
//     height: 80,
//     borderRadius: 8,
//     backgroundColor: Colors.secondary,
//   },
//   details: { flex: 1, marginLeft: 15 },
//   name: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
//   category: { fontSize: 12, color: Colors.tertiary, marginTop: 2 },
//   priceRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
//   price: { fontSize: 15, fontWeight: "700", color: Colors.headerOne[0] },
//   oldPrice: {
//     fontSize: 12,
//     color: Colors.tertiary,
//     textDecorationLine: "line-through",
//     marginLeft: 8,
//   },
//   deleteButton: {
//     backgroundColor: "#FF4D4D",
//     padding: 8,
//     borderRadius: 8,
//     marginLeft: 10,
//   },
//   empty: { marginTop: 100, alignItems: "center" },
//   emptyText: { marginTop: 10, color: Colors.tertiary, fontSize: 16 },
// });

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Theme";
import { useWishlistScreen, WishlistItem } from "../hooks/useWishlistScreen";

const IMAGE_BASE_URL = "http://thelink.innovex.biz/";
const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

export const WishlistScreen = () => {
  const { width } = useWindowDimensions();
  const {
    wishlistItems,
    loading,
    isProcessing,
    handleNavigateToDetails,
    handleRemoveItem,
  } = useWishlistScreen();

  // Dynamic distribution matrix tracking
  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  console.log(`wishlist items are: ${wishlistItems}`);
  // Stupendous Luxury Skeleton Loading State Shimmer Module
  const renderSkeletons = () => (
    <View style={styles.gridContainer}>
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`skel-${index}`}
          style={[styles.gridCell, { maxWidth: `${100 / calculatedColumns}%` }]}
        >
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={{ type: "timing", duration: 800, loop: true }}
            style={styles.skeletonCard}
          >
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonTextLine} />
            <View style={[styles.skeletonTextLine, { width: "60%" }]} />
          </MotiView>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.headerOne?.[0] || "#0F172A" },
      ]}
    >
      {/* <Stack.Screen
        options={{
          headerTitle: "My Saved Wishlist",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne?.[0] || "#0F172A" },
          headerTitleStyle: styles.navBarTitle,
          headerTintColor: "#FFFFFF",
          headerTitleAlign: "center",
        }}
      /> */}

      {/* Main Luxury White Sheet Content Canvas */}
      <View style={styles.contentCanvas}>
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={wishlistItems}
            numColumns={calculatedColumns}
            key={calculatedColumns}
            keyExtractor={(item) => `wish-${item.ProductId}`}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              wishlistItems.length > 0 ? (
                <Text style={styles.savedCounterText}>
                  Your Collection ({wishlistItems.length} Premium items saved)
                </Text>
              ) : null
            }
            renderItem={({ item, index }) => {
              const imageUri = item.ImageName
                ? `${IMAGE_BASE_URL}${item.ImageName}`
                : FALLBACK_PLACEHOLDER;
              const processingState = isProcessing(item.ProductId);

              return (
                <MotiView
                  from={{ opacity: 0, scale: 0.95, translateY: 10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 350,
                    delay: index * 50,
                  }}
                  style={[
                    styles.gridCell,
                    { maxWidth: `${100 / calculatedColumns}%` },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleNavigateToDetails(item.ProductId)}
                    style={styles.productCard}
                  >
                    {/* Media Frame wrapper */}
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.productImage}
                      />

                      {/* Interactive absolute delete heart badge layer module */}
                      <TouchableOpacity
                        style={styles.removeFloatingButton}
                        activeOpacity={0.7}
                        disabled={processingState}
                        onPress={() => handleRemoveItem(item.ProductId)}
                      >
                        {processingState ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons name="heart" size={18} color="#EF4444" />
                        )}
                      </TouchableOpacity>

                      {!item.InStock && (
                        <View style={styles.outOfStockOverlay}>
                          <Text style={styles.outOfStockText}>
                            Out of Stock
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Metadata summary text boundaries */}
                    <View style={styles.detailsBlock}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.ProductName}
                      </Text>
                      <Text style={styles.priceString} numberOfLines={1}>
                        {item.MinPrice === item.MaxPrice
                          ? `Rs. ${item.MinPrice.toLocaleString()}`
                          : `Rs. ${item.MinPrice.toLocaleString()} - ${item.MaxPrice.toLocaleString()}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="heart-dislike-outline"
                    size={38}
                    color="#94A3B8"
                  />
                </View>
                <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the heart icon on any premium item collection catalog to
                  save your favorites here.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  rowWrapper: {
    justifyContent: "flex-start",
    paddingHorizontal: 10,
  },
  gridCell: {
    flex: 1,
    padding: 6,
  },
  savedCounterText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  productCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeFloatingButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 4,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: "uppercase",
  },
  detailsBlock: {
    padding: 12,
  },
  productName: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceString: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "700",
  },
  /* Empty State Presentation Layouts */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    paddingHorizontal: 44,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  /* Shimmer Skeleton Architecture Elements */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  skeletonCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 6,
    width: "85%",
  },
});
