// import React from "react";
// import {
//   StyleSheet,
//   Text,
//   View,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from "react-native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// export default function CheckoutSummaryScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   // Safely deconstruct the checkout API's response data parsed from parameters stringification
//   const checkoutData = params.data ? JSON.parse(params.data as string) : null;
//   console.log("Parsed checkout data from params:", checkoutData);
//   //   const checkoutData = {
//   //     Message: "Checkout summary retrieved successfully.",
//   //     Type: "Success",
//   //     HttpStatusCode: 200,
//   //     Data: {
//   //       OrderTotalPrice: 250.0,
//   //       OrderTotalDiscount: 35.0,
//   //       DeliveryCharges: 15.0,
//   //       TaxAmount: 12.5,
//   //       OrderTotalAmount: 242.5,
//   //       TotalItems: 2,
//   //       CouponCode: "WELCOME10",
//   //       PaymentMethod: "Credit Card",
//   //       UserId: 45012,
//   //       HomeDeliveryEnable: true,
//   //       ShowAddressInLabel: true,
//   //       IsMultipleCustomerAddress: false,
//   //       IsBranchExistInTheSelectedCity: true,
//   //       ShippingDetail: {
//   //         AddressBookId: 1024,
//   //         FullName: "John Doe",
//   //         EmailAddress: "johndoe@example.com",
//   //         Phone: "+12025550143",
//   //         Address: "123 Main Street, Apt 4B",
//   //         CityId: 12,
//   //         City: "New York",
//   //         State: "NY",
//   //         Country: "United States",
//   //         ZipCode: "10001",
//   //         Latitude: "40.7128",
//   //         Longitude: "-74.0060",
//   //       },
//   //       BillingDetail: {
//   //         FullName: "John Doe",
//   //         EmailAddress: "johndoe@example.com",
//   //         Phone: "+12025550143",
//   //         Address: "123 Main Street, Apt 4B",
//   //         City: "New York",
//   //         State: "NY",
//   //         Country: "United States",
//   //         ZipCode: "10001",
//   //       },
//   //       CartItemDtos: {
//   //         CartItemList: [
//   //           {
//   //             CartId: 8812,
//   //             ProductId: 501,
//   //             ProductDetailId: 2011,
//   //             ProductName: "Premium Wireless Headphones",
//   //             ProductImage: "https://example.com",
//   //             Quantity: 1,
//   //             Price: 150.0,
//   //             Discount: 20.0,
//   //             DiscountValueType: 1,
//   //             DiscountedPrice: 130.0,
//   //             TotalAmount: 130.0,
//   //             CampaignId: 45,
//   //             IsCampaignApplied: true,
//   //             IsPromotional: false,
//   //             IsProductAvailableInStock: true,
//   //             IsAvailableStock: 14,
//   //             IsAvailableQuantity: true,
//   //             InventoryManagement: true,
//   //             TenantInventoryManagementFlag: true,
//   //             CartItemVariantList: [
//   //               {
//   //                 VariantGroupId: 1,
//   //                 VariantGroup: "Color",
//   //                 VariantId: 102,
//   //                 VariantName: "Matte Black",
//   //               },
//   //             ],
//   //           },
//   //           {
//   //             CartId: 8813,
//   //             ProductId: 604,
//   //             ProductDetailId: 3022,
//   //             ProductName: "Ergonomic Laptop Stand",
//   //             ProductImage: "https://example.com",
//   //             Quantity: 1,
//   //             Price: 100.0,
//   //             Discount: 15.0,
//   //             DiscountValueType: 1,
//   //             DiscountedPrice: 85.0,
//   //             TotalAmount: 85.0,
//   //             CampaignId: 0,
//   //             IsCampaignApplied: false,
//   //             IsPromotional: false,
//   //             IsProductAvailableInStock: true,
//   //             IsAvailableStock: 5,
//   //             IsAvailableQuantity: true,
//   //             InventoryManagement: true,
//   //             TenantInventoryManagementFlag: true,
//   //             CartItemVariantList: [
//   //               {
//   //                 VariantGroupId: 2,
//   //                 VariantGroup: "Material",
//   //                 VariantId: 204,
//   //                 VariantName: "Aluminum",
//   //               },
//   //             ],
//   //           },
//   //         ],
//   //         TotalPrice: 250.0,
//   //         TotalDiscount: 35.0,
//   //         NetTotal: 215.0,
//   //         HomeDeliveryEnable: true,
//   //       },
//   //     },
//   //   };

