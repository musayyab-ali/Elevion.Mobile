// import React, { useState } from "react";
// import {
//   View,
//   StyleSheet,
//   FlatList,
//   ActivityIndicator,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   useWindowDimensions,
//   NativeSyntheticEvent,
//   NativeScrollEvent,
// } from "react-native";
// import { useLocalSearchParams, Stack, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useProductDetails } from "@/features/shop/hooks/useProductDetails";
// import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
// import { useProductCartActions } from "@/features/cart/hooks/useProductCartActions"; // Importing the updated favoriting hook
// import { Colors } from "@/constants/Theme";

// const IMAGE_BASE_URL = "http://thelink.innovex.biz/"; // Production image delivery server
// const FALLBACK_PLACEHOLDER =
//   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

// export default function ProductDetailsScreen() {
//   // 1. Core Structural Metrics and Search Params Hooks
//   const { productId } = useLocalSearchParams<{ productId: string }>();
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const { width: screenWidth } = useWindowDimensions();
//   const numericProductId = Number(productId);

//   // 2. State Hooks for Interactive Selection Interfaces
//   const [activeImageIndex, setActiveImageIndex] = useState(0);
//   const [selectedSize, setSelectedSize] = useState("M");
//   const [selectedColor, setSelectedColor] = useState("Black");

//   // 3. Data Fetching and Business Layer Lifecycle Hooks
//   const { product, loading, selectedVariant, setSelectedVariant } =
//     useProductDetails(productId);
//   const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

//   // 4. Fallback Extraction Computations needed for Subsequent Hooks
//   const combinations =
//     product?.ProductVariantDetail?.productVariantCombinationList ?? [];
//   const currentDetailId =
//     selectedVariant?.ProductDetailId ||
//     combinations[0]?.ProductDetailId ||
//     product?.ProductId;

//   // 5. Operational Dispatch Hooks (Must be initialized here before any conditional component returns)
//   const { isAddingToCart, handleAddProductToBag } = useProductCartActions(
//     numericProductId,
//     currentDetailId,
//   );

//   console.log(`product is : ${numericProductId}
//    current detailed id: ${currentDetailId}`);

//   // 6. Conditional Early Rendering Layout Guards
//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator
//           size="large"
//           color={Colors.headerOne[0] || "#0284C7"}
//         />
//       </View>
//     );
//   }

//   if (!product) {
//     return (
//       <View style={styles.errorContainer}>
//         <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
//         <Text style={styles.errorText}>
//           Product details could not be found.
//         </Text>
//         <TouchableOpacity
//           style={styles.errorBackButton}
//           onPress={() => router.back()}
//         >
//           <Text style={styles.errorBackText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   // 7. Parsing Local Metadata Properties (Post Validation Layout Layer)
//   const imageGallery =
//     product?.ProductImages?.length > 0
//       ? product.ProductImages
//       : [{ ImageName: "" }];
//   const isCurrentProductWishlisted = wishlistMap.has(numericProductId);
//   const isWishlistActionRunning = isProcessing(numericProductId);
//   const carouselHeight = screenWidth > 600 ? 440 : 360;

//   // 8. Event Listener Context Handlers
//   const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const contentOffsetX = e.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / screenWidth);
//     if (
//       index !== activeImageIndex &&
//       index >= 0 &&
//       index < imageGallery.length
//     ) {
//       setActiveImageIndex(index);
//     }
//   };

//   const handleWishlistPress = () => {
//     toggleWishlist(numericProductId, currentDetailId);
//   };

