// import { useLocalSearchParams, Stack, useRouter } from "expo-router";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Text,
// } from "react-native";
// import { useCategories } from "../../../features/shop/hooks/useCategories";
// import { CategoryCard } from "../../../features/shop/components/CategoryCard";
// import { Colors } from "../../../constants/Theme";
// import { Ionicons } from "@expo/vector-icons";
// import { FeaturedBanner } from "@/features/shop/components/FeaturedBanner";
// import { useDiscovery } from "@/features/shop/hooks/useDiscovery";

// export default function SubCategoryScreen() {
//   const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
//   const router = useRouter();
//   const { subCategories, bannerProducts, loading } = useDiscovery(id);

//   const handlePress = (item: any) => {
//     if (item.IsLeafNode) {
//       // GO TO PRODUCT LISTING
//       router.push({
//         pathname: "/(tabs)/category/products",
//         params: { categoryId: item.CategoryId, categoryName: item.Name },
//       });
//     } else {
//       // GO TO NEXT SUB-CATEGORY LEVEL
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: item.CategoryId.toString(), name: item.Name },
//       });
//     }
//   };

//   if (loading)
//     return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />;

//   return (
//     <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
//       <Stack.Screen options={{ title: name || "Categories" }} />
//       <FlatList
//         data={subCategories}
//         numColumns={2}
//         keyExtractor={(item) => `sub-${item.CategoryId}`}
//         ListHeaderComponent={
//           <>
//             {bannerProducts.length > 0 && (
//               <FeaturedBanner
//                 data={bannerProducts}
//                 onPress={(p) =>
//                   router.push({
//                     pathname: "/(tabs)/category/product-details",
//                     params: { productId: p.ProductId },
//                   })
//                 }
//               />
//             )}
//             {subCategories.length > 0 && (
//               <Text style={styles.sectionTitle}>Sub-Categories</Text>
//             )}
//           </>
//         }
//         renderItem={({ item }) => (
//           <CategoryCard category={item} onPress={() => handlePress(item)} />
//         )}
//         ListEmptyComponent={
//           !bannerProducts.length ? (
//             <Text style={{ textAlign: "center", marginTop: 50 }}>
//               No items in this category
//             </Text>
//           ) : null
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   row: {
//     justifyContent: "space-between",
//     paddingHorizontal: 15,
//     marginBottom: 15,
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 100,
//   },
//   empty: { textAlign: "center", marginTop: 10, color: "#94a3b8", fontSize: 16 },
//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#1E293B",
//     paddingHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 10,
//   },
// });

// import { useLocalSearchParams, Stack, useRouter } from "expo-router";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   useWindowDimensions,
// } from "react-native";
// import { Colors } from "../../../constants/Theme";
// import { Ionicons } from "@expo/vector-icons";
// import { FeaturedBanner } from "@/features/shop/components/FeaturedBanner";
// import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
// import { CategoryCard } from "../../../features/shop/components/CategoryCard";

// export default function SubCategoryScreen() {
//   const { id } = useLocalSearchParams<{ id: string; name: string }>();
//   const router = useRouter();
//   const { width } = useWindowDimensions(); // Hook for full responsiveness
//   const { subCategories, bannerProducts, loading, breadcrumbs } =
//     useDiscovery(id);
//   console.log(breadcrumbs);
//   const handlePress = (item: any) => {
//     if (item.IsLeafNode) {
//       router.push({
//         pathname: "/(tabs)/category/products",
//         params: { categoryId: item.CategoryId, categoryName: item.Name },
//       });
//     } else {
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: item.CategoryId.toString(), name: item.Name },
//       });
//     }
//   };

//   // Safe manual redirection handler for historical breadcrumb navigation links
//   const handleBreadcrumbNavigation = (crumb: any, index: number) => {
//     // If clicking the current active screen crumb, do nothing
//     if (index === breadcrumbs.length - 1) return;

//     if (crumb.isLeaf) {
//       router.push({
//         pathname: "/(tabs)/category/products",
//         params: { categoryId: crumb.id, categoryName: crumb.name },
//       });
//     } else {
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: crumb.id.toString(), name: crumb.name },
//       });
//     }
//   };

//   if (loading)
//     return <ActivityIndicator style={styles.loader} color={Colors.primary} />;

//   // Calculate dynamic column sizes responsive to current width constraints
//   const numColumns = width > 600 ? 3 : 2;

//   return (
//     <View style={styles.container}>
//       {/* Custom Native Stack Header Configuration */}
//       <Stack.Screen
//         options={{
//           headerTitle: () => (
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.breadcrumbScroll}
//             >
//               {/* Home Base Node Trigger */}
//               <TouchableOpacity
//                 onPress={() => router.replace("/(tabs)/category")}
//               >
//                 <Text style={styles.homeCrumbText}>Home</Text>
//               </TouchableOpacity>

