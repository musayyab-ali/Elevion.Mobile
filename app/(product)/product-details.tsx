// import React, { useState, useEffect, useCallback, useRef } from "react";
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
//   TextInput,
//   Modal,
//   Keyboard,
// } from "react-native";
// import { useLocalSearchParams, Stack, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useProductDetails } from "@/features/shop/hooks/useProductDetails";
// import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
// import { useProductCartActions } from "@/features/cart/hooks/useProductCartActions";
// import { useSharedCartData } from "@/store/CartContext";
// import { Colors } from "@/constants/Theme";
// import { AuthGuardModal } from "@/components/AuthGuardModal";
// import { useAuth } from "@/store/AuthContext";
// import { CustomErrorMessage } from "@/components/CustomErrorMessage";
// import { useSharedWishlistData } from "@/store/WishlistContext";
// import { customerApi } from "@/features/customer/services/customerApi";

// const IMAGE_PLACEHOLDER =
//   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

// interface GraphRatingData {
//   Rating: number;
//   UserCount: number;
// }

// interface ReviewItem {
//   ProductRatingId: number;
//   Rating: number;
//   Review: string;
//   Customer: string;
//   TimeSince: string;
//   Email?: string;
// }

// export default function ProductDetailsScreen() {
//   const { isAuthenticated, user } = useAuth();
//   const { wishMessage } = useSharedWishlistData();
//   const { productId } = useLocalSearchParams<{ productId: string }>();
//   const router = useRouter();
//   const [modalVisible, setModalVisible] = useState(false);
//   const insets = useSafeAreaInsets();
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();
//   const numericProductId = Number(productId);
//   const [activeImageIndex, setActiveImageIndex] = useState(0);
//   const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);

//   // Ratings & Feedback States
//   const [ratingGraph, setRatingGraph] = useState<GraphRatingData[]>([]);
//   const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
//   const [reviewsLoading, setReviewsLoading] = useState(false);
//   const [userRating, setUserRating] = useState(5);
//   const [userReviewText, setUserReviewText] = useState("");
//   const [isSubmittingReview, setIsSubmittingReview] = useState(false);

//   // Enhanced Image Modal States
//   const [isFullscreenVisible, setIsFullscreenVisible] = useState(false);
//   const [fullscreenIndex, setFullscreenIndex] = useState(0);
//   const fullscreenRef = useRef<FlatList>(null);

//   // Keyboard Dynamic Dock Dismissal State
//   const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

//   // Success/Error Custom Modal State
//   const [customAlert, setCustomAlert] = useState({
//     visible: false,
//     title: "",
//     message: "",
//     type: "success" as "success" | "error",
//   });

//   const { product, loading, selectedVariant, setSelectedVariant } =
//     useProductDetails(productId);
//   const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();
//   const { cartData, removeCartItem, cartMessage } = useSharedCartData();
//   const [expandedReviews, setExpandedReviews] = useState(false);

//   const combinations =
//     product?.ProductVariantDetail?.productVariantCombinationList ?? [];
//   const relatedProducts = product?.relatedProductList ?? [];

//   // Keyboard Visibility Listeners Setup
//   useEffect(() => {
//     const keyboardShowListener = Keyboard.addListener("keyboardDidShow", () => {
//       setIsKeyboardVisible(true);
//     });
//     const keyboardHideListener = Keyboard.addListener("keyboardDidHide", () => {
//       setIsKeyboardVisible(false);
//     });

//     return () => {
//       keyboardShowListener.remove();
//       keyboardHideListener.remove();
//     };
//   }, []);

//   // Fetch Reviews Pipeline
//   const syncProductReviewsData = useCallback(async () => {
//     if (!numericProductId) return;
//     setReviewsLoading(true);
//     try {
//       const [graphRes, listRes] = await Promise.all([
//         customerApi.getProductRatings(numericProductId),
//         customerApi.getDetailedReviews(numericProductId, 1, 10),
//       ]);

//       const rawGraph = graphRes?.data?.Data || graphRes?.Data || [];
//       const rawListPayload = listRes?.data || listRes;
//       const rawList = rawListPayload?.Data?.ProductRatingReviewsDtoList || [];
//       setRatingGraph(rawGraph);
//       setReviewsList(rawList);
//     } catch (err) {
//       console.log("Failed syncing metrics pipeline components:", err);
//     } finally {
//       setReviewsLoading(false);
//     }
//   }, [numericProductId]);

//   useEffect(() => {
//     if (combinations.length > 0 && !selectedVariant) {
//       setSelectedVariant(combinations[0]);
//     }
//   }, [combinations, selectedVariant]);

//   useEffect(() => {
//     syncProductReviewsData();
//   }, [syncProductReviewsData]);

//   const showFeedbackAlert = (
//     title: string,
//     message: string,
//     type: "success" | "error",
//   ) => {
//     setCustomAlert({ visible: true, title, message, type });
//   };

