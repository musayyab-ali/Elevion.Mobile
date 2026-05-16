// import React from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
// } from "react-native";
// import { useLocalSearchParams, useRouter, Stack } from "expo-router";
// import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
// import ProductCard from "@/features/shop/components/ProductCard";

// export default function ProductListScreen() {
//   const { categoryId, categoryName } = useLocalSearchParams<{
//     categoryId: string;
//     categoryName: string;
//   }>();
//   const router = useRouter();

//   // Fetching products specifically for the leaf-node category
//   const { bannerProducts, loading } = useDiscovery(categoryId);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#38BDF8" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Dynamic Header based on the clicked Category */}
//       <Stack.Screen
//         options={{
//           title: categoryName || "Products",
//           headerTitleStyle: { fontWeight: "800", fontSize: 18 },
//           headerShadowVisible: false,
//           headerStyle: { backgroundColor: "#F8FAFC" },
//         }}
//       />

//       <FlatList
//         data={bannerProducts}
//         // Removed numColumns={2} to allow for professional full-width cards
//         keyExtractor={(item) => `prod-${item.ProductId}`}
//         renderItem={({ item }) => (
//           <ProductCard
//             product={item}
//             onPress={() =>
//               router.push({
//                 pathname: "/(tabs)/category/product-details",
//                 params: { productId: item.ProductId },
//               })
//             }
//           />
//         )}
//         ListHeaderComponent={
//           bannerProducts.length > 0 ? (
//             <Text style={styles.resultsCount}>
//               Showing {bannerProducts.length} items
//             </Text>
//           ) : null
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyTitle}>No Products Found</Text>
//             <Text style={styles.emptySubtitle}>
//               We couldn't find any products in {categoryName}. Check back later!
//             </Text>
//           </View>
//         }
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#F8FAFC",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//   },
//   listContent: {
//     paddingTop: 10,
//     paddingBottom: 40,
//   },
//   resultsCount: {
//     fontSize: 14,
//     color: "#64748b",
//     fontWeight: "600",
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 100,
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#1e293b",
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     textAlign: "center",
//     color: "#94a3b8",
//     fontSize: 15,
//     lineHeight: 22,
//   },
// });

// app/(tabs)/category/products.tsx
import React from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { Colors } from "../constants/Theme";
import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import ProductCard from "@/features/shop/components/ProductCard";
export default function ProductListScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const { bannerProducts, breadcrumbs, loading } = useDiscovery(categoryId);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
          headerLeft: () => null,
        }}
      />

      <FlatList
        data={bannerProducts}
        keyExtractor={(item) => `prod-${item.ProductId}`}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() =>
              router.push({
                // pathname: "/(tabs)/category/product-details",
                pathname: "/product-details",
                params: { productId: item.ProductId },
              })
            }
          />
        )}
        ListHeaderComponent={
          bannerProducts.length > 0 ? (
            <Text style={styles.resultsCount}>
              Showing {bannerProducts.length} items
            </Text>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Products Found</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  listContent: { paddingTop: 15, paddingBottom: 40 },
  resultsCount: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#64748B" },
});