//               {breadcrumbs.map((crumb, index) => {
//                 const isLast = index === breadcrumbs.length - 1;
//                 return (
//                   <View key={crumb.id} style={styles.crumbWrapper}>
//                     <Ionicons
//                       name="chevron-forward"
//                       size={14}
//                       color="#94A3B8"
//                       style={styles.chevron}
//                     />
//                     <TouchableOpacity
//                       onPress={() => handleBreadcrumbNavigation(crumb, index)}
//                       disabled={isLast}
//                     >
//                       <Text
//                         style={[styles.crumbText, isLast && styles.activeCrumb]}
//                       >
//                         {crumb.name}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 );
//               })}
//             </ScrollView>
//           ),
//           headerShadowVisible: false,
//           headerStyle: { backgroundColor: "#F8FAFC" },
//           headerTitleAlign: "left",
//         }}
//       />

//       <FlatList
//         data={subCategories}
//         numColumns={numColumns}
//         key={width} // Forces re-layout if layout shifts from Portrait to Landscape orientation
//         keyExtractor={(item) => `sub-${item.CategoryId}`}
//         columnWrapperStyle={styles.row}
//         ListHeaderComponent={
//           <>
//             {bannerProducts.length > 0 && (
//               <FeaturedBanner
//                 data={bannerProducts}
//                 onPress={(p) =>
//                   router.push({
//                     pathname: "/(tabs)/category/product-details",
//                     params: { productId: p.ProductId },
//                   })
//                 }
//               />
//             )}
//             {subCategories.length > 0 && (
//               <Text style={styles.sectionTitle}>Sub-Categories</Text>
//             )}
//           </>
//         }
//         renderItem={({ item }) => (
//           <View style={{ flex: 1, maxWith: width / numColumns }}>
//             <CategoryCard category={item} onPress={() => handlePress(item)} />
//           </View>
//         )}
//         ListEmptyComponent={
//           !bannerProducts.length ? (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.empty}>No items in this category</Text>
//             </View>
//           ) : null
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   loader: { flex: 1, justifyContent: "center", alignItems: "center" },
//   breadcrumbScroll: {
//     alignItems: "center",
//     paddingVertical: 5,
//     paddingRight: 20,
//   },
//   crumbWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   homeCrumbText: {
//     fontSize: 14,
//     color: "#64748B",
//     fontWeight: "500",
//   },
//   chevron: {
//     marginHorizontal: 4,
//   },
//   crumbText: {
//     fontSize: 14,
//     color: "#64748B",
//     fontWeight: "500",
//   },
//   activeCrumb: {
//     color: "#1E293B",
//     fontWeight: "800", // Makes current active route category explicitly bold
//   },
//   row: {
//     justifyContent: "flex-start",
//     paddingHorizontal: 10,
//   },
//   emptyContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 100,
//   },
//   empty: { textAlign: "center", color: "#94a3b8", fontSize: 16 },
//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#1E293B",
//     paddingHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 10,
//   },
// });

import React from "react";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { FeaturedBanner } from "@/features/shop/components/FeaturedBanner";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import { CategoryCard } from "../../../features/shop/components/CategoryCard";

// export default function SubCategoryScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { width } = useWindowDimensions();
//   const { subCategories, bannerProducts, breadcrumbs, loading } =
//     useDiscovery(id);

//   const handlePress = (item: any) => {
//     if (item.IsLeafNode) {
//       router.push({
//         pathname: "/(tabs)/category/products",
//         params: { categoryId: item.CategoryId, categoryName: item.Name },
//       });
//     } else {
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: item.CategoryId.toString(), name: item.Name },
//       });
//     }
//   };

//   const handleBreadcrumbPress = (crumb: any, isLast: boolean) => {
//     if (isLast) return; // Already on this screen

//     router.push({
//       pathname: "/(tabs)/category/[id]",
//       params: { id: crumb.id.toString(), name: crumb.name },
//     });
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//       </View>
//     );
//   }

//   // Adjust columns dynamically based on device width
//   const calculatedColumns = width > 600 ? 3 : 2;

//   return (
//     <View style={styles.container}>
//       {/* Native Stack Navigation Link Configuration Header Block */}
//       <Stack.Screen
//         options={{
//           headerTitle: () => (
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.breadcrumbContainer}
//             >
//               <TouchableOpacity onPress={() => router.replace("/(tabs)/index")}>
//                 <Text style={styles.inactiveCrumb}>Home</Text>
//               </TouchableOpacity>

