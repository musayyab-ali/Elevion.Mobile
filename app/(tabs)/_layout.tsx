import { Tabs, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Theme";
import { ScreenHeader } from "../../components/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useWindowDimensions,
  ViewStyle,
  View,
  Text,
  StyleSheet,
} from "react-native";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const strictTabBarStyle: ViewStyle = {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    height: 64 + insets.bottom, // Optimized clearance padding height
    paddingBottom: insets.bottom > 0 ? insets.bottom + 2 : 8,
    paddingTop: 10,
    position: "relative",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 8,
    display: "flex",
  };

  const renderPremiumIcon = (
    focused: boolean,
    activeIcon: keyof typeof Ionicons.glyphMap,
    inactiveIcon: keyof typeof Ionicons.glyphMap,
  ) => (
    <View style={[styles.iconWrapper]}>
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={isTablet ? 24 : 22}
        color={focused ? Colors.accent : "#94A3B8"}
      />
    </View>
  );
  const renderPremiumLabel = (focused: boolean, label: string) => (
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit={false}
      style={[
        styles.tabLabel,
        { fontSize: isTablet ? 12 : 11 },
        focused ? styles.labelActive : styles.labelInactive,
      ]}
    >
      {label}
    </Text>
  );

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        header: ({ options, route: headerRoute }) => {
          const bypassHeaders = "index";
          if (bypassHeaders.includes(headerRoute.name)) {
            return null;
          }

          return <ScreenHeader title={options.title || headerRoute.name} />;
        },
        tabBarTransparent: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#0F172A",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarActiveBackgroundColor: "transparent",
        tabBarStyle: strictTabBarStyle,
        tabBarShowLabel: true,

        tabBarItemStyle: {
          height: 54,
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
        },
        tabBarLabelStyle: {
          marginTop: 4, // Clean vertical rhythm baseline
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
          tabBarIcon: ({ focused }) =>
            renderPremiumIcon(focused, "home-sharp", "home-outline"),
          tabBarLabel: ({ focused }) => renderPremiumLabel(focused, "Home"),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Saved",
          tabBarIcon: ({ focused }) =>
            renderPremiumIcon(focused, "heart-sharp", "heart-outline"),
          tabBarLabel: ({ focused }) => renderPremiumLabel(focused, "Saved"),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) =>
            renderPremiumIcon(focused, "receipt-sharp", "receipt-outline"),
          tabBarLabel: ({ focused }) => renderPremiumLabel(focused, "Orders"),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) =>
            renderPremiumIcon(focused, "person-sharp", "person-outline"),
          tabBarLabel: ({ focused }) => renderPremiumLabel(focused, "Profile"),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderRadius: 14,
    height: 32, // explicit spatial limits to prevent squeezing
  },

  tabLabel: {
    letterSpacing: -0.2,
    textAlign: "center",
    includeFontPadding: false, // Disables unexpected Android line padding
  },
  labelActive: {
    color: "#0F172A",
    fontWeight: "800",
  },
  labelInactive: {
    color: "#94A3B8",
    fontWeight: "600",
  },
});