//   const handleReviewSubmission = async () => {
//     if (!isAuthenticated) {
//       setModalVisible(true);
//       return;
//     }
//     if (!userReviewText.trim()) {
//       showFeedbackAlert(
//         "Form Incomplete",
//         "Please share your experience in a comment writeup before submitting.",
//         "error",
//       );
//       return;
//     }

//     setIsSubmittingReview(true);
//     try {
//       const payload = {
//         Rating: userRating,
//         Review: userReviewText.trim(),
//         ProductId: numericProductId,
//       };

//       const res = await customerApi.saveProductRating(payload);
//       const resData = res?.data || res;

//       if (
//         resData?.HttpStatusCode === 200 ||
//         resData?.HttpStatusCode === 100 ||
//         resData?.Type === "Success" ||
//         res?.status === 200
//       ) {
//         showFeedbackAlert(
//           "Review Shared!",
//           "Your feedback was sent successfully and is now active.",
//           "success",
//         );
//         setUserReviewText("");
//         setUserRating(5);
//         await syncProductReviewsData();
//       } else {
//         showFeedbackAlert(
//           "Submission Error",
//           resData?.Message || "Could not publish your feedback.",
//           "error",
//         );
//       }
//     } catch (err: any) {
//       const errorMsg =
//         err?.response?.data?.Message ||
//         err.message ||
//         "Network request structural error.";
//       showFeedbackAlert("Network Exception", errorMsg, "error");
//     } finally {
//       setIsSubmittingReview(false);
//     }
//   };

//   const structuralUserReview = reviewsList.find(
//     (item) => item.Email?.toLowerCase() === user?.Email?.toLowerCase(),
//     // ||
//     //   item.Customer?.trim().toLowerCase() === user?.Name?.trim().toLowerCase(),
//   );
//   const hasUserAlreadyReviewed = !!structuralUserReview;
//   const DEFAULT_VISIBLE_COUNT = 3;
//   const displayedReviews = expandedReviews
//     ? reviewsList
//     : reviewsList.slice(0, DEFAULT_VISIBLE_COUNT);
//   const mainProductDetailId = product?.ProductDetailId || numericProductId;
//   const currentDetailId =
//     selectedVariant?.ProductDetailId || mainProductDetailId;

//   const { isAddingToCart, handleAddProductToBag } = useProductCartActions(
//     numericProductId,
//     currentDetailId,
//   );

//   const matchedCartItem = cartData?.CartItemList?.find(
//     (item: any) => Number(item.ProductDetailId) === Number(currentDetailId),
//   );
//   const isCurrentVariantInCart = !!matchedCartItem;

//   if (!loading && !product) {
//     return (
//       <View style={styles.premiumErrorWorkspace}>
//         <Stack.Screen
//           options={{
//             headerTransparent: true,
//             title: "",
//             headerBackTitleVisible: false,
//           }}
//         />
//         <View style={styles.errorCardBody}>
//           <View style={styles.errorIconFrame}>
//             <Ionicons name="cloud-offline-outline" size={32} color="#64748B" />
//           </View>
//           <Text style={styles.errorHeadlineText}>Product Unavailable</Text>
//           <Text style={styles.errorSubparagraphText}>
//             We encountered an unexpected network response while syncing this
//             item's details.
//           </Text>
//           <TouchableOpacity
//             style={styles.premiumErrorActionCTA}
//             onPress={() => router.back()}
//             activeOpacity={0.8}
//           >
//             <Text style={styles.premiumErrorCTALabel}>Return to Catalog</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color="#0F172A" />
//       </View>
//     );
//   }

//   const imageGallery =
//     product?.ProductImages?.length > 0
//       ? product.ProductImages
//       : [{ ImageName: "" }];
//   const isCurrentProductWishlisted = wishlistMap.has(numericProductId);
//   const isWishlistActionRunning = isProcessing(numericProductId);
//   const carouselHeight = screenWidth > 600 ? 460 : 400;

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

//   const handleFullscreenScroll = (
//     e: NativeSyntheticEvent<NativeScrollEvent>,
//   ) => {
//     const contentOffsetX = e.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / screenWidth);
//     if (
//       index !== fullscreenIndex &&
//       index >= 0 &&
//       index < imageGallery.length
//     ) {
//       setFullscreenIndex(index);
//     }
//   };

//   const openFullscreenGallery = (index: number) => {
//     setFullscreenIndex(index);
//     setIsFullscreenVisible(true);
//   };

//   const handleWishlistPress = () => {
//     if (!isAuthenticated) {
//       setModalVisible(true);
//       return;
//     }
//     toggleWishlist(numericProductId, mainProductDetailId, product);
//   };

//   const handleCartActionDispatch = async () => {
//     if (isCurrentVariantInCart && matchedCartItem?.CartId) {
//       setIsRemovingFromCart(true);
//       try {
//         await removeCartItem(matchedCartItem.CartId);
//       } catch (err) {
//         console.log("Cart mutation pipeline interruption:", err);
//       } finally {
//         setIsRemovingFromCart(false);
//       }
//     } else {
//       handleAddProductToBag(1);
//     }
//   };