//               {breadcrumbs.map((crumb, idx) => {
//                 const isLast = idx === breadcrumbs.length - 1;
//                 return (
//                   <View key={crumb.id} style={styles.crumbWrapper}>
//                     <Ionicons
//                       name="chevron-forward"
//                       size={12}
//                       color="#94A3B8"
//                       style={styles.chevron}
//                     />
//                     <TouchableOpacity
//                       onPress={() => handleBreadcrumbPress(crumb, isLast)}
//                       disabled={isLast}
//                     >
//                       <Text
//                         style={[
//                           styles.inactiveCrumb,
//                           isLast && styles.activeCrumb,
//                         ]}
//                       >
//                         {crumb.name}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 );
//               })}
//             </ScrollView>
//           ),
//           headerShadowVisible: false,
//           headerStyle: { backgroundColor: Colors.headerOne[0] },
//           headerTitleAlign: "left",
//         }}
//       />

//       <FlatList
//         data={subCategories}
//         numColumns={calculatedColumns}
//         key={calculatedColumns} // Re-renders cleanly if phone shifts orientations
//         keyExtractor={(item) => `sub-${item.CategoryId}`}
//         columnWrapperStyle={styles.rowWrapper}
//         ListHeaderComponent={
//           <>
//             {bannerProducts.length > 0 && (
//               <FeaturedBanner
//                 data={bannerProducts}
//                 onPress={(p) =>
//                   router.push({
//                     pathname: "/(tabs)/category/product-details",
//                     params: { productId: p.ProductId },
//                   })
//                 }
//               />
//             )}
//             {subCategories.length > 0 && (
//               <Text style={styles.sectionTitle}>Sub-Categories</Text>
//             )}
//           </>
//         }
//         renderItem={({ item }) => (
//           <View style={{ flex: 1, margin: 4 }}>
//             <CategoryCard category={item} onPress={() => handlePress(item)} />
//           </View>
//         )}
//         ListEmptyComponent={
//           !bannerProducts.length ? (
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>No categories found here.</Text>
//             </View>
//           ) : null
//         }
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//   },
//   breadcrumbContainer: {
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingRight: 16,
//   },
//   crumbWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   chevron: {
//     marginHorizontal: 4,
//   },
//   inactiveCrumb: {
//     fontSize: 14,
//     color: Colors.white,
//     fontWeight: "400",
//   },
//   activeCrumb: {
//     color: Colors.white,
//     // borderBottomColor: Colors.white,
//     // borderBottomWidth: 1,
//     fontWeight: "800", // Current active item highlighted bold
//   },
//   rowWrapper: {
//     justifyContent: "space-between",
//     paddingHorizontal: 12,
//     marginBottom: 8,
//   },
//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#1E293B",
//     paddingHorizontal: 16,
//     marginTop: 20,
//     marginBottom: 12,
//   },
//   emptyContainer: {
//     marginTop: 80,
//     alignItems: "center",
//   },
//   emptyText: {
//     color: "#94A3B8",
//     fontSize: 15,
//   },
// });

// app/(tabs)/category/[id].tsx

import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";

export default function SubCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { subCategories, bannerProducts, breadcrumbs, loading } =
    useDiscovery(id);

  const handlePress = (item: any) => {
    if (item.IsLeafNode) {
      router.push({
        // pathname: "/(tabs)/category/products",
        pathname: "/products",
        params: { categoryId: item.CategoryId, categoryName: item.Name },
      });
    } else {
      router.push({
        // pathname: "/(tabs)/category/[id]",
        pathname: "/(tabs)/category/[id]",
        params: { id: item.CategoryId.toString(), name: item.Name },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const calculatedColumns = width > 600 ? 3 : 2;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
          headerLeft: () => null, // Keep navigation pure through breadcrumbs
        }}
      />

      <FlatList
        data={subCategories}
        numColumns={calculatedColumns}
        key={calculatedColumns}
        keyExtractor={(item) => `sub-${item.CategoryId}`}
        columnWrapperStyle={styles.rowWrapper}
        ListHeaderComponent={
          <>
            {bannerProducts.length > 0 && (
              <FeaturedBanner
                data={bannerProducts}
                variant="minimal" // Using the customized minimal styling variant
                onPress={(p) =>
                  router.push({
                    pathname: "/(tabs)/category/product-details",
                    params: { productId: p.ProductId },
                  })
                }
              />
            )}
            {subCategories.length > 0 && (
              <Text style={styles.sectionTitle}>Sub-Categories</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1, margin: 4 }}>
            <CategoryCard category={item} onPress={() => handlePress(item)} />
          </View>
        )}
        ListEmptyComponent={
          !bannerProducts.length ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories found here.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  emptyContainer: { marginTop: 80, alignItems: "center" },
  emptyText: { color: "#94A3B8", fontSize: 15 },
});
