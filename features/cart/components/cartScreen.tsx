// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
// } from "react-native";
// import { MotiView } from "moti";
import { canIncrease, findStockIssues, stockNote, toStockLine } from "../utils/cartStock";
// import { Ionicons } from "@expo/vector-icons";
// import { useCartScreen } from "../hooks/useCartScreen";
// import { useAuth } from "@/store/AuthContext";
// import { AuthGuardModal } from "@/components/AuthGuardModal";
// import { useSharedCartData } from "@/store/CartContext";
// import { CustomErrorMessage } from "@/components/CustomErrorMessage";
// import { EmptyState } from "@/components/EmptyState";
// import { useIsFocused } from "@react-navigation/native";
// import { useRouter } from "expo-router";
// import { Colors } from "@/constants/Theme";
// const IMAGE_PLACEHOLDER =
//   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

// export const CartScreen = () => {
//   const { isAuthenticated } = useAuth();
//   const router = useRouter();
//   const {
//     cartItems,
//     pricingSummary,
//     handleIncrement,
//     handleDecrement,
//     handleRemove,
//     handleProcessCheckoutPipeline,
//     checkoutLoading,
//   } = useCartScreen();

//   const {
//     cartMessage,
//     loading,
//     serverError,
//     fetchCart,
//     markCartAsVisited,
//     deleteLoading,
//     refreshing,
//   } = useSharedCartData();

//   const [modalVisible, setModalVisible] = useState(false);
//   const isFocused = useIsFocused();

//   useEffect(() => {
//     if (isFocused) {
//       markCartAsVisited();
//     }
//   }, [isFocused]);

//   const handleRetryFetch = () => {
//     fetchCart();
//   };

//   const handleNavigateToDetails = (productId: number) => {
//     router.push({
//       pathname: "/(product)/product-details",
//       params: { productId: String(productId) },
//     });
//   };

//   if (loading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="small" color={Colors.primary} />
//       </View>
//     );
//   }

//   // Pure Component Helper to render Related Products cleanly beneath their parent
//   const renderRelatedProducts = (relatedProducts: any[]) => {
//     if (!relatedProducts || relatedProducts.length === 0) return null;

//     return (
//       <View style={styles.relatedSectionContainer}>
//         <View style={styles.relatedHeaderRow}>
//           <Ionicons name="sparkles-outline" size={14} color="#0284C7" />
//           <Text style={styles.relatedSectionTitle}>
//             Frequently Bought Together
//           </Text>
//         </View>

//         {relatedProducts.map((product: any) => (
//           <View key={`related-${product.ProductId}`} style={styles.relatedCard}>
//             <Image
//               source={{ uri: product.ThumbnailImagePath || IMAGE_PLACEHOLDER }}
//               style={styles.relatedProductImage}
//               resizeMode="cover"
//             />
//             <View style={styles.relatedInfo}>
//               <Text style={styles.relatedCategoryName}>
//                 {product.Category?.CategoryName || "Featured Option"}
//               </Text>
//               <Text style={styles.relatedProductName} numberOfLines={1}>
//                 {product.ProductName}
//               </Text>
//             </View>
//             <TouchableOpacity
//               style={styles.relatedAddBtn}
//               activeOpacity={0.7}
//               onPress={() => {
//                 handleNavigateToDetails(product.ProductId);
//               }}
//             >
//               <Text style={styles.relatedAddBtnText}>View Product</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>
//     );
//   };

