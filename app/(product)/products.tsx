// import React, { useState } from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   useWindowDimensions,
// } from "react-native";
// import { useLocalSearchParams, useRouter, Stack } from "expo-router";

// import { Colors } from "@/constants/Theme";
// import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";
// import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
// import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
// import ProductCard from "@/features/shop/components/ProductCard";
// import { AuthGuardModal } from "@/components/AuthGuardModal";
// import { useAuth } from "@/store/AuthContext";
// import { CustomErrorMessage } from "@/components/CustomErrorMessage";
// import { useSharedWishlistData } from "@/store/WishlistContext";

// export default function ProductListScreen() {
//   const { isAuthenticated } = useAuth();
//   const { wishMessage } = useSharedWishlistData();
//   const { categoryId, categoryName } = useLocalSearchParams<{
//     categoryId: string;
//     categoryName?: string;
//   }>();
//   const router = useRouter();
//   const [modalVisible, setModalVisible] = useState(false);
//   const { width } = useWindowDimensions();

//   const {
//     bannerProducts,
//     breadcrumbs,
//     loading: discoveryLoading,
//   } = useDiscovery(categoryId);
//   const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

//   if (discoveryLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.primary || "#38BDF8"} />
//       </View>
//     );
//   }

//   // Determine an upscale dynamic heading title text layout
//   const derivedHeading = categoryName
//     ? `${categoryName} Collection`
//     : "Available Products";

//   return (
//     <View style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}>
//       <Stack.Screen
//         options={{
//           headerTitle: () => (
//             // <View style={styles.headerTitleContainer}>
//             <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />
//             // </View>
//           ),
//           headerShadowVisible: false,
//           headerStyle: { backgroundColor: Colors.headerOne[0] },
//           headerTitleAlign: "left",
//           headerBackTitleVisible: false,
//         }}
//       />

//       {wishMessage && <CustomErrorMessage>{wishMessage}</CustomErrorMessage>}

//       <View style={styles.contentCanvas}>
//         <FlatList
//           data={bannerProducts}
//           // 🌟 Professional Change: Enforce a single column list frame for luxury horizontal cards
//           numColumns={1}
//           keyExtractor={(item) => `prod-list-${item.ProductId}`}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ListHeaderComponent={
//             bannerProducts.length > 0 ? (
//               <View style={styles.headerMetaBlock}>
//                 <Text style={styles.collectionHeading}>{derivedHeading}</Text>
//                 <Text style={styles.resultsCount}>
//                   Discovering {bannerProducts.length} premium results
//                 </Text>
//               </View>
//             ) : null
//           }
//           renderItem={({ item, index }) => {
//             const targetDetailId =
//               item.ProductVariantDetail?.productVariantCombinationList?.[0]
//                 ?.ProductDetailId || item.ProductId;
//             const isItemWishlisted = wishlistMap.has(item.ProductId);

//             return (
//               <View style={styles.listCell}>
//                 <ProductCard
//                   product={item}
//                   index={index}
//                   isWishlisted={isItemWishlisted}
//                   isProcessing={isProcessing(item.ProductId)}
//                   onWishlistToggle={() => {
//                     if (!isAuthenticated) {
//                       setModalVisible(true);
//                       return;
//                     }
//                     toggleWishlist(item.ProductId, targetDetailId, item);
//                   }}
//                   onPress={() =>
//                     router.navigate({
//                       pathname: "/(tabs)/category/product-details",
//                       params: { productId: item.ProductId },
//                     })
//                   }
//                 />
//               </View>
//             );
//           }}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyTitle}>No Products Found</Text>
//               <Text style={styles.emptySubtitle}>
//                 We couldn't find items in this specific collection.
//               </Text>
//             </View>
//           }
//         />
//       </View>

//       <AuthGuardModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         title="Account Required"
//         subtitle="Create an account to securely save items to your wishlist across all your devices."
//         iconName="heart"
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerTitleContainer: {
//     flex: 1,
//     paddingRight: 16,
//     justifyContent: "center",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//   },
//   contentCanvas: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     overflow: "hidden",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: -4 },
//     shadowOpacity: 0.04,
//     shadowRadius: 12,
//     elevation: 4,
//   },
//   listContent: {
//     paddingTop: 20,
//     paddingBottom: 110,
//     paddingHorizontal: 16,
//   },
//   listCell: {
//     width: "100%",
//     marginBottom: 14,
//   },
//   headerMetaBlock: {
//     marginBottom: 16,
//     paddingHorizontal: 4,
//   },
//   collectionHeading: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.4,
//     marginBottom: 2,
//     textTransform: "capitalize",
//   },
//   resultsCount: {
//     fontSize: 12,
//     color: "#64748B",
//     fontWeight: "600",
//     textTransform: "uppercase",
//     letterSpacing: 0.4,
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 140,
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 18,
//     fontWeight: "800",
//     color: "#1E293B",
//     marginBottom: 6,
//   },
//   emptySubtitle: {
//     fontSize: 14,
//     color: "#94A3B8",
//     textAlign: "center",
//     fontWeight: "500",
//   },
// });

import { ProductsScreen } from "@/features/shop/components/ProductsScreen";

export default function ProductScreen() {
  return <ProductsScreen />;
}
