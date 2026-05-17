import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Theme";
import { ScreenHeader } from "../../components/ScreenHeader";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native"; // 1. IMPORT THIS

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        // 2. TURN THIS INTO A FUNCTION TO EXTRACT 'route'
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
        tabBarTransparent: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.headerOne[0],
        tabBarInactiveTintColor: Colors.white,
        tabBarActiveBackgroundColor: Colors.white,

        // 3. DYNAMICALLY ALTER VISIBILITY BASED ON INTERNAL NESTED SCREENS
        tabBarStyle: (() => {
          const focusedRoute = getFocusedRouteNameFromRoute(route);

          // If the user dives into detail views, hide the bar completely
          if (focusedRoute === "product-details") {
            return { display: "none" };
          }
          return {
            backgroundColor: Colors.headerOne[0],
            height: 70,
            position: "absolute",
            bottom: 10,
            marginLeft: 10,
            marginRight: 10,
            borderRadius: 50,
            borderTopWidth: 0,
            paddingHorizontal: "2%",
          };
        })(),

        tabBarItemStyle: {
          borderRadius: 50,
          overflow: "hidden",
          marginHorizontal: "auto",
          marginVertical: 5,
          height: 60,
        },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: "Saved",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="category" options={{ href: null }} />
      <Tabs.Screen
        name="refNull/all-reviews"
        options={{ title: "Reviews", href: null }}
      />
      <Tabs.Screen
        name="refNull/settings"
        options={{ title: "Settings", href: null }}
      />
    </Tabs>
  );
}