//   const totalReviewsCount = ratingGraph.reduce(
//     (acc, curr) => acc + (curr.UserCount || 0),
//     0,
//   );

//   return (
//     <View style={styles.container}>
//       {/* <Stack.Screen
//         options={{
//           headerTransparent: true,
//           title: "",
//           headerBackTitleVisible: false,
//         }}
//       /> */}

//       {(wishMessage || cartMessage) && (
//         <CustomErrorMessage style={styles.toastNotification}>
//           {wishMessage || cartMessage}
//         </CustomErrorMessage>
//       )}

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollPadding}
//       >
//         {/* IMAGE SHOWCASE */}
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
//             renderItem={({ item, index }) => (
//               <TouchableOpacity
//                 activeOpacity={0.95}
//                 onPress={() => openFullscreenGallery(index)}
//                 style={{
//                   width: screenWidth,
//                   height: carouselHeight,
//                   backgroundColor: "#F8FAFC",
//                 }}
//               >
//                 <Image
//                   source={{ uri: item.OriginalImagePath || IMAGE_PLACEHOLDER }}
//                   style={{
//                     width: screenWidth,
//                     height: carouselHeight,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </TouchableOpacity>
//             )}
//           />
//           <LinearGradient
//             colors={["rgba(0,0,0,0.1)", "transparent"]}
//             style={styles.carouselTopShadow}
//           />
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

//         {/* DETAILS BLOCK */}
//         <View style={styles.detailsCard}>
//           <View style={styles.headerMetaRow}>
//             <Text style={styles.brandTitle}>
//               {product?.BrandName || "Premium Release"}
//             </Text>
//             <View
//               style={[
//                 styles.statusBadge,
//                 { backgroundColor: product?.InStock ? "#F0FDF4" : "#FEF2F2" },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.statusBadgeText,
//                   { color: product?.InStock ? "#15803D" : "#991B1B" },
//                 ]}
//               >
//                 {product?.InStock ? "In Stock" : "Allocation Closed"}
//               </Text>
//             </View>
//           </View>

//           <Text style={styles.productName}>{product?.Name}</Text>

//           {/* RATING SUBHEADER */}
//           <View style={styles.ratingSection}>
//             <View style={styles.starRow}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <Ionicons
//                   key={star}
//                   name={
//                     star <= Math.round(product?.AverageRating || 4)
//                       ? "star"
//                       : "star-outline"
//                   }
//                   size={14}
//                   color="#F59E0B"
//                 />
//               ))}
//             </View>
//             <Text style={styles.ratingText}>
//               {product?.AverageRating?.toFixed(1) || "4.5"}
//             </Text>
//             <Text style={styles.dotDivider}>•</Text>
//             <Text style={styles.reviewCountText}>
//               {totalReviewsCount} Verified Reviews
//             </Text>
//           </View>

//           <View style={styles.priceContainer}>
//             <Text style={styles.currentPrice}>
//               Rs.{" "}
//               {selectedVariant
//                 ? selectedVariant.Price.toLocaleString()
//                 : product?.MinPrice?.toLocaleString()}
//             </Text>
//             {product?.MinPrice !== product?.MaxPrice && !selectedVariant && (
//               <Text style={styles.priceRange}>
//                 [Rs. {product?.MinPrice?.toLocaleString()} — Rs.{" "}
//                 {product?.MaxPrice?.toLocaleString()}]
//               </Text>
//             )}
//           </View>

//           <View style={styles.dividerLine} />

//           {/* SPECIFICATION SELECTION */}
//           {combinations.length > 0 && (
//             <View style={styles.sectionContainer}>
//               <View style={styles.sectionHeaderRow}>
//                 <Text style={styles.sectionLabel}>Select Specification</Text>
//                 {selectedVariant?.SKU && (
//                   <Text style={styles.skuLabel}>
//                     Ref: {selectedVariant.SKU}
//                   </Text>
//                 )}
//               </View>

//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.variantsHorizontalContainer}
//               >
//                 {combinations.map((variant: any, idx: number) => {
//                   const isSelected =
//                     selectedVariant?.ProductDetailId ===
//                     variant.ProductDetailId;
//                   const label = variant.VariantName || `Edition 0${idx + 1}`;

//                   return (
//                     <TouchableOpacity
//                       key={variant.ProductVariantCombinationId || idx}
//                       style={[
//                         styles.luxuryVariantGridCard,
//                         isSelected && styles.luxuryVariantGridCardActive,
//                       ]}
//                       onPress={() => setSelectedVariant(variant)}
//                       activeOpacity={0.8}
//                     >
//                       <View style={styles.variantImageWrapper}>
//                         <Image
//                           source={{
//                             uri: variant.ImageName || IMAGE_PLACEHOLDER,
//                           }}
//                           style={styles.variantCardThumbnail}
//                         />
//                         {isSelected && (
//                           <View style={styles.variantSelectedCheckBadge}>
//                             <Ionicons
//                               name="checkmark-circle"
//                               size={16}
//                               color="#0F172A"
//                             />
//                           </View>
//                         )}
//                       </View>
//                       <View style={styles.variantGridMetaPane}>
//                         <Text
//                           style={[
//                             styles.variantCardNameText,
//                             isSelected && styles.variantCardNameTextActive,
//                           ]}
//                           numberOfLines={1}
//                         >
//                           {label}
//                         </Text>
//                         <Text style={styles.variantCardPriceText}>
//                           Rs. {variant.Price?.toLocaleString()}
//                         </Text>
//                       </View>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//               <View style={styles.dividerLine} />
//             </View>
//           )}