//   if (!checkoutData) {
//     return (
//       <View style={styles.centerWrapper}>
//         <Text style={styles.errorText}>No checkout session found.</Text>
//       </View>
//     );
//   }

//   const {
//     OrderTotalPrice,
//     OrderTotalDiscount,
//     DeliveryCharges,
//     OrderTotalAmount,
//     ShippingDetail,
//     BillingDetail,
//     CartItemDtos,
//   } = checkoutData;

//   const handleFinalizeOrder = () => {
//     // 🚀 This is our next landing step where we will hit order configuration/payment paths
//     router.push({
//       pathname: "/(tabs)/cart/payment-methods",
//       params: { orderAmount: String(OrderTotalAmount) },
//     });
//   };

//   return (
//     <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
//       {/* 📍 Shipping Details Section */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Ionicons name="location-outline" size={20} color="#E11D48" />
//           <Text style={styles.cardTitle}>Shipping Address</Text>
//         </View>
//         <Text style={styles.primaryText}>
//           {ShippingDetail?.FullName || "Guest Customer"}
//         </Text>
//         <Text style={styles.secondaryText}>
//           {ShippingDetail?.Address}, {ShippingDetail?.City}
//         </Text>
//         <Text style={styles.secondaryText}>Phone: {ShippingDetail?.Phone}</Text>
//       </View>

//       {/* 📦 Cart Breakdown Items Section */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Ionicons name="cube-outline" size={20} color="#E11D48" />
//           <Text style={styles.cardTitle}>Order Items</Text>
//         </View>
//         {CartItemDtos?.CartItemList?.map((item: any, idx: number) => (
//           <View key={item.CartId || idx} style={styles.itemRow}>
//             <Image
//               source={{ uri: item.ProductImage }}
//               style={styles.productImage}
//             />
//             <View style={styles.itemMeta}>
//               <Text style={styles.itemName} numberOfLines={1}>
//                 {item.ProductName}
//               </Text>
//               <Text style={styles.itemQty}>Qty: {item.Quantity}</Text>
//             </View>
//             <Text style={styles.itemPrice}>
//               Rs. {(item.Price * item.Quantity).toLocaleString()}
//             </Text>
//           </View>
//         ))}
//       </View>

//       {/* 💳 Billing Overview Summary Section */}
//       <View style={styles.card}>
//         <View style={styles.cardHeader}>
//           <Ionicons name="receipt-outline" size={20} color="#E11D48" />
//           <Text style={styles.cardTitle}>Payment Breakdown</Text>
//         </View>
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Subtotal</Text>
//           <Text style={styles.priceValue}>
//             Rs. {OrderTotalPrice.toLocaleString()}
//           </Text>
//         </View>
//         {OrderTotalDiscount > 0 && (
//           <View style={styles.priceRow}>
//             <Text style={styles.priceLabel}>Discount Save</Text>
//             <Text style={[styles.priceValue, styles.discountText]}>
//               - Rs. {OrderTotalDiscount.toLocaleString()}
//             </Text>
//           </View>
//         )}
//         <View style={styles.priceRow}>
//           <Text style={styles.priceLabel}>Delivery Charges</Text>
//           <Text style={styles.priceValue}>
//             Rs. {DeliveryCharges.toLocaleString()}
//           </Text>
//         </View>
//         <View style={styles.divider} />
//         <View style={styles.priceRow}>
//           <Text style={styles.totalLabel}>Grand Total</Text>
//           <Text style={styles.totalValue}>
//             Rs. {OrderTotalAmount.toLocaleString()}
//           </Text>
//         </View>
//       </View>