//   return (
//     <View style={styles.container}>
//       {serverError ? (
//         <EmptyState
//           iconName="cloud-offline-outline"
//           title="Server Connection Interrupted"
//           description="We are having trouble synchronizing our Cart items. Please check your network and try again."
//           actionLabel="Retry Connection"
//           onActionPress={handleRetryFetch}
//         />
//       ) : (
//         <>
//           <FlatList
//             data={cartItems}
//             keyExtractor={(item) => `cart-row-${item.CartId}`}
//             contentContainerStyle={styles.listContainer}
//             showsVerticalScrollIndicator={false}
//             ListHeaderComponent={
//               <View style={styles.headerWrapper}>
//                 <Text style={styles.sheetTitle}>Shopping Cart</Text>
//                 <View style={styles.badgeCount}>
//                   <Text style={styles.badgeText}>{cartItems.length} Items</Text>
//                 </View>
//               </View>
//             }
//             renderItem={({ item, index }) => (
//               <View style={styles.itemGroupWrapper}>
//                 {/* Parent Cart Card Item Component */}
//                 <MotiView
//                   from={{ opacity: 0, translateY: 15 }}
//                   animate={{ opacity: 1, translateY: 0 }}
//                   transition={{
//                     type: "timing",
//                     duration: 350,
//                     delay: index * 40,
//                   }}
//                   style={styles.cartCard}
//                 >
//                   <View style={styles.imageContainer}>
//                     <Image
//                       source={{ uri: item.ProductImage || IMAGE_PLACEHOLDER }}
//                       style={styles.productImage}
//                       resizeMode="cover"
//                     />
//                   </View>

//                   <View style={styles.cardDetails}>
//                     <View style={styles.rowHeader}>
//                       <Text style={styles.productName} numberOfLines={2}>
//                         {item.ProductName}
//                       </Text>

//                       {!(
//                         deleteLoading.active &&
//                         deleteLoading.cartId === item.CartId
//                       ) ? (
//                         <TouchableOpacity
//                           onPress={() => handleRemove(item.CartId)}
//                           disabled={checkoutLoading}
//                           style={styles.deleteButtonContainer}
//                           activeOpacity={0.7}
//                         >
//                           <Ionicons
//                             name="trash-outline"
//                             size={18}
//                             color="#EF4444"
//                           />
//                         </TouchableOpacity>
//                       ) : (
//                         <ActivityIndicator
//                           size="small"
//                           color="#EF4444"
//                           style={styles.loaderPadding}
//                         />
//                       )}
//                     </View>

//                     <View style={styles.variantBadgeContainer}>
//                       <Ionicons
//                         name="options-outline"
//                         size={11}
//                         color="#64748B"
//                         style={{ marginRight: 4 }}
//                       />
//                       <Text style={styles.variantText} numberOfLines={1}>
//                         {item.ProductVariants || "Standard Configuration"}
//                       </Text>
//                     </View>

//                     <View style={styles.priceRow}>
//                       <Text style={styles.priceText}>
//                         Rs. {item.Price.toLocaleString()}
//                       </Text>
//                       {item.Discount > 0 && (
//                         <Text style={styles.variantTextDisc}>
//                           Disc: {item.Discount}
//                         </Text>
//                       )}

//                       <View style={styles.quantityWidget}>
//                         <TouchableOpacity
//                           style={styles.qtyBtn}
//                           activeOpacity={0.6}
//                           onPress={() => {
//                             if (!isAuthenticated) {
//                               setModalVisible(true);
//                               return;
//                             }
//                             handleDecrement(item.CartId, item.Quantity);
//                           }}
//                           disabled={checkoutLoading || deleteLoading.active}
//                         >
//                           <Ionicons name="remove" size={14} color="#0F172A" />
//                         </TouchableOpacity>

//                         <View style={styles.qtyTextContainer}>
//                           <Text style={styles.qtyText}>{item.Quantity}</Text>
//                         </View>

//                         <TouchableOpacity
//                           style={styles.qtyBtn}
//                           activeOpacity={0.6}
//                           onPress={() => {
//                             if (!isAuthenticated) {
//                               setModalVisible(true);
//                               return;
//                             }
//                             handleIncrement(item.CartId, item.Quantity);
//                           }}
//                           disabled={checkoutLoading || deleteLoading.active}
//                         >
//                           <Ionicons name="add" size={14} color="#0F172A" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   </View>
//                 </MotiView>

//                 {/* Sub-list injection representing Related Items targeting user configuration 2 */}
//                 {renderRelatedProducts(item.relatedProductList)}
//               </View>
//             )}
//             ListFooterComponent={
//               cartItems.length > 0 ? (
//                 <View style={styles.scrollSummaryContainer}>
//                   <Text style={styles.breakdownHeading}>Price Breakdown</Text>