//           {/* OVERVIEW SECTION */}
//           <View style={styles.sectionContainer}>
//             <Text style={styles.sectionLabel}>Product Narrative</Text>
//             {product?.Description && (
//               <Text style={styles.shortDescriptionText}>
//                 {product.Description}
//               </Text>
//             )}
//             <Text style={styles.longDescriptionText}>
//               {product?.LongDescription ||
//                 "Complete editorial specifications sheet is pending verified asset upload."}
//             </Text>
//           </View>

//           <View style={styles.dividerLine} />

//           {/* REVIEWS & RATINGS BLOCK */}
//           <View style={styles.sectionContainer}>
//             <Text style={styles.sectionLabel}>Ratings & Reviews</Text>

//             {/* Visual Charts */}
//             {ratingGraph.length > 0 && (
//               <View style={styles.graphContainerSpace}>
//                 {ratingGraph.map((item, index) => {
//                   const maxCount = Math.max(
//                     ...ratingGraph.map((o) => o.UserCount || 1),
//                   );
//                   const fillsRatio = (item.UserCount || 0) / maxCount;
//                   return (
//                     <View key={index} style={styles.graphDistributionRow}>
//                       <Text style={styles.graphRatingIndexKey}>
//                         {item.Rating} Star
//                       </Text>
//                       <View style={styles.barEmptyTrack}>
//                         <View
//                           style={[
//                             styles.barFilledIndicator,
//                             { width: `${fillsRatio * 100}%` },
//                           ]}
//                         />
//                       </View>
//                       <Text style={styles.graphIndexValueCount}>
//                         {item.UserCount}
//                       </Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* {reviewsList.length > 0 ? (
//               <View style={{ marginTop: 8 }}>
//                 {reviewsList.map((item) => (
//                   <View
//                     key={item.ProductRatingId}
//                     style={styles.reviewItemWrapperCard}
//                   >
//                     <View style={styles.reviewHeaderRow}>
//                       <Text style={styles.reviewClientUserText}>
//                         {item.Customer || "Verified Buyer"}
//                         {user &&
//                           (item.Email?.toLowerCase() ===
//                             user.Email?.toLowerCase() ||
//                             item.Customer === user.Name) && (
//                             <Text style={styles.userBadgeHighlight}>
//                               {" "}
//                               (You)
//                             </Text>
//                           )}
//                       </Text>
//                       <Text style={styles.reviewTimestampLabel}>
//                         {item.TimeSince || "Recent"}
//                       </Text>
//                     </View>
//                     <View style={[styles.starRow, { marginVertical: 6 }]}>
//                       {[1, 2, 3, 4, 5].map((s) => (
//                         <Ionicons
//                           key={s}
//                           name={s <= item.Rating ? "star" : "star-outline"}
//                           size={12}
//                           color="#F59E0B"
//                         />
//                       ))}
//                     </View>
//                     <Text style={styles.reviewBodyParagraph}>
//                       {item.Review}
//                     </Text>
//                   </View>
//                 ))}
//               </View>
//             ) : (
//               <Text style={styles.emptyReviewsFallbackText}>
//                 No reviews published for this item yet.
//               </Text>
//             )} */}

//             {reviewsList.length > 0 ? (
//               <>
//                 <View style={{ marginTop: 8 }}>
//                   {displayedReviews.map((item) => (
//                     <View
//                       key={item.ProductRatingId}
//                       style={styles.reviewItemWrapperCard}
//                     >
//                       <View style={styles.reviewHeaderRow}>
//                         <Text style={styles.reviewClientUserText}>
//                           {item.Customer || "Verified Buyer"}
//                           {user &&
//                             (item.Email?.toLowerCase() ===
//                               user.Email?.toLowerCase() ||
//                               item.Customer === user.Name) && (
//                               <Text style={styles.userBadgeHighlight}>
//                                 {" "}
//                                 (You)
//                               </Text>
//                             )}
//                         </Text>
//                         <Text style={styles.reviewTimestampLabel}>
//                           {item.TimeSince || "Recent"}
//                         </Text>
//                       </View>

//                       <View
//                         style={[
//                           styles.starRow,
//                           { marginVertical: 6, flexDirection: "row" },
//                         ]}
//                       >
//                         {[1, 2, 3, 4, 5].map((s) => (
//                           <Ionicons
//                             key={s}
//                             name={s <= item.Rating ? "star" : "star-outline"}
//                             size={12}
//                             color="#F59E0B"
//                             style={{ marginRight: 2 }}
//                           />
//                         ))}
//                       </View>