//       {/* 🛑 Submit Button Processing Trigger */}
//       <TouchableOpacity
//         style={styles.actionButton}
//         onPress={handleFinalizeOrder}
//       >
//         <Text style={styles.actionButtonText}>Proceed to Payment</Text>
//         <Ionicons name="arrow-forward" size={18} color="#FFF" />
//       </TouchableOpacity>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
//   centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { fontSize: 16, color: "#64748B" },
//   card: {
//     backgroundColor: "#FFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     borderStrokeWidth: 1,
//     borderColor: "#E2E8F0",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//     gap: 8,
//   },
//   cardTitle: { fontSize: 16, fontWeight: "600", color: "#1E293B" },
//   primaryText: {
//     fontSize: 15,
//     fontWeight: "500",
//     color: "#334155",
//     marginBottom: 2,
//   },
//   secondaryText: { fontSize: 14, color: "#64748B", marginTop: 2 },
//   itemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F1F5F9",
//   },
//   productImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 8,
//     backgroundColor: "#F1F5F9",
//   },
//   itemMeta: { flex: 1, marginLeft: 12 },
//   itemName: { fontSize: 14, fontWeight: "500", color: "#334155" },
//   itemQty: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
//   itemPrice: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
//   priceRow: {
//     flexDirection: "row",
//     justifyContent: "between",
//     justifyContent: "space-between",
//     paddingVertical: 6,
//   },
//   priceLabel: { fontSize: 14, color: "#64748B" },
//   priceValue: { fontSize: 14, fontWeight: "500", color: "#334155" },
//   discountText: { color: "#16A34A" },
//   divider: {
//     height: 1,
//     backgroundColor: "#E2E8F0",
//     my: 10,
//     marginVertical: 10,
//   },
//   totalLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
//   totalValue: { fontSize: 18, fontWeight: "700", color: "#E11D48" },
//   actionButton: {
//     backgroundColor: "#E11D48",
//     borderRadius: 12,
//     paddingVertical: 16,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 32,
//   },
//   actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "600" },
// });
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface AddressForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
}