//                   <View style={styles.summaryLine}>
//                     <Text style={styles.summaryLabel}>Subtotal</Text>
//                     <Text style={styles.summaryValue}>
//                       Rs. {pricingSummary.subtotal.toLocaleString()}
//                     </Text>
//                   </View>

//                   <View style={styles.summaryLine}>
//                     <Text style={styles.summaryLabel}>Discounts</Text>
//                     <Text style={[styles.summaryValue, { color: "#10B981" }]}>
//                       - Rs. {pricingSummary.discount.toLocaleString()}
//                     </Text>
//                   </View>
//                 </View>
//               ) : null
//             }
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={handleRetryFetch}
//                 tintColor={Colors.headerOne[0]}
//               />
//             }
//             ListEmptyComponent={
//               <View style={styles.emptyView}>
//                 <View style={styles.emptyIconCircle}>
//                   <Ionicons
//                     name="bag-handle-outline"
//                     size={36}
//                     color={Colors.white}
//                   />
//                 </View>
//                 <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
//                 <Text style={styles.emptySubtitle}>
//                   Looks like you haven't added anything to your cart yet.
//                   Explore our latest collections to get started!
//                 </Text>
//                 <TouchableOpacity
//                   style={styles.premiumErrorActionCTA}
//                   onPress={() => router.back()}
//                   activeOpacity={0.8}
//                 >
//                   <Text style={styles.premiumErrorCTALabel}>
//                     Return to Catalog
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             }
//           />

//           {/* Fixed Side-by-Side Professional Sticky Bottom Bar */}
//           {cartItems.length > 0 && (
//             <View style={styles.compactStickyFooter}>
//               <View style={styles.metaPriceContainer}>
//                 <Text style={styles.footerTotalLabel}>GRAND TOTAL</Text>
//                 <Text style={styles.footerTotalValue} numberOfLines={1}>
//                   Rs. {pricingSummary.grandTotal.toLocaleString()}
//                 </Text>
//               </View>

//               <TouchableOpacity
//                 style={styles.splitCheckoutBtn}
//                 activeOpacity={0.85}
//                 disabled={checkoutLoading || deleteLoading.active}
//                 onPress={handleProcessCheckoutPipeline}
//               >
//                 {checkoutLoading ? (
//                   <ActivityIndicator size="small" color="#FFFFFF" />
//                 ) : (
//                   <View style={styles.innerBtnLayout}>
//                     <Text style={styles.splitCheckoutBtnText}>CHECKOUT</Text>
//                     <Ionicons
//                       name="arrow-forward"
//                       size={16}
//                       color="#FFFFFF"
//                       style={{ marginLeft: 6 }}
//                     />
//                   </View>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}

//           <AuthGuardModal
//             visible={modalVisible}
//             onClose={() => setModalVisible(false)}
//             title="Account Required"
//             subtitle="You can't update your cart without an account."
//             iconName="person-circle-outline"
//           />
//           {cartMessage && (
//             <CustomErrorMessage>{cartMessage}</CustomErrorMessage>
//           )}
//         </>
//       )}
//     </View>
//   );
// };

import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useCartScreen } from "../hooks/useCartScreen";
import { useAuth } from "@/store/AuthContext";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { useSharedCartData } from "@/store/CartContext";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { EmptyState } from "@/components/EmptyState";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Theme";

const IMAGE_PLACEHOLDER =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIAeZuzrVTr0malUh4q4UD4wiipA8RuYlqHHDR6IQBxQ&s=10";