//                       <Text style={styles.reviewBodyParagraph}>
//                         {item.Review}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>

//                 {/* Professional Toggle Control Action Link */}
//                 {reviewsList.length > DEFAULT_VISIBLE_COUNT && (
//                   <TouchableOpacity
//                     style={styles.toggleVisibilityButton}
//                     onPress={() => setExpandedReviews(!expandedReviews)}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={styles.toggleVisibilityText}>
//                       {expandedReviews
//                         ? "Hide Reviews"
//                         : `Show all ${reviewsList.length} reviews`}
//                     </Text>
//                     <Ionicons
//                       name={expandedReviews ? "chevron-up" : "chevron-down"}
//                       size={14}
//                       color="#0077b6"
//                       style={{ marginLeft: 4 }}
//                     />
//                   </TouchableOpacity>
//                 )}
//               </>
//             ) : (
//               <Text style={styles.emptyReviewsFallbackText}>
//                 No reviews published for this item yet.
//               </Text>
//             )}

//             {/* CONDITIONAL FORM RENDERING */}
//             {hasUserAlreadyReviewed ? (
//               <View style={styles.alreadyReviewedCard}>
//                 <Ionicons
//                   name="checkmark-done-circle"
//                   size={22}
//                   color="#15803D"
//                   style={{ marginRight: 8 }}
//                 />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.alreadyReviewedTitle}>
//                     Feedback Registered
//                   </Text>
//                   <Text style={styles.alreadyReviewedSubtitle}>
//                     You have shared your verified feedback for this item layout
//                     profile.
//                   </Text>
//                 </View>
//               </View>
//             ) : (
//               <View style={styles.feedbackFormCardFrame}>
//                 <Text style={styles.formSectionHeadline}>
//                   Share Your Feedback
//                 </Text>
//                 <Text style={styles.formSectionSubparagraph}>
//                   How would you rate your overall experience with this item?
//                 </Text>

//                 <View style={styles.formInteractiveStarsRow}>
//                   {[1, 2, 3, 4, 5].map((num) => (
//                     <TouchableOpacity
//                       key={num}
//                       activeOpacity={0.7}
//                       onPress={() => setUserRating(num)}
//                     >
//                       <Ionicons
//                         name={num <= userRating ? "star" : "star-outline"}
//                         size={28}
//                         color="#F59E0B"
//                         style={{ marginRight: 6 }}
//                       />
//                     </TouchableOpacity>
//                   ))}
//                 </View>

//                 <TextInput
//                   style={styles.formReviewTextInputField}
//                   placeholder="Write your review here..."
//                   placeholderTextColor="#94A3B8"
//                   multiline
//                   numberOfLines={4}
//                   value={userReviewText}
//                   onChangeText={setUserReviewText}
//                 />

//                 <TouchableOpacity
//                   style={styles.formSubmitActionCTA}
//                   activeOpacity={0.85}
//                   onPress={handleReviewSubmission}
//                   disabled={isSubmittingReview}
//                 >
//                   {isSubmittingReview ? (
//                     <ActivityIndicator size="small" color="#FFFFFF" />
//                   ) : (
//                     <Text style={styles.formSubmitActionCTAText}>
//                       Submit Review
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>

//           {/* RELATED PRODUCTS */}
//           {relatedProducts.length > 0 && (
//             <View style={[styles.sectionContainer, { marginTop: 32 }]}>
//               <Text style={[styles.sectionLabel, , { marginBottom: 22 }]}>
//                 The Collection Ecosystem
//               </Text>
//               <FlatList
//                 data={relatedProducts}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(item) => `rel-${item.ProductId}`}
//                 contentContainerStyle={styles.relatedListSpacing}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.relatedCard}
//                     activeOpacity={0.9}
//                     onPress={() =>
//                       router.push({
//                         pathname: "/(tabs)/category/product-details",
//                         params: { productId: item.ProductId },
//                       })
//                     }
//                   >
//                     <Image
//                       source={{
//                         uri: item.ThumbnailImagePath || IMAGE_PLACEHOLDER,
//                       }}
//                       style={styles.relatedCardImage}
//                     />
//                     <View style={styles.relatedContentFrame}>
//                       <Text style={styles.relatedItemTitle} numberOfLines={1}>
//                         {item.ProductName}
//                       </Text>
//                       <Text style={styles.relatedItemCategory}>
//                         {item.Category?.CategoryName || "Premium Component"}
//                       </Text>
//                     </View>
//                   </TouchableOpacity>
//                 )}
//               />
//             </View>
//           )}
//         </View>
//       </ScrollView>