export default function CheckoutSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  //   const checkoutData = {
  //     OrderTotalPrice: 250.0,
  //     OrderTotalDiscount: 35.0,
  //     DeliveryCharges: 15.0,
  //     TaxAmount: 12.5,
  //     OrderTotalAmount: 242.5,
  //     TotalItems: 2,
  //     CouponCode: "WELCOME10",
  //     PaymentMethod: "Credit Card",
  //     UserId: 45012,
  //     HomeDeliveryEnable: true,
  //     ShowAddressInLabel: true,
  //     IsMultipleCustomerAddress: false,
  //     IsBranchExistInTheSelectedCity: true,
  //     ShippingDetail: {
  //       AddressBookId: 1024,
  //       FullName: "John Doe",
  //       EmailAddress: "johndoe@example.com",
  //       Phone: "+12025550143",
  //       Address: "123 Main Street, Apt 4B",
  //       CityId: 12,
  //       City: "New York",
  //       State: "NY",
  //       Country: "United States",
  //       ZipCode: "10001",
  //       Latitude: "40.7128",
  //       Longitude: "-74.0060",
  //     },
  //     BillingDetail: {
  //       FullName: "John Doe",
  //       EmailAddress: "johndoe@example.com",
  //       Phone: "+12025550143",
  //       Address: "123 Main Street, Apt 4B",
  //       City: "New York",
  //       State: "NY",
  //       Country: "United States",
  //       ZipCode: "10001",
  //     },
  //     CartItemDtos: {
  //       CartItemList: [
  //         {
  //           CartId: 8812,
  //           ProductId: 501,
  //           ProductDetailId: 2011,
  //           ProductName: "Wireless Headphones",
  //           ProductImage: "https://example.com",
  //           Quantity: 1,
  //           Price: 150.0,
  //           Discount: 20.0,
  //           DiscountValueType: 1,
  //           DiscountedPrice: 130.0,
  //           TotalAmount: 130.0,
  //           CampaignId: 45,
  //           IsCampaignApplied: true,
  //           IsPromotional: false,
  //           IsProductAvailableInStock: true,
  //           IsAvailableStock: 14,
  //           IsAvailableQuantity: true,
  //           InventoryManagement: true,
  //           TenantInventoryManagementFlag: true,
  //           CartItemVariantList: [
  //             {
  //               VariantGroupId: 1,
  //               VariantGroup: "Color",
  //               VariantId: 102,
  //               VariantName: "Matte Black",
  //             },
  //           ],
  //         },
  //         {
  //           CartId: 8813,
  //           ProductId: 604,
  //           ProductDetailId: 3022,
  //           ProductName: "Ergonomic Laptop Stand",
  //           ProductImage: "https://example.com",
  //           Quantity: 1,
  //           Price: 100.0,
  //           Discount: 15.0,
  //           DiscountValueType: 1,
  //           DiscountedPrice: 85.0,
  //           TotalAmount: 85.0,
  //           CampaignId: 0,
  //           IsCampaignApplied: false,
  //           IsPromotional: false,
  //           IsProductAvailableInStock: true,
  //           IsAvailableStock: 5,
  //           IsAvailableQuantity: true,
  //           InventoryManagement: true,
  //           TenantInventoryManagementFlag: true,
  //           CartItemVariantList: [
  //             {
  //               VariantGroupId: 2,
  //               VariantGroup: "Material",
  //               VariantId: 204,
  //               VariantName: "Aluminum",
  //             },
  //           ],
  //         },
  //       ],
  //       TotalPrice: 250.0,
  //       TotalDiscount: 35.0,
  //       NetTotal: 215.0,
  //       HomeDeliveryEnable: true,
  //     },
  //   };

  // Parse response payload from initialization pipeline step cleanly
  const checkoutData = params.data ? JSON.parse(params.data as string) : null;

  // Track address locally if backend returns empty null shapes
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: checkoutData?.ShippingDetail?.FullName || "",
    phone: checkoutData?.ShippingDetail?.Phone || "",
    address: checkoutData?.ShippingDetail?.Address || "",
    city: checkoutData?.ShippingDetail?.City || "",
  });

  const [isAddressSaved, setIsAddressSaved] = useState<boolean>(
    !!checkoutData?.ShippingDetail?.Address &&
      !!checkoutData?.ShippingDetail?.FullName,
  );

  if (!checkoutData) {
    return (
      <View style={styles.centerWrapper}>
        <Text style={styles.errorText}>No checkout session found.</Text>
      </View>
    );
  }

  // Safely grab list items out of the data tree matrix array
  const itemsList = checkoutData?.CartItemDtos?.CartItemList || [];
  const hasItems = itemsList.length > 0;

  const handleSaveAddress = () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.address ||
      !addressForm.city
    ) {
      Alert.alert(
        "Missing Fields",
        "Please populate all structural delivery parameters safely.",
      );
      return;
    }
    setIsAddressSaved(true);
  };

  const handleProceedToPayment = () => {
    if (!isAddressSaved) {
      Alert.alert(
        "Shipping Required",
        "Please provide and save your shipping address information before proceeding.",
      );
      return;
    }

    // Forward clean payload states directly into payment engines
    router.push({
      pathname: "/(tabs)/cart/payment-methods",
      params: {
        orderAmount: String(
          checkoutData.OrderTotalAmount ||
            checkoutData.CartItemDtos?.NetTotal ||
            0,
        ),
        shippingDetails: JSON.stringify(addressForm),
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 📍 SHIPPING ADDRESS MANAGER BLOCK */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={20} color="#E11D48" />
          <Text style={styles.cardTitle}>Shipping Details</Text>
          {isAddressSaved && (
            <TouchableOpacity
              style={{ marginLeft: "auto" }}
              onPress={() => setIsAddressSaved(false)}
            >
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isAddressSaved ? (
          <View style={styles.formContainer}>
            <TextInput
              placeholder="Full Name"
              style={styles.input}
              value={addressForm.fullName}
              onChangeText={(txt) =>
                setAddressForm((p) => ({ ...p, fullName: txt }))
              }
            />
            <TextInput
              placeholder="Phone Number"
              keyboardType="phone-pad"
              style={styles.input}
              value={addressForm.phone}
              onChangeText={(txt) =>
                setAddressForm((p) => ({ ...p, phone: txt }))
              }
            />
            <TextInput
              placeholder="Complete Street Address"
              style={styles.input}
              value={addressForm.address}
              onChangeText={(txt) =>
                setAddressForm((p) => ({ ...p, address: txt }))
              }
            />
            <TextInput
              placeholder="City"
              style={styles.input}
              value={addressForm.city}
              onChangeText={(txt) =>
                setAddressForm((p) => ({ ...p, city: txt }))
              }
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveAddress}
            >
              <Text style={styles.saveBtnText}>
                Confirm Shipping Destination
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addressDisplay}>
            <Text style={styles.primaryText}>{addressForm.fullName}</Text>
            <Text style={styles.secondaryText}>
              {addressForm.address}, {addressForm.city}
            </Text>
            <Text style={styles.secondaryText}>Phone: {addressForm.phone}</Text>
          </View>
        )}
      </View>

      {/* 📦 CART BREAKDOWN ITEMS SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube" size={20} color="#E11D48" />
          <Text style={styles.cardTitle}>
            Order Items ({checkoutData.TotalItems || itemsList.length})
          </Text>
        </View>

        {!hasItems ? (
          <Text style={styles.emptyItemsText}>
            No product items detected in server checkout cache bucket layout.
          </Text>
        ) : (
          itemsList.map((item: any, idx: number) => (
            <View key={item.CartId || idx} style={styles.itemRow}>
              <Image
                source={{
                  uri: item.ProductImage || "https://via.placeholder.com/150",
                }}
                style={styles.productImage}
              />
              <View style={styles.itemMeta}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.ProductName || "Store Product"}
                </Text>
                <Text style={styles.itemQty}>
                  Quantity: {item.Quantity || 1}
                </Text>
              </View>
              <Text style={styles.itemPrice}>
                Rs.{" "}
                {((item.Price || 0) * (item.Quantity || 1)).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* 💳 BILLING OVERVIEW SUMMARY SECTION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="receipt" size={20} color="#E11D48" />
          <Text style={styles.cardTitle}>Payment Breakdown</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>
            Rs.{" "}
            {(
              checkoutData.OrderTotalPrice ||
              checkoutData.CartItemDtos?.TotalPrice ||
              0
            ).toLocaleString()}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Delivery Charges</Text>
          <Text style={styles.priceValue}>
            Rs. {(checkoutData.DeliveryCharges || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>
            Rs.{" "}
            {(
              checkoutData.OrderTotalAmount ||
              checkoutData.CartItemDtos?.NetTotal ||
              checkoutData.DeliveryCharges ||
              0
            ).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* 🚀 ACTION CALL */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleProceedToPayment}
      >
        <Text style={styles.actionButtonText}>Proceed to Payment</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFF" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#64748B" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  editLink: { color: "#E11D48", fontWeight: "600", fontSize: 14 },
  primaryText: { fontSize: 16, fontWeight: "600", color: "#334155" },
  secondaryText: { fontSize: 14, color: "#64748B", marginTop: 4 },
  emptyItemsText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 12,
  },
  formContainer: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#F8FAFC",
  },
  saveBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  addressDisplay: { paddingVertical: 4 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  itemMeta: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#334155" },
  itemQty: { fontSize: 12, color: "#64748B", marginTop: 4 },
  itemPrice: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: "#64748B" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#334155" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#E11D48" },
  actionButton: {
    backgroundColor: "#E11D48",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 40,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
