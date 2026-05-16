// import { Tabs } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "../../constants/Theme";
// import { Platform, View } from "react-native";
// import { ScreenHeader } from "../../components/ScreenHeader";

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         // 1. Force the header to be visible globally
//         headerShown: true,

//         // 2. Define the header component
//         header: ({ options, route }) => {
//           // Double check: We only hide it for the landing 'index'
//           if (
//             route.name === "index" ||
//             route.name === "category/[id]" ||
//             route.name === "refNull/all-reviews" ||
//             route.name === "refNull/settings"
//           )
//             return null;

//           return (
//             <ScreenHeader
//               title={options.title || route.name}
//               showBackButton={false}
//             />
//           );
//         },

//         // 3. Tab Bar Styling (Floating & Transparent)
//         tabBarTransparent: true,
//         tabBarHideOnKeyboard: true,
//         tabBarActiveTintColor: Colors.headerOne[0],
//         tabBarInactiveTintColor: Colors.white,
//         tabBarActiveBackgroundColor: Colors.white,

//         tabBarStyle: {
//           backgroundColor: Colors.headerOne[0],
//           height: 70,
//           position: "absolute",
//           bottom: 10,
//           marginLeft: 10,
//           marginRight: 10,
//           borderRadius: 50,
//           borderTopWidth: 0,
//           paddingHorizontal: "2%",
//         },
//         tabBarItemStyle: {
//           borderRadius: 50,
//           overflow: "hidden",
//           marginHorizontal: "auto",
//           // marginVertical: "auto",
//           marginVertical: 5,
//           height: 60,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           headerShown: false, // Explicitly hide header here
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="home" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="wishlist"
//         options={{
//           title: "Saved",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="heart" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="person" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="orders"
//         options={{
//           title: "Orders",
//           tabBarIcon: ({ color }) => (
//             <Ionicons name="receipt" size={24} color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen name="category/[id]" options={{ href: null }} />
//       <Tabs.Screen name="category/products" options={{ href: null }} />
//       <Tabs.Screen name="category/product-details" options={{ href: null }} />
//       <Tabs.Screen
//         name="refNull/all-reviews"
//         options={{ title: "Reviews", href: null }}
//       />
//       <Tabs.Screen
//         name="refNull/settings"
//         options={{ title: "Settings", href: null }}
//       />
//     </Tabs>
//   );
// }

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Theme";
import { ScreenHeader } from "../../components/ScreenHeader";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: ({ options, route }) => {
          // Cleaned up: Hide tab header for home index or category stack flows
          if (route.name === "index" || route.name === "category") {
            return null;
          }

          return (
            <ScreenHeader
              title={options.title || route.name}
              showBackButton={false}
            />
          );
        },
        tabBarTransparent: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: Colors.headerOne[0],
        tabBarInactiveTintColor: Colors.white,
        tabBarActiveBackgroundColor: Colors.white,
        tabBarStyle: {
          backgroundColor: Colors.headerOne[0],
          height: 70,
          position: "absolute",
          bottom: 10,
          marginLeft: 10,
          marginRight: 10,
          borderRadius: 50,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          borderRadius: 50,
          overflow: "hidden",
          marginVertical: 5,
          height: 60,
        },
      }}
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
