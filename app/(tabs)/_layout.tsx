import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Theme";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // 🌟 For exact traditional padding
import { useWindowDimensions } from "react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        header: ({ options, route: headerRoute }) => {
          if (headerRoute.name === "index" || headerRoute.name === "category") {
            return null;
          }
          return (
            <ScreenHeader
              title={options.title || headerRoute.name}
              showBackButton={false}
            />
          );
        },
        // 🌟 Turned off transparent/floating behaviors for the traditional layout approach
        tabBarTransparent: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.headerOne[0],
        tabBarInactiveTintColor: "#94A3B8", // Clean slate gray for standard inactive state
        tabBarActiveBackgroundColor: "transparent", // Simple traditional highlights

        // 🌟 CLEAN TRADITIONAL FULL-WIDTH STYLE
        tabBarStyle: (() => {
          const focusedRoute = getFocusedRouteNameFromRoute(route);

          if (focusedRoute === "product-details") {
            return { display: "none" };
          }

          return {
            backgroundColor: Colors.white, // Classic solid white or background-matched header bar
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0", // Ultra-subtle border separator line

            // 📐 Height scales traditionally: 56px base + dynamic physical hardware inset notch protection
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 4, // Aligns labels perfectly above home indicators
            paddingTop: 6,

            // Remove floating attributes entirely
            position: "relative",
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            marginHorizontal: 0,
            width: "100%",
          };
        })(),

        tabBarItemStyle: {
          height: 48,
          marginHorizontal: 0,
          marginVertical: 0,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: isTablet ? 13 : 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={isTablet ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={isTablet ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={isTablet ? 26 : 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={isTablet ? 26 : 22} color={color} />
          ),
        }}
      />

      {/* Hidden Utility Routes Configuration */}
      <Tabs.Screen name="category" options={{ href: null }} />
      <Tabs.Screen
        name="cart/checkout-summary"
        options={{ title: "Checkout", href: null }}
      />
      <Tabs.Screen
        name="cart/payment-methods"
        options={{ title: "payment", href: null }}
      />
      <Tabs.Screen
        name="refNull/settings"
        options={{ title: "Settings", href: null }}
      />
      <Tabs.Screen
        name="refNull/all-reviews"
        options={{ title: "All Reviews", href: null }}
      />
    </Tabs>
  );
}