//       {/* DOCK PURCHASE STICKER BAR - CONDITIONAL KEYBOARD DISMISSAL */}
//       {!isKeyboardVisible && (
//         <View
//           style={[
//             styles.actionDockBar,
//             { paddingBottom: Math.max(insets.bottom + 12, 16) },
//           ]}
//         >
//           <View style={styles.actionDockRow}>
//             <TouchableOpacity
//               style={[
//                 styles.wishlistCircleButton,
//                 isCurrentProductWishlisted && styles.wishlistCircleButtonActive,
//               ]}
//               onPress={handleWishlistPress}
//               disabled={isWishlistActionRunning}
//               activeOpacity={0.7}
//             >
//               {isWishlistActionRunning ? (
//                 <ActivityIndicator size="small" color="#000" />
//               ) : (
//                 <Ionicons
//                   name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
//                   size={20}
//                   color={isCurrentProductWishlisted ? "#0F172A" : "#475569"}
//                 />
//               )}
//             </TouchableOpacity>

//             <LinearGradient
//               colors={
//                 !(product?.InStock && selectedVariant?.InStock)
//                   ? ["#E2E8F0", "#CBD5E1"]
//                   : isCurrentVariantInCart
//                     ? ["#334155", "#0F172A"]
//                     : ["#1E293B", "#0F172A"]
//               }
//               style={styles.ctaButtonGradient}
//             >
//               <TouchableOpacity
//                 style={styles.ctaRealButton}
//                 activeOpacity={0.8}
//                 disabled={
//                   !product?.InStock ||
//                   !selectedVariant?.InStock ||
//                   isAddingToCart ||
//                   isRemovingFromCart
//                 }
//                 onPress={handleCartActionDispatch}
//               >
//                 {isAddingToCart || isRemovingFromCart ? (
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                 ) : (
//                   <>
//                     <Ionicons
//                       name={
//                         !(product?.InStock && selectedVariant?.InStock)
//                           ? "close-circle-outline"
//                           : isCurrentVariantInCart
//                             ? "bag-check"
//                             : "bag-handle-outline"
//                       }
//                       size={18}
//                       color="#FFFFFF"
//                       style={{ marginRight: 8 }}
//                     />
//                     <Text style={styles.ctaButtonText}>
//                       {!(product?.InStock && selectedVariant?.InStock)
//                         ? "UNAVAILABLE"
//                         : isCurrentVariantInCart
//                           ? "REMOVE SELECTION"
//                           : "ADD TO SHOPPING BAG"}
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </LinearGradient>
//           </View>
//         </View>
//       )}

//       {/* FULL-SCREEN IMAGES SWIPER MODAL (FACEBOOK STYLE) */}
//       <Modal
//         visible={isFullscreenVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setIsFullscreenVisible(false)}
//       >
//         <View style={styles.fullscreenOverlay}>
//           {/* Header Action Row */}
//           <View
//             style={[
//               styles.fullscreenHeader,
//               { paddingTop: Math.max(insets.top, 20) },
//             ]}
//           >
//             <Text style={styles.fullscreenIndexLabel}>
//               {fullscreenIndex + 1} / {imageGallery.length}
//             </Text>
//             <TouchableOpacity
//               style={styles.fullscreenCloseButton}
//               onPress={() => setIsFullscreenVisible(false)}
//             >
//               <Ionicons name="close" size={26} color="#FFFFFF" />
//             </TouchableOpacity>
//           </View>

//           {/* Main Horizontal Carousel Swiper */}
//           <FlatList
//             ref={fullscreenRef}
//             data={imageGallery}
//             horizontal
//             pagingEnabled
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(_, index) => `fs-img-${index}`}
//             onMomentumScrollEnd={handleFullscreenScroll}
//             initialScrollIndex={fullscreenIndex}
//             getItemLayout={(_, index) => ({
//               length: screenWidth,
//               offset: screenWidth * index,
//               index,
//             })}
//             renderItem={({ item }) => (
//               <View
//                 style={{
//                   width: screenWidth,
//                   height: screenHeight,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Image
//                   source={{ uri: item.OriginalImagePath || IMAGE_PLACEHOLDER }}
//                   style={{
//                     width: screenWidth,
//                     height: screenHeight * 0.75,
//                     resizeMode: "contain",
//                   }}
//                 />
//               </View>
//             )}
//           />
//         </View>
//       </Modal>

//       <AuthGuardModal
//         visible={modalVisible}
//         onClose={() => setModalVisible(false)}
//         title="Account Access Required"
//         subtitle="Authenticate your account to publish reviews and wishlist items data updates."
//         iconName="heart"
//       />