export const CartScreen = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const {
    cartItems,
    pricingSummary,
    handleIncrement,
    handleDecrement,
    handleRemove,
    handleProcessCheckoutPipeline,
    checkoutLoading,
    stockIssues,
    stockProblem,
    fixStock,
    fixingStock,
  } = useCartScreen();

  const {
    cartMessage,
    loading,
    serverError,
    fetchCart,
    markCartAsVisited,
    deleteLoading,
    refreshing,
  } = useSharedCartData();

  const [modalVisible, setModalVisible] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      markCartAsVisited();
    }
  }, [isFocused]);

  const handleRetryFetch = () => {
    fetchCart();
  };

  const handleNavigateToDetails = (productId: number) => {
    router.push({
      pathname: "/(product)/product-details",
      params: { productId: String(productId) },
    });
  };

  // Extract, flatten, and filter out any duplicate related products dynamically
  const uniqueRelatedProducts = useMemo(() => {
    const allRelated = cartItems.flatMap(
      (item: any) => item.relatedProductList || [],
    );
    const seenIds = new Set<number>();
    return allRelated.filter((product: any) => {
      if (!product || !product.ProductId || seenIds.has(product.ProductId)) {
        return false;
      }
      seenIds.add(product.ProductId);
      return true;
    });
  }, [cartItems]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  // Related products rendered below the main items list cleanly
  const renderRelatedProductsSection = () => {
    if (uniqueRelatedProducts.length === 0) return null;

    return (
      <View style={styles.relatedSectionContainer}>
        <View style={styles.relatedHeaderRow}>
          <Ionicons name="sparkles-outline" size={14} color="#0284C7" />
          <Text style={styles.relatedSectionTitle}>
            Frequently Bought Together
          </Text>
        </View>

        <FlatList
          data={uniqueRelatedProducts}
          horizontal
          keyExtractor={(product) => `global-related-${product.ProductId}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
          renderItem={({ item: product }) => (
            <View style={styles.relatedCard}>
              <Image
                source={{
                  uri: product.ThumbnailImagePath || IMAGE_PLACEHOLDER,
                }}
                style={styles.relatedProductImage}
                resizeMode="cover"
              />
              <View style={styles.relatedInfo}>
                <Text style={styles.relatedCategoryName}>
                  {product.Category?.CategoryName || "Featured Option"}
                </Text>
                <Text style={styles.relatedProductName} numberOfLines={1}>
                  {product.ProductName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.relatedAddBtn}
                activeOpacity={0.7}
                onPress={() => handleNavigateToDetails(product.ProductId)}
              >
                <Text style={styles.relatedAddBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {serverError ? (
        <EmptyState
          iconName="cloud-offline-outline"
          title="Server Connection Interrupted"
          description="We are having trouble synchronizing our Cart items. Please check your network and try again."
          actionLabel="Retry Connection"
          onActionPress={handleRetryFetch}
        />
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => `cart-row-${item.CartId}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.headerWrapper}>
                <Text style={styles.sheetTitle}>Shopping Cart</Text>
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeText}>{cartItems.length} Items</Text>
                </View>
              </View>
            }
            renderItem={({ item, index }) => (
              <View style={styles.itemGroupWrapper}>
                <MotiView
                  from={{ opacity: 0, translateY: 15 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 350,
                    delay: index * 40,
                  }}
                  style={styles.cartCard}
                >
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: item.ProductImage || IMAGE_PLACEHOLDER }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.rowHeader}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {item.ProductName}
                      </Text>

                      {!(
                        deleteLoading.active &&
                        deleteLoading.cartId === item.CartId
                      ) ? (
                        <TouchableOpacity
                          onPress={() => handleRemove(item.CartId)}
                          disabled={checkoutLoading}
                          style={styles.deleteButtonContainer}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      ) : (
                        <ActivityIndicator
                          size="small"
                          color="#EF4444"
                          style={styles.loaderPadding}
                        />
                      )}
                    </View>

                    <View style={styles.variantBadgeContainer}>
                      <Ionicons
                        name="options-outline"
                        size={11}
                        color="#64748B"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.variantText} numberOfLines={1}>
                        {item.ProductVariants || "Standard Configuration"}
                      </Text>
                    </View>
                    {stockNote(toStockLine(item)) && (
                      <Text
                        style={[
                          styles.stockNote,
                          findStockIssues([toStockLine(item)]).length > 0 &&
                            styles.stockNoteError,
                        ]}
                      >
                        {stockNote(toStockLine(item))}
                      </Text>
                    )}

                    <View style={styles.priceRow}>
                      <Text style={styles.priceText}>
                        Rs. {item.Price.toLocaleString()}
                      </Text>

                      <View style={styles.quantityWidget}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          activeOpacity={0.6}
                          onPress={() => {
                            if (!isAuthenticated) {
                              setModalVisible(true);
                              return;
                            }
                            handleDecrement(item.CartId, item.Quantity);
                          }}
                          disabled={checkoutLoading || deleteLoading.active}
                        >
                          <Ionicons name="remove" size={14} color="#0F172A" />
                        </TouchableOpacity>

                        <View style={styles.qtyTextContainer}>
                          <Text style={styles.qtyText}>{item.Quantity}</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          activeOpacity={0.6}
                          onPress={() => {
                            if (!isAuthenticated) {
                              setModalVisible(true);
                              return;
                            }
                            handleIncrement(item.CartId, item.Quantity);
                          }}
                          disabled={
                            checkoutLoading ||
                            deleteLoading.active ||
                            !canIncrease(toStockLine(item))
                          }
                          accessibilityLabel={
                            canIncrease(toStockLine(item))
                              ? "Increase quantity"
                              : "No more in stock"
                          }
                        >
                          <Ionicons
                            name="add"
                            size={14}
                            color={canIncrease(toStockLine(item)) ? "#0F172A" : "#CBD5E1"}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </MotiView>
              </View>
            )}
            ListFooterComponent={
              cartItems.length > 0 ? (
                <View>
                  {/* Clean UI placement: between items list and checkout summary panel */}
                  {renderRelatedProductsSection()}

                  <View style={styles.scrollSummaryContainer}>
                    <Text style={styles.breakdownHeading}>Price Breakdown</Text>

                    <View style={styles.summaryLine}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>
                        Rs. {pricingSummary.subtotal.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.summaryLine}>
                      <Text style={styles.summaryLabel}>Discounts</Text>
                      <Text style={[styles.summaryValue, { color: "#10B981" }]}>
                        - Rs. {pricingSummary.discount.toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRetryFetch}
                tintColor={Colors.headerOne[0]}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="bag-handle-outline"
                    size={36}
                    color={Colors.white}
                  />
                </View>
                <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
                <Text style={styles.emptySubtitle}>
                  Looks like you haven't added anything to your cart yet.
                  Explore our latest collections to get started!
                </Text>
                <TouchableOpacity
                  style={styles.premiumErrorActionCTA}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.premiumErrorCTALabel}>
                    Return to Catalog
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />

          {stockProblem && (
            <View style={styles.stockBanner} accessibilityRole="alert">
              <Text style={styles.stockBannerText}>
                {stockProblem} Please update your cart to continue.
              </Text>
              <TouchableOpacity
                onPress={fixStock}
                disabled={fixingStock}
                style={styles.stockBannerBtn}
                accessibilityRole="button"
              >
                <Text style={styles.stockBannerBtnText}>
                  {fixingStock ? "Updating..." : "Fix my cart"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {cartItems.length > 0 && (
            <View style={styles.compactStickyFooter}>
              <View style={styles.metaPriceContainer}>
                <Text style={styles.footerTotalLabel}>GRAND TOTAL</Text>
                <Text style={styles.footerTotalValue} numberOfLines={1}>
                  Rs. {pricingSummary.grandTotal.toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.splitCheckoutBtn}
                activeOpacity={0.85}
                disabled={
                  checkoutLoading || deleteLoading.active || stockIssues.length > 0
                }
                onPress={handleProcessCheckoutPipeline}
              >
                {checkoutLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <View style={styles.innerBtnLayout}>
                    <Text style={styles.splitCheckoutBtnText}>CHECKOUT</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={16}
                      color="#FFFFFF"
                      style={{ marginLeft: 6 }}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          <AuthGuardModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            title="Account Required"
            subtitle="You can't update your cart without an account."
            iconName="person-circle-outline"
          />
          {cartMessage && (
            <CustomErrorMessage>{cartMessage}</CustomErrorMessage>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stockNote: { fontSize: 11.5, color: "#92400E", marginTop: 4, fontWeight: "600" },
  stockNoteError: { color: "#B91C1C" },
  stockBanner: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  stockBannerText: { color: "#B91C1C", fontSize: 12.5, fontWeight: "600", lineHeight: 18 },
  stockBannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#B91C1C",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  stockBannerBtnText: { color: "#fff", fontSize: 12.5, fontWeight: "700" },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 120, // Clean cushioning for the sticky action footer
  },
  headerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 4,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  badgeCount: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#0369A1",
    fontSize: 12,
    fontWeight: "700",
  },
  itemGroupWrapper: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",

    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 12,
  },
  imageContainer: {
    alignSelf: "center",
  },
  productImage: {
    width: 85,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  cardDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    flex: 0.92,
    lineHeight: 18,
  },
  deleteButtonContainer: {
    padding: 2,
  },
  loaderPadding: {
    padding: 2,
  },
  variantBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  variantText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  variantTextDisc: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0284C7",
  },
  quantityWidget: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyTextContainer: {
    minWidth: 24,
    alignItems: "center",
  },
  qtyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  /* --- Related Products Section Styles --- */
  // relatedSectionContainer: {
  //   backgroundColor: "#FAFAFA",
  //   borderTopWidth: 1,
  //   borderTopColor: "#F1F5F9",
  //   padding: 12,
  // },
  // relatedHeaderRow: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   marginBottom: 8,
  // },
  // relatedSectionTitle: {
  //   fontSize: 11,
  //   fontWeight: "700",
  //   color: "#64748B",
  //   textTransform: "uppercase",
  //   letterSpacing: 0.5,
  //   marginLeft: 4,
  // },
  // relatedCard: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   backgroundColor: "#FFFFFF",
  //   borderRadius: 10,
  //   padding: 8,
  //   marginBottom: 6,
  //   borderWidth: 1,
  //   borderColor: "#F1F5F9",
  // },
  // relatedProductImage: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 6,
  //   backgroundColor: "#F1F5F9",
  // },
  // relatedInfo: {
  //   flex: 1,
  //   marginLeft: 10,
  //   justifyContent: "center",
  // },
  // relatedCategoryName: {
  //   fontSize: 10,
  //   color: "#94A3B8",
  //   fontWeight: "600",
  // },
  // relatedProductName: {
  //   fontSize: 12,
  //   fontWeight: "600",
  //   color: "#334155",
  //   marginTop: 1,
  // },
  // relatedAddBtn: {
  //   backgroundColor: "#E0F2FE",
  //   paddingHorizontal: 12,
  //   paddingVertical: 6,
  //   borderRadius: 8,
  // },
  // relatedAddBtnText: {
  //   color: "#0369A1",
  //   fontSize: 11,
  //   fontWeight: "700",
  // },
  /* --- Price Breakdown (In-Scroll) Styles --- */

  relatedSectionContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  relatedHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  relatedSectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  relatedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    width: 280,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  relatedProductImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
  },
  relatedInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
    paddingRight: 4,
  },
  relatedCategoryName: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "600",
  },
  relatedProductName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginTop: 1,
  },
  relatedAddBtn: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  relatedAddBtnText: {
    color: "#0284C7",
    fontSize: 11,
    fontWeight: "700",
  },

  scrollSummaryContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  breakdownHeading: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "600",
  },
  /* --- Empty State --- */
  emptyView: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: Colors.accent,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 20,
  },
  premiumErrorActionCTA: {
    paddingVertical: 13,
    paddingHorizontal: 28,
    backgroundColor: Colors.accent,
    borderRadius: 30,
    width: "100%",
    marginTop: 10,
    alignItems: "center",
  },
  premiumErrorCTALabel: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  /* --- Compact Side-by-Side Professional Bottom Bar --- */
  compactStickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28, // Secure protection buffer tracking home indicator layout
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 15,
  },
  metaPriceContainer: {
    flex: 0.45,
    justifyContent: "center",
  },
  footerTotalLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  footerTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 2,
  },
  splitCheckoutBtn: {
    flex: 0.55,
    backgroundColor: "#0284C7",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  innerBtnLayout: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitCheckoutBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
