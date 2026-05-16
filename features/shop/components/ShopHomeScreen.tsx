import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCategories } from "../hooks/useCategories";
import { CategoryCard } from "./CategoryCard";
import { Colors } from "../../../constants/Theme";
import { CategorySkeleton } from "./CategorySkeleton";
import { AddressModal } from "@/features/customer/components/AddressModal";
import { useAddress } from "@/features/customer/hooks/useAddress";
import { FeaturedBanner } from "./FeaturedBanner";
import { ShopHeader } from "./ShopHeader";
import { useDiscovery } from "../hooks/useDiscovery";
const { width } = Dimensions.get("window");

//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const [userName, setUserName] = useState("Customer");
//   const { categories: featuredData, loading: loadingFeatured } = useCategories({
//     IsFeatured: -1,
//     Status: 1,
//   });
//   const { categories: mainMenu, loading: loadingMain } = useCategories({
//     IsFeatured: 1,
//     IsMainMenu: 1,
//     Status: 1,
//   });

//   const { addresses, activeAddress, saveActiveAddress } = useAddress();
//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const loading = loadingFeatured || loadingMain;

//   const getButtonText = () => {
//     if (loading && addresses.length === 0) return "Loading...";
//     return activeAddress ? "Change Address" : "Select Address";
//   };
//   // Animation for the blinking red light
//   const blinkAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     // Blinking logic
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(blinkAnim, {
//           toValue: 1,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//         Animated.timing(blinkAnim, {
//           toValue: 0,
//           duration: 800,
//           useNativeDriver: true,
//         }),
//       ]),
//     ).start();

//     const getUserData = async () => {
//       const name = await SecureStore.getItemAsync("user_name");
//       if (name) setUserName(name);
//       // Logic for address check would go here
//     };
//     getUserData();
//   }, []);

//   const handleCategoryPress = (category: any) => {
//     // If it has children (IsLeafNode is false), go to sub-category screen
//     if (!category.IsLeafNode) {
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: category.CategoryId, name: category.Name },
//       });
//     } else {
//       // Logic for Product Listing will go here
//       console.log("Navigate to Products for:", category.Name);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <View style={[styles.headerContainer, { paddingTop: insets.top + 15 }]}>
//           <View style={styles.skeletonText} />
//           <View
//             style={[styles.skeletonText, { width: "60%", marginTop: 10 }]}
//           />
//         </View>
//         <View style={styles.skel}>
//           <CategorySkeleton style={{ width: "100%" }} />
//         </View>
//         <FlatList
//           data={[1, 2, 3, 4, 5, 6]}
//           numColumns={2}
//           keyExtractor={(item) => item.toString()}
//           columnWrapperStyle={styles.row}
//           renderItem={() => <CategorySkeleton />}
//         />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* --- PROFESSIONAL TOP HEADER --- */}
//       <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
//         <View style={styles.headerContent}>
//           <View style={styles.leftHeader}>
//             <Text style={styles.userSmallText}>{userName}</Text>
//             {/* <Text style={styles.userSmallText}>Waseem.sa</Text> */}
//             <View style={styles.addressRow}>
//               <Animated.View
//                 style={[styles.blinkCircle, { opacity: blinkAnim }]}
//               />
//               <Text style={styles.addressText} numberOfLines={1}>
//                 {/* Dynamically show the active selection */}
//                 {activeAddress?.Address || "No address added"}
//               </Text>
//             </View>

//             <TouchableOpacity
//               style={styles.addressBtn}
//               onPress={() => setShowAddressModal(true)}
//             >
//               <Text style={styles.addressBtnText} numberOfLines={1}>
//                 {getButtonText()}
//               </Text>
//               <Ionicons
//                 name={activeAddress ? "repeat" : "chevron-forward"} // "Repeat" icon for changing
//                 size={12}
//                 color={Colors.primary}
//               />
//             </TouchableOpacity>

//             <AddressModal
//               visible={showAddressModal}
//               onClose={() => setShowAddressModal(false)}
//               // Update the full object so the header reflects the change immediately
//               onSelectAddress={(addr) => saveActiveAddress(addr)}
//             />
//           </View>

//           {/* RIGHT SIDE: Icons */}
//           <View style={styles.rightHeader}>
//             <TouchableOpacity
//               style={styles.iconCircle}
//               onPress={() => router.push("/search")}
//             >
//               <Ionicons name="search-outline" size={22} color={Colors.white} />
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={styles.iconCircle}
//               onPress={() => router.push("/profile")}
//             >
//               <Ionicons name="person-outline" size={22} color={Colors.white} />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       <FlatList
//         data={mainMenu}
//         keyExtractor={(item) => item.CategoryId.toString()}
//         numColumns={2}
//         columnWrapperStyle={styles.row}
//         contentContainerStyle={styles.scrollPadding}
//         ListHeaderComponent={
//           <>
//             {featuredData.length > 0 && (
//               <View style={styles.featuredWrapper}>
//                 <ScrollView
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   decelerationRate="fast"
//                   contentContainerStyle={{ paddingLeft: 20 }}
//                 >
//                   {featuredData.map((item) => (
//                     <TouchableOpacity
//                       key={item.CategoryId}
//                       style={styles.bannerCard}
//                       onPress={() => handleCategoryPress(item)}
//                     >
//                       <Image
//                         source={{
//                           uri:
//                             item.ImagePath ||
//                             "data:image/jpeg;base64,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",
//                         }}
//                         style={styles.bannerImage}
//                       />
//                       <LinearGradient
//                         colors={["transparent", "rgba(0,0,0,0.7)"]}
//                         style={styles.bannerGradient}
//                       >
//                         <Text style={styles.bannerText}>{item.Name}</Text>
//                       </LinearGradient>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               </View>
//             )}
//             <Text style={styles.sectionTitle}>Explore categories</Text>
//           </>
//         }
//         renderItem={({ item }) => (
//           <CategoryCard category={item} onPress={handleCategoryPress} />
//         )}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   headerContainer: {
//     backgroundColor: Colors.headerOne[0], // Using the primary dark blue from your gradient
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   headerContainerLoadig: {
//     backgroundColor: Colors.headerOne[0], // Using the primary dark blue from your gradient
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     marginBottom: 20,
//   },
//   skeletonText: {
//     height: 15,
//     backgroundColor: "rgba(255,255,255,0.2)",
//     borderRadius: 4,
//     width: "40%",
//   },
//   headerContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//   },
//   leftHeader: { flex: 1 },
//   userSmallText: {
//     color: Colors.white,
//     fontSize: 12,
//     fontWeight: "500",
//     textTransform: "uppercase",
//     letterSpacing: 1,
//   },
//   addressRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 4,
//   },
//   blinkCircle: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: Colors.success,
//     marginRight: 6,
//   },
//   addressText: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: 12,
//     fontWeight: "700",
//     maxWidth: width * 0.5,
//   },
//   addressBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     marginTop: 8,
//     alignSelf: "flex-start",
//   },
//   addressBtnText: {
//     color: Colors.white,
//     fontSize: 11,
//     fontWeight: "600",
//     marginRight: 2,
//   },
//   rightHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   iconCircle: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255,255,255,0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 12,
//   },
//   scrollPadding: { paddingBottom: 100 },
//   featuredWrapper: {
//     paddingVertical: 20,
//     backgroundColor: Colors.headerOne[0],
//     borderBottomRightRadius: 30,
//     borderBottomLeftRadius: 30,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 19,
//     fontWeight: "800",
//     color: "#1E293B",
//     paddingHorizontal: 20,
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   seeAll: { color: Colors.headerOne[0], fontWeight: "700", fontSize: 13 },
//   skel: {
//     marginTop: 20,
//     marginHorizontal: 20,
//   },
//   row: {
//     marginTop: 20,
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     marginBottom: 15,
//   },
//   bannerCard: {
//     width: width * 0.9,
//     height: 160,
//     marginRight: 15,
//     borderRadius: 20,
//     overflow: "hidden",
//     backgroundColor: Colors.secondary,
//   },
//   bannerImage: { width: "100%", height: "100%", resizeMode: "cover" },
//   bannerGradient: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: "flex-end",
//     padding: 15,
//   },
//   bannerText: { color: Colors.white, fontSize: 18, fontWeight: "800" },
// });

// export const ShopHomeScreen = () => {
//   const router = useRouter();

//   // Fetches Featured Products & Parent Categories
//   const { subCategories, bannerProducts, loading } = useDiscovery();

//   const handleCategoryPress = (category: any) => {
//     if (!category.IsLeafNode) {
//       router.push({
//         pathname: "/(tabs)/category/[id]",
//         params: { id: category.CategoryId.toString(), name: category.Name },
//       });
//     } else {
//       router.push({
//         pathname: "/(tabs)/category/products",
//         params: {
//           categoryId: category.CategoryId,
//           categoryName: category.Name,
//         },
//       });
//     }
//   };

//   const handleProductPress = (product: any) => {
//     router.push({
//       pathname: "/(tabs)/category/product-details",
//       params: { productId: product.ProductId },
//     });
//   };

//   if (loading) return <CategorySkeleton />;

//   return (
//     <View style={styles.container}>
//       <ShopHeader />
//       <FlatList
//         data={subCategories}
//         keyExtractor={(item) => `parent-${item?.CategoryId || Math.random()}`}
//         numColumns={2}
//         columnWrapperStyle={styles.row}
//         ListHeaderComponent={
//           <>
//             {bannerProducts.length > 0 && (
//               <FeaturedBanner
//                 data={bannerProducts}
//                 onPress={handleProductPress}
//               />
//             )}
//             <Text style={styles.sectionTitle}>Explore Categories</Text>
//           </>
//         }
//         renderItem={({ item }) => (
//           <CategoryCard
//             category={item}
//             onPress={() => handleCategoryPress(item)}
//           />
//         )}
//       />
//     </View>
//   );
// };

export const ShopHomeScreen = () => {
  const router = useRouter();
  const { subCategories, bannerProducts, loading } = useDiscovery();

  const handleCategoryPress = (category: any) => {
    // If it's a leaf node (e.g., T-Shirts), go to Product List
    if (category?.IsLeafNode) {
      router.push({
        // pathname: "/(tabs)/category/products",
        pathname: "/products",
        params: {
          categoryId: category.CategoryId,
          categoryName: category.Name,
        },
      });
    } else {
      // Otherwise, keep drilling down into sub-categories
      router.push({
        pathname: "/(tabs)/category/[id]",
        params: {
          id: category.CategoryId.toString(),
          name: category.Name,
        },
      });
    }
  };

  const handleProductPress = (product: any) => {
    // CRITICAL: Direct navigation to Product Details
    router.push({
      pathname: "/(tabs)/category/product-details",
      params: { productId: product.ProductId },
    });
  };

  if (loading) return <CategorySkeleton />;

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      <ShopHeader />
      <FlatList
        data={subCategories}
        numColumns={2}
        keyExtractor={(item) => item.CategoryId.toString()}
        ListHeaderComponent={
          <>
            {bannerProducts.length > 0 && (
              <FeaturedBanner
                data={bannerProducts}
                onPress={handleProductPress} // Navigate to Details
              />
            )}
            <Text style={styles.sectionTitle}>Main Categories</Text>
          </>
        }
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => handleCategoryPress(item)}
          />
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
});