//   // 9. Standard UI Render Return Canvas
//   return (
//     <View style={styles.container}>
//       <Stack.Screen
//         options={{
//           headerTransparent: true,
//           headerShadowVisible: false,
//           headerTitle: "Product details",
//           headerLeft: () => (
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={[
//                 styles.headerButton,
//                 { marginTop: Math.max(insets.top - 12, 0) },
//               ]}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="chevron-back" size={22} color="#0F172A" />
//             </TouchableOpacity>
//           ),
//           headerRight: () => (
//             <TouchableOpacity
//               onPress={handleWishlistPress}
//               disabled={isWishlistActionRunning}
//               style={[
//                 styles.headerButton,
//                 styles.headerRightWishlistBtn,
//                 { marginTop: Math.max(insets.top - 12, 0) },
//               ]}
//               activeOpacity={0.8}
//             >
//               {isWishlistActionRunning ? (
//                 <ActivityIndicator size="small" color="#EF4444" />
//               ) : (
//                 <Ionicons
//                   name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
//                   size={20}
//                   color={isCurrentProductWishlisted ? "#EF4444" : "#0F172A"}
//                 />
//               )}
//             </TouchableOpacity>
//           ),
//         }}
//       />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollPadding}
//       >
//         {/* Continuous Canvas Image Showcase Carousel */}
//         <View
//           style={[
//             styles.carouselContainer,
//             { width: screenWidth, height: carouselHeight },
//           ]}
//         >
//           <FlatList
//             data={imageGallery}
//             horizontal
//             pagingEnabled
//             decelerationRate="fast"
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(_, index) => `img-${index}`}
//             onMomentumScrollEnd={handleScroll}
//             renderItem={({ item }) => {
//               const imageUri = item?.ImageName
//                 ? `${IMAGE_BASE_URL}${item.ImageName}`
//                 : FALLBACK_PLACEHOLDER;

//               return (
//                 <Image
//                   source={{ uri: imageUri }}
//                   style={{
//                     width: screenWidth,
//                     height: carouselHeight,
//                     resizeMode: "cover",
//                   }}
//                 />
//               );
//             }}
//           />

//           {/* Subtle Lower Ambient Edge Overlay Shadow gradient */}
//           <LinearGradient
//             colors={["transparent", "rgba(15, 23, 42, 0.08)"]}
//             style={styles.carouselBottomGradient}
//           />

//           {/* Luxury Carousel Dot Indicators */}
//           {imageGallery.length > 1 && (
//             <View style={styles.dotRow}>
//               {imageGallery.map((_, idx) => (
//                 <View
//                   key={idx}
//                   style={[
//                     styles.dot,
//                     activeImageIndex === idx
//                       ? styles.activeDot
//                       : styles.inactiveDot,
//                   ]}
//                 />
//               ))}
//             </View>
//           )}
//         </View>

//         {/* Master Details Content Sheet */}
//         <View style={styles.detailsCard}>
//           {/* Stock Notification Badge Ribbon Row */}
//           <View style={styles.metaBadgeRow}>
//             <View
//               style={[
//                 styles.stockBadge,
//                 { backgroundColor: product?.InStock ? "#DCFCE7" : "#FEE2E2" },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.stockText,
//                   { color: product?.InStock ? "#166534" : "#991B1B" },
//                 ]}
//               >
//                 {product?.InStock ? "In Stock" : "Unavailable"}
//               </Text>
//             </View>
//             {product?.IsFeaturedProduct && (
//               <View style={styles.premiumBadge}>
//                 <Text style={styles.premiumBadgeText}>Featured Choice</Text>
//               </View>
//             )}
//           </View>

//           {/* Product Name Title Header */}
//           <Text style={styles.productName}>{product?.Name}</Text>

//           {/* Dynamic Variant Pricing Panel Engine */}
//           <View style={styles.priceContainer}>
//             <Text style={styles.currentPrice}>
//               Rs.{" "}
//               {selectedVariant
//                 ? selectedVariant.Price.toLocaleString()
//                 : product?.MinPrice?.toLocaleString()}
//             </Text>
//             {product?.MinPrice !== product?.MaxPrice && !selectedVariant && (
//               <Text style={styles.priceRange}>
//                 (Rs. {product?.MinPrice?.toLocaleString()} - Rs.{" "}
//                 {product?.MaxPrice?.toLocaleString()})
//               </Text>
//             )}
//           </View>

//           <View style={styles.sectionDivider} />

//           {/* Product Long Form Descriptive Details Blocks */}
//           <Text style={styles.sectionHeading}>Product Overview</Text>
//           <Text style={styles.longDescription}>
//             {product?.LongDescription ||
//               product?.Description ||
//               "No premium material layout overview summary provided."}
//           </Text>

//           {/* System Variant Mapping Loops */}
//           {product?.ProductVariantGroups?.map((group: any) => (
//             <View key={group.VariantGroupId} style={styles.variantGroup}>
//               <Text style={styles.variantTitle}>
//                 {group.VariantGroupName}
//                 <Text style={styles.selectedVariantLabel}>
//                   :{" "}
//                   {group.VariantGroupName === "Size"
//                     ? selectedSize
//                     : selectedColor}
//                 </Text>
//               </Text>

//               {group.VariantGroupName === "Size" ? (
//                 <View style={styles.optionsRow}>
//                   {["S", "M", "L", "XL"].map((size) => {
//                     const isSelected = selectedSize === size;
//                     return (
//                       <TouchableOpacity
//                         key={size}
//                         style={[
//                           styles.pillOption,
//                           isSelected && styles.activePill,
//                         ]}
//                         onPress={() => setSelectedSize(size)}
//                         activeOpacity={0.7}
//                       >
//                         <Text
//                           style={[
//                             styles.pillText,
//                             isSelected && styles.activePillText,
//                           ]}
//                         >
//                           {size}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               ) : (
//                 <View style={styles.optionsRow}>
//                   {["Blue", "Black", "Grey"].map((color) => {
//                     const isSelected = selectedColor === color;
//                     return (
//                       <TouchableOpacity
//                         key={color}
//                         style={[
//                           styles.pillOption,
//                           isSelected && styles.activePill,
//                         ]}
//                         onPress={() => setSelectedColor(color)}
//                         activeOpacity={0.7}
//                       >
//                         <Text
//                           style={[
//                             styles.pillText,
//                             isSelected && styles.activePillText,
//                           ]}
//                         >
//                           {color}
//                         </Text>
//                       </TouchableOpacity>
//                     );
//                   })}
//                 </View>
//               )}
//             </View>
//           ))}

//           {/* Premium Bundle Wholesale Variant Combination Selector Cards */}
//           {combinations.length > 1 && (
//             <View style={styles.variantGroup}>
//               <Text style={styles.variantTitle}>
//                 Select Pricing Bundle Option
//               </Text>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.comboScrollContent}
//               >
//                 {combinations.map((variant: any, idx: number) => {
//                   const isSelected = selectedVariant?.SKU === variant.SKU;
//                   return (
//                     <TouchableOpacity
//                       key={variant.SKU || idx}
//                       style={[
//                         styles.comboCard,
//                         isSelected && styles.activeComboCard,
//                       ]}
//                       onPress={() => setSelectedVariant(variant)}
//                       activeOpacity={0.8}
//                     >
//                       <Text
//                         style={[
//                           styles.comboSku,
//                           isSelected && styles.activeComboText,
//                         ]}
//                       >
//                         Option {idx + 1}
//                       </Text>
//                       <Text style={styles.comboPrice}>
//                         Rs. {variant.Price?.toLocaleString()}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* Floating Bottom Purchase Call To Action Dock Bar Layer */}
//       <View
//         style={[
//           styles.bottomBar,
//           { paddingBottom: Math.max(insets.bottom + 12, 18) },
//         ]}
//       >
//         <View style={styles.bottomInteractiveActionRow}>
//           {/* Secondary Persistent Favorite Wishlist Heart Icon Toggle Module */}
//           <TouchableOpacity
//             style={[
//               styles.bottomWishlistSecondaryButton,
//               isCurrentProductWishlisted &&
//                 styles.bottomWishlistSecondaryActiveBtn,
//             ]}
//             onPress={handleWishlistPress}
//             disabled={isWishlistActionRunning}
//             activeOpacity={0.7}
//           >
//             {isWishlistActionRunning ? (
//               <ActivityIndicator size="small" color="#EF4444" />
//             ) : (
//               <Ionicons
//                 name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
//                 size={22}
//                 color={isCurrentProductWishlisted ? "#EF4444" : "#475569"}
//               />
//             )}
//           </TouchableOpacity>

//           {/* Main Primary Order Submission Engine */}
//           <LinearGradient
//             colors={
//               product?.InStock
//                 ? isAddingToCart
//                   ? ["#1E293B", "#334155"]
//                   : ["#0F172A", "#1E293B"]
//                 : ["#94A3B8", "#CBD5E1"]
//             }
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 0 }}
//             style={styles.actionBtnGradient}
//           >
//             <TouchableOpacity
//               style={styles.actionButton}
//               activeOpacity={0.85}
//               disabled={!product?.InStock || isAddingToCart}
//               onPress={() => handleAddProductToBag(1)}
//             >
//               {isAddingToCart ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <>
//                   <Ionicons
//                     name={
//                       product?.InStock ? "bag-handle-outline" : "ban-outline"
//                     }
//                     size={20}
//                     color="#FFFFFF"
//                     style={styles.btnIcon}
//                   />
//                   <Text style={styles.actionButtonText}>
//                     {product?.InStock ? "Add to Shopping Bag" : "Out of Stock"}
//                   </Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </LinearGradient>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//     backgroundColor: "#F8FAFC",
//   },
//   errorText: {
//     color: "#475569",
//     fontSize: 15,
//     textAlign: "center",
//     fontWeight: "500",
//     marginTop: 12,
//     marginBottom: 20,
//   },
//   errorBackButton: {
//     paddingHorizontal: 24,
//     paddingVertical: 10,
//     backgroundColor: "#0F172A",
//     borderRadius: 12,
//   },
//   errorBackText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   scrollPadding: {
//     paddingBottom: 140,
//   },
//   carouselContainer: {
//     position: "relative",
//     backgroundColor: "#F1F5F9",
//   },
//   carouselBottomGradient: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 30,
//   },
//   dotRow: {
//     flexDirection: "row",
//     position: "absolute",
//     bottom: 30,
//     width: "100%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   dot: {
//     height: 4,
//     borderRadius: 2,
//     marginHorizontal: 3,
//   },
//   activeDot: {
//     width: 14,
//     backgroundColor: "#0F172A",
//   },
//   inactiveDot: {
//     width: 4,
//     backgroundColor: "rgba(15, 23, 42, 0.2)",
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.95)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 4,
//     marginRight: 10,
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   headerRightWishlistBtn: {
//     marginRight: 4,
//     marginLeft: 10,
//   },
//   detailsCard: {
//     flex: 1,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     backgroundColor: "#FFFFFF",
//     marginTop: -24,
//     paddingTop: 26,
//     paddingHorizontal: 20,
//   },
//   metaBadgeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//     gap: 8,
//   },
//   stockBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//   },
//   stockText: {
//     fontSize: 11,
//     fontWeight: "700",
//     textTransform: "uppercase",
//     letterSpacing: 0.3,
//   },
//   premiumBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//     backgroundColor: "#FEF3C7",
//   },
//   premiumBadgeText: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: "#92400E",
//     letterSpacing: 0.3,
//   },
//   productName: {
//     fontSize: 24,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.4,
//     lineHeight: 30,
//     marginBottom: 8,
//   },
//   priceContainer: {
//     flexDirection: "row",
//     alignItems: "baseline",
//     marginBottom: 20,
//   },
//   currentPrice: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#0F172A",
//   },
//   priceRange: {
//     fontSize: 13,
//     color: "#64748B",
//     marginLeft: 6,
//     fontWeight: "600",
//   },
//   sectionDivider: {
//     height: 1,
//     backgroundColor: "#F1F5F9",
//     marginBottom: 18,
//   },
//   sectionHeading: {
//     fontSize: 15,
//     fontWeight: "800",
//     color: "#0F172A",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//     marginBottom: 8,
//   },
//   longDescription: {
//     fontSize: 14,
//     color: "#475569",
//     lineHeight: 22,
//     fontWeight: "400",
//     marginBottom: 24,
//   },
//   variantGroup: {
//     marginBottom: 22,
//   },
//   variantTitle: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginBottom: 10,
//   },
//   selectedVariantLabel: {
//     color: "#64748B",
//     fontWeight: "500",
//   },
//   optionsRow: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 8,
//   },
//   pillOption: {
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     backgroundColor: "#FFFFFF",
//   },
//   activePill: {
//     borderColor: "#0F172A",
//     backgroundColor: "#0F172A",
//   },
//   pillText: {
//     fontSize: 14,
//     color: "#475569",
//     fontWeight: "700",
//   },
//   activePillText: {
//     color: "#FFFFFF",
//   },
//   comboScrollContent: {
//     flexDirection: "row",
//     gap: 12,
//     paddingVertical: 4,
//   },
//   comboCard: {
//     padding: 14,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     width: 125,
//     backgroundColor: "#FFFFFF",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.02,
//     shadowRadius: 3,
//     elevation: 1,
//   },
//   activeComboCard: {
//     borderColor: "#0F172A",
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1.5,
//   },
//   comboSku: {
//     fontSize: 12,
//     color: "#64748B",
//     fontWeight: "600",
//     marginBottom: 4,
//   },
//   activeComboText: {
//     color: "#0F172A",
//     fontWeight: "700",
//   },
//   comboPrice: {
//     fontSize: 14,
//     fontWeight: "800",
//     color: "#0F172A",
//   },
//   bottomBar: {
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//     paddingHorizontal: 20,
//     paddingTop: 14,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: -6 },
//     shadowOpacity: 0.04,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   bottomInteractiveActionRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//   },
//   bottomWishlistSecondaryButton: {
//     width: 54,
//     height: 54,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#CBD5E1",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   bottomWishlistSecondaryActiveBtn: {
//     borderColor: "#FEE2E2",
//     backgroundColor: "#FEF2F2",
//   },
//   actionBtnGradient: {
//     flex: 1,
//     borderRadius: 16,
//   },
//   actionButton: {
//     height: 54,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   btnIcon: {
//     marginRight: 8,
//   },
//   actionButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "700",
//   },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProductDetails } from "@/features/shop/hooks/useProductDetails";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useProductCartActions } from "@/features/cart/hooks/useProductCartActions";
import { Colors } from "@/constants/Theme";

const IMAGE_BASE_URL = "http://thelink.innovex.biz/";
const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

export default function ProductDetailsScreen() {
  // 1. Core Structural Metrics and Search Params Hooks
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const numericProductId = Number(productId);

  // 2. State Hooks for Interactive Selection Interfaces
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 3. Data Fetching and Business Layer Lifecycle Hooks
  const { product, loading, selectedVariant, setSelectedVariant } =
    useProductDetails(productId);
  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

  // 4. Extract Product Combinations
  const combinations =
    product?.ProductVariantDetail?.productVariantCombinationList ?? [];

  // 5. Automatically pair the state hook to the first combination if nothing is selected yet
  useEffect(() => {
    if (combinations.length > 0 && !selectedVariant) {
      setSelectedVariant(combinations[0]);
    }
  }, [combinations, selectedVariant]);

  // 6. ARCHITECTURAL RESOLUTION FIELDS: Separate core tracking properties
  // Main base root ID from API payload to bind with Wishlist context
  const mainProductDetailId = product?.ProductDetailId || numericProductId;

  // Current active unique item detail context bound to Add to Cart action context
  const currentDetailId =
    selectedVariant?.ProductDetailId || mainProductDetailId;

  // 7. Operational Dispatch Hooks
  const { isAddingToCart, handleAddProductToBag } = useProductCartActions(
    numericProductId,
    currentDetailId,
  );

  // 8. Conditional Early Rendering Layout Guards
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.headerOne?.[0] || "#0284C7"}
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.errorText}>
          Product details could not be found.
        </Text>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 9. Parsing Local Metadata Properties
  const imageGallery =
    product?.ProductImages?.length > 0
      ? product.ProductImages
      : [{ ImageName: "" }];
  const isCurrentProductWishlisted = wishlistMap.has(numericProductId);
  const isWishlistActionRunning = isProcessing(numericProductId);
  const carouselHeight = screenWidth > 600 ? 440 : 360;

  // 10. Event Listener Context Handlers
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (
      index !== activeImageIndex &&
      index >= 0 &&
      index < imageGallery.length
    ) {
      setActiveImageIndex(index);
    }
  };

  // ✅ CRITICAL UPDATE: Wishlist actions now globally target the immutable parent detailed root ID
  const handleWishlistPress = () => {
    toggleWishlist(numericProductId, mainProductDetailId, product);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTransparent: true,
          headerShadowVisible: false,
          headerTitle: "Product Details",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={[
                styles.headerButton,
                { marginTop: Math.max(insets.top - 12, 0) },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={22} color="#0F172A" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleWishlistPress}
              disabled={isWishlistActionRunning}
              style={[
                styles.headerButton,
                styles.headerRightWishlistBtn,
                { marginTop: Math.max(insets.top - 12, 0) },
              ]}
              activeOpacity={0.8}
            >
              {isWishlistActionRunning ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons
                  name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
                  size={20}
                  color={isCurrentProductWishlisted ? "#EF4444" : "#0F172A"}
                />
              )}
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Continuous Canvas Image Showcase Carousel */}
        <View
          style={[
            styles.carouselContainer,
            { width: screenWidth, height: carouselHeight },
          ]}
        >
          <FlatList
            data={imageGallery}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={handleScroll}
            renderItem={({ item }) => {
              const imageUri = item?.ImageName
                ? `${IMAGE_BASE_URL}${item.ImageName}`
                : FALLBACK_PLACEHOLDER;

              return (
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: screenWidth,
                    height: carouselHeight,
                    resizeMode: "cover",
                  }}
                />
              );
            }}
          />

          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.08)"]}
            style={styles.carouselBottomGradient}
          />

          {imageGallery.length > 1 && (
            <View style={styles.dotRow}>
              {imageGallery.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeImageIndex === idx
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Master Details Content Sheet */}
        <View style={styles.detailsCard}>
          <View style={styles.metaBadgeRow}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: product?.InStock ? "#DCFCE7" : "#FEE2E2" },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: product?.InStock ? "#166534" : "#991B1B" },
                ]}
              >
                {product?.InStock ? "In Stock" : "Unavailable"}
              </Text>
            </View>
            {product?.Category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.Category}</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product?.Name}</Text>

          {/* Dynamic Variant Pricing Panel Engine */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              Rs.{" "}
              {selectedVariant
                ? selectedVariant.Price.toLocaleString()
                : product?.MinPrice?.toLocaleString()}
            </Text>
            {product?.MinPrice !== product?.MaxPrice && !selectedVariant && (
              <Text style={styles.priceRange}>
                (Rs. {product?.MinPrice?.toLocaleString()} - Rs.{" "}
                {product?.MaxPrice?.toLocaleString()})
              </Text>
            )}
          </View>

          <View style={styles.sectionDivider} />

          {/* Premium Product Variant Matrix Selector */}
          {combinations.length > 0 && (
            <View style={styles.variantSectionContainer}>
              <View style={styles.variantHeaderRow}>
                <Text style={styles.variantSectionHeading}>
                  Available Options
                </Text>
                {selectedVariant && (
                  <Text style={styles.skuIndicator}>{selectedVariant.SKU}</Text>
                )}
              </View>

              <View style={styles.variantGridStack}>
                {combinations.map((variant: any, idx: number) => {
                  const isSelected =
                    selectedVariant?.ProductDetailId ===
                    variant.ProductDetailId;

                  // Graceful fallbacks for parsed labels if custom variations aren't fully absolute
                  const optionLabel =
                    variant.VariantName || `Option Variant 0${idx + 1}`;

                  return (
                    <TouchableOpacity
                      key={variant.ProductDetailId || variant.SKU || idx}
                      style={[
                        styles.premiumVariantCard,
                        isSelected && styles.premiumVariantCardActive,
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.variantCardLeftSection}>
                        <View
                          style={[
                            styles.radioIndicatorCircle,
                            isSelected && styles.radioIndicatorCircleActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                        <View style={styles.variantLabelMetadataBlock}>
                          <Text
                            style={[
                              styles.variantCardLabelText,
                              isSelected && styles.variantCardLabelTextActive,
                            ]}
                          >
                            {optionLabel}
                          </Text>
                          {variant.IsPromotional && (
                            <View style={styles.promoBadge}>
                              <Text style={styles.promoBadgeText}>
                                Promo Offer
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.variantCardRightSection}>
                        <Text
                          style={[
                            styles.variantCardPriceText,
                            isSelected && styles.variantCardPriceTextActive,
                          ]}
                        >
                          Rs. {variant.Price?.toLocaleString()}
                        </Text>
                        <Text
                          style={[
                            styles.variantStockStatusText,
                            variant.InStock
                              ? styles.variantInStockColor
                              : styles.variantOutOfStockColor,
                          ]}
                        >
                          {variant.InStock ? "Available" : "Sold Out"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.sectionDivider} />

          {/* Product Long Form Descriptive Details Blocks */}
          <Text style={styles.sectionHeading}>Product Overview</Text>
          <Text style={styles.longDescription}>
            {product?.LongDescription ||
              product?.Description ||
              "No premium material layout overview summary provided."}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Purchase Call To Action Dock Bar Layer */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom + 12, 18) },
        ]}
      >
        <View style={styles.bottomInteractiveActionRow}>
          <TouchableOpacity
            style={[
              styles.bottomWishlistSecondaryButton,
              isCurrentProductWishlisted &&
                styles.bottomWishlistSecondaryActiveBtn,
            ]}
            onPress={handleWishlistPress}
            disabled={isWishlistActionRunning}
            activeOpacity={0.7}
          >
            {isWishlistActionRunning ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons
                name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
                size={22}
                color={isCurrentProductWishlisted ? "#EF4444" : "#475569"}
              />
            )}
          </TouchableOpacity>

          <LinearGradient
            colors={
              product?.InStock && selectedVariant?.InStock
                ? isAddingToCart
                  ? ["#1E293B", "#334155"]
                  : ["#0F172A", "#1E293B"]
                : ["#94A3B8", "#CBD5E1"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtnGradient}
          >
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              disabled={
                !product?.InStock || !selectedVariant?.InStock || isAddingToCart
              }
              onPress={() => handleAddProductToBag(1)}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={
                      product?.InStock && selectedVariant?.InStock
                        ? "bag-handle-outline"
                        : "ban-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                    style={styles.btnIcon}
                  />
                  <Text style={styles.actionButtonText}>
                    {product?.InStock && selectedVariant?.InStock
                      ? "Add to Shopping Bag"
                      : "Out of Stock"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  errorText: {
    color: "#475569",
    fontSize: 15,
    textAlign: "center",
    fontWeight: "500",
    marginTop: 12,
    marginBottom: 20,
  },
  errorBackButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: "#0F172A",
    borderRadius: 12,
  },
  errorBackText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollPadding: {
    paddingBottom: 140,
  },
  carouselContainer: {
    position: "relative",
    backgroundColor: "#F1F5F9",
  },
  carouselBottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  dotRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: 30,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 14,
    backgroundColor: "#0F172A",
  },
  inactiveDot: {
    width: 4,
    backgroundColor: "rgba(15, 23, 42, 0.2)",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
    marginRight: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightWishlistBtn: {
    marginRight: 4,
    marginLeft: 10,
  },
  detailsCard: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#FFFFFF",
    marginTop: -24,
    paddingTop: 26,
    paddingHorizontal: 20,
  },
  metaBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.3,
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.4,
    lineHeight: 30,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  currentPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },
  priceRange: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
    fontWeight: "600",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 18,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  longDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    fontWeight: "400",
    marginBottom: 24,
  },

  /* Modern High-Fidelity Premium Variant Section List Styling */
  variantSectionContainer: {
    marginBottom: 6,
  },
  variantHeaderRow: {
    flexDirection: "row",
    justifyContent: "between",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  variantSectionHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  skuIndicator: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    fontFamily: "Platform-Mono",
  },
  variantGridStack: {
    flexDirection: "column",
    gap: 10,
  },
  premiumVariantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 2,
    elevation: 1,
  },
  premiumVariantCardActive: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
  },
  variantCardLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  radioIndicatorCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioIndicatorCircleActive: {
    borderColor: "#0F172A",
  },
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#0F172A",
  },
  variantLabelMetadataBlock: {
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  variantCardLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  variantCardLabelTextActive: {
    color: "#0F172A",
    fontWeight: "700",
  },
  promoBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1D4ED8",
  },
  variantCardRightSection: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 2,
  },
  variantCardPriceText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  variantCardPriceTextActive: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  variantStockStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  variantInStockColor: {
    color: "#059669",
  },
  variantOutOfStockColor: {
    color: "#DC2626",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 5,
  },
  bottomInteractiveActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bottomWishlistSecondaryButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomWishlistSecondaryActiveBtn: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  actionBtnGradient: {
    flex: 1,
    borderRadius: 16,
  },
  actionButton: {
    height: 54,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