//       {/* CUSTOM ALERT MODAL */}
//       <Modal
//         visible={customAlert.visible}
//         transparent
//         animationType="fade"
//         onRequestClose={() =>
//           setCustomAlert((prev) => ({ ...prev, visible: false }))
//         }
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContainer}>
//             <View
//               style={[
//                 styles.statusIndicator,
//                 {
//                   backgroundColor:
//                     customAlert.type === "success" ? "#10B981" : "#EF4444",
//                 },
//               ]}
//             >
//               <Ionicons
//                 name={
//                   customAlert.type === "success" ? "checkmark" : "alert-circle"
//                 }
//                 size={24}
//                 color="#FFFFFF"
//               />
//             </View>
//             <Text style={styles.modalTitle}>{customAlert.title}</Text>
//             <Text style={styles.modalMessage}>{customAlert.message}</Text>
//             <TouchableOpacity
//               activeOpacity={0.8}
//               style={[
//                 styles.actionButton,
//                 {
//                   backgroundColor:
//                     customAlert.type === "success" ? "#0F172A" : "#EF4444",
//                 },
//               ]}
//               onPress={() =>
//                 setCustomAlert((prev) => ({ ...prev, visible: false }))
//               }
//             >
//               <Text style={styles.actionButtonText}>Continue</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF", paddingBottom: 100 },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   premiumErrorWorkspace: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 32,
//   },
//   errorCardBody: { alignItems: "center", width: "100%", maxWidth: 320 },
//   errorIconFrame: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#F8FAFC",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   errorHeadlineText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#0F172A",
//     marginBottom: 10,
//     letterSpacing: -0.2,
//   },
//   errorSubparagraphText: {
//     fontSize: 13,
//     color: "#64748B",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 28,
//   },
//   premiumErrorActionCTA: {
//     paddingVertical: 13,
//     paddingHorizontal: 28,
//     backgroundColor: "#0F172A",
//     borderRadius: 4,
//     width: "100%",
//     alignItems: "center",
//   },
//   premiumErrorCTALabel: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 13,
//     letterSpacing: 0.3,
//   },
//   toastNotification: {
//     position: "absolute",
//     top: 100,
//     left: 20,
//     right: 20,
//     zIndex: 999,
//   },
//   scrollPadding: { paddingBottom: 140 },
//   carouselContainer: { position: "relative", backgroundColor: "#FAFBFB" },
//   carouselTopShadow: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     height: 100,
//     zIndex: 2,
//   },
//   dotRow: {
//     position: "absolute",
//     bottom: 24,
//     flexDirection: "row",
//     width: "100%",
//     justifyContent: "center",
//     gap: 5,
//   },
//   dot: { height: 5, borderRadius: 3 },
//   activeDot: { width: 16, backgroundColor: "#0F172A" },
//   inactiveDot: { width: 6, backgroundColor: "rgba(15,23,42,0.2)" },
//   detailsCard: {
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     marginTop: -20,
//     paddingTop: 28,
//     paddingHorizontal: 20,
//   },
//   headerMetaRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   brandTitle: {
//     fontSize: 12,
//     fontWeight: "700",
//     textTransform: "uppercase",
//     color: "#64748B",
//     letterSpacing: 1,
//   },
//   statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   statusBadgeText: { fontSize: 11, fontWeight: "600" },
//   productName: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginTop: 8,
//     letterSpacing: -0.4,
//   },
//   ratingSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   starRow: { flexDirection: "row", alignItems: "center", gap: 2 },
//   ratingText: {
//     fontSize: 13,
//     fontWeight: "600",
//     color: "#0F172A",
//     marginLeft: 6,
//   },
//   dotDivider: { fontSize: 13, color: "#CBD5E1", marginHorizontal: 8 },
//   reviewCountText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
//   priceContainer: {
//     marginTop: 16,
//     flexDirection: "row",
//     alignItems: "baseline",
//     gap: 8,
//   },
//   currentPrice: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
//   priceRange: { fontSize: 12, color: "#64748B", fontWeight: "500" },
//   dividerLine: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 20 },
//   sectionContainer: { width: "100%" },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionLabel: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
//   skuLabel: { fontSize: 12, color: "#64748B", fontWeight: "500" },
//   variantsHorizontalContainer: { gap: 12, paddingRight: 20 },
//   luxuryVariantGridCard: {
//     width: 110,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 12,
//     padding: 8,
//     backgroundColor: "#FFFFFF",
//   },
//   luxuryVariantGridCardActive: { borderColor: "#0F172A", borderWidth: 1.5 },
//   variantImageWrapper: {
//     width: "100%",
//     height: 90,
//     borderRadius: 8,
//     backgroundColor: "#F8FAFC",
//     overflow: "hidden",
//     position: "relative",
//   },
//   variantCardThumbnail: { width: "100%", height: "100%", resizeMode: "cover" },
//   variantSelectedCheckBadge: { position: "absolute", top: 4, right: 4 },
//   variantGridMetaPane: { marginTop: 6 },
//   variantCardNameText: { fontSize: 12, fontWeight: "500", color: "#475569" },
//   variantCardNameTextActive: { fontWeight: "700", color: "#0F172A" },
//   variantCardPriceText: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: "#64748B",
//     marginTop: 2,
//   },
//   shortDescriptionText: {
//     fontSize: 14,
//     color: "#334155",
//     lineHeight: 22,
//     fontWeight: "500",
//     marginBottom: 6,
//   },
//   longDescriptionText: { fontSize: 13, color: "#64748B", lineHeight: 20 },
//   graphContainerSpace: { gap: 8, marginVertical: 12 },
//   graphDistributionRow: { flexDirection: "row", alignItems: "center" },
//   graphRatingIndexKey: {
//     fontSize: 12,
//     color: "#475569",
//     width: 45,
//     fontWeight: "500",
//   },
//   barEmptyTrack: {
//     flex: 1,
//     height: 6,
//     backgroundColor: "#F1F5F9",
//     borderRadius: 3,
//     marginHorizontal: 10,
//     overflow: "hidden",
//   },
//   barFilledIndicator: {
//     height: "100%",
//     backgroundColor: "#F59E0B",
//     borderRadius: 3,
//   },
//   graphIndexValueCount: {
//     fontSize: 12,
//     color: "#64748B",
//     width: 20,
//     textAlign: "right",
//   },
//   reviewItemWrapperCard: {
//     padding: 14,
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   reviewHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
//   reviewClientUserText: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
//   userBadgeHighlight: { color: "#15803D", fontWeight: "700" },
//   reviewTimestampLabel: { fontSize: 11, color: "#94A3B8" },
//   reviewBodyParagraph: { fontSize: 13, color: "#334155", lineHeight: 18 },
//   reviewsMainSection: {
//     width: "100%",
//   },
//   toggleVisibilityButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     backgroundColor: "#F0F7FF", // Ultra-light tint matches modern UI design trends
//     borderRadius: 8,
//     marginTop: 4,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#E0F2FE",
//   },
//   toggleVisibilityText: {
//     color: "#0077b6",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   emptyReviewsFallbackText: {
//     fontSize: 13,
//     color: "#94A3B8",
//     marginVertical: 12,
//     fontStyle: "italic",
//   },
//   alreadyReviewedCard: {
//     flexDirection: "row",
//     padding: 14,
//     backgroundColor: "#F0FDF4",
//     borderRadius: 12,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   alreadyReviewedTitle: { fontSize: 14, fontWeight: "700", color: "#166534" },
//   alreadyReviewedSubtitle: {
//     fontSize: 12,
//     color: "#166534",
//     marginTop: 2,
//     lineHeight: 16,
//   },
//   feedbackFormCardFrame: {
//     marginTop: 16,
//     padding: 16,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 16,
//   },
//   formSectionHeadline: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
//   formSectionSubparagraph: { fontSize: 12, color: "#64748B", marginTop: 2 },
//   formInteractiveStarsRow: { flexDirection: "row", marginVertical: 14 },
//   formReviewTextInputField: {
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 13,
//     color: "#0F172A",
//     height: 80,
//     textAlignVertical: "top",
//     backgroundColor: "#FAFAFA",
//   },
//   formSubmitActionCTA: {
//     backgroundColor: "#0F172A",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 12,
//   },
//   formSubmitActionCTAText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "600",
//   },
//   relatedListSpacing: { gap: 14, paddingRight: 20 },
//   relatedCard: {
//     width: 150,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   relatedCardImage: {
//     width: "100%",
//     height: 150,
//     resizeMode: "cover",
//     backgroundColor: "#F8FAFC",
//     borderRadius: 12,
//   },

//   relatedContentFrame: { paddingVertical: 6, paddingHorizontal: 3 },
//   relatedItemTitle: { fontSize: 13, fontWeight: "600", color: "#0F172A" },
//   relatedItemCategory: { fontSize: 11, color: "#94A3B8", marginTop: 1 },
//   actionDockBar: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#FFFFFF",
//     borderTopWidth: 1,
//     borderTopColor: "#F1F5F9",
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     zIndex: 10,
//   },
//   actionDockRow: { flexDirection: "row", alignItems: "center", gap: 12 },
//   wishlistCircleButton: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//   },
//   wishlistCircleButtonActive: {
//     backgroundColor: "#F1F5F9",
//     borderColor: "#0F172A",
//   },
//   ctaButtonGradient: {
//     flex: 1,
//     height: 48,
//     borderRadius: 24,
//     overflow: "hidden",
//   },
//   ctaRealButton: {
//     flex: 1,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100%",
//   },
//   ctaButtonText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "700",
//     letterSpacing: 0.5,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15,23,42,0.3)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//   },
//   modalContainer: {
//     width: "100%",
//     maxWidth: 320,
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 24,
//     alignItems: "center",
//   },
//   statusIndicator: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginBottom: 8,
//   },
//   modalMessage: {
//     fontSize: 13,
//     color: "#64748B",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   actionButton: {
//     width: "100%",
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//   },
//   actionButtonText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
//   fullscreenOverlay: { flex: 1, backgroundColor: "#000000" },
//   fullscreenHeader: {
//     position: "absolute",
//     left: 0,
//     right: 0,
//     zIndex: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     backgroundColor: "rgba(0,0,0,0.4)",
//     paddingBottom: 12,
//   },
//   fullscreenIndexLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
//   fullscreenCloseButton: {
//     width: 40,
//     height: 40,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });

import { ProductDetailsScreen } from "@/features/shop/components/ProductDetailsScreen";

export default function ProductDetails() {
  return <ProductDetailsScreen />;
}
