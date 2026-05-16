// import React, { useRef, useState, useEffect } from "react";
// import {
//   View,
//   FlatList,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import { LinearGradient } from "expo-linear-gradient";
// import { Colors } from "../../../constants/Theme";

// const { width } = Dimensions.get("window");

// export const FeaturedBanner = ({
//   data,
//   onPress,
// }: {
//   data: any[];
//   onPress: (item: any) => void;
// }) => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const flatListRef = useRef<FlatList>(null);

//     useEffect(() => {
//       if (data.length <= 1) return;

//       const interval = setInterval(() => {
//         let nextIndex = activeIndex + 1;
//         if (nextIndex >= data.length) nextIndex = 0;

//         flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
//         setActiveIndex(nextIndex);
//       }, 3000);

//       return () => clearInterval(interval);
//     }, [activeIndex, data.length]);

//   const renderItem = ({ item }: { item: any }) => {
//     // Handle both Product Name and Category Name
//     const title = item.ProductName || item.Name;
//     const image = item.ThumbnailImagePath || item.ImagePath;

//     return (
//       <TouchableOpacity style={styles.bannerCard} onPress={() => onPress(item)}>
//         <Image source={{ uri: image }} style={styles.bannerImage} />
//         <LinearGradient
//           colors={["transparent", "rgba(0,0,0,0.8)"]}
//           style={styles.bannerGradient}
//         >
//           <Text style={styles.bannerText} numberOfLines={2}>
//             {title}
//           </Text>
//         </LinearGradient>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <View style={styles.featuredWrapper}>
//       <FlatList
//         ref={flatListRef}
//         data={data}
//         renderItem={renderItem}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item) =>
//           (item.ProductId || item.CategoryId || Math.random()).toString()
//         }
//         onMomentumScrollEnd={(e) => {
//           const index = Math.round(e.nativeEvent.contentOffset.x / width);
//           setActiveIndex(index);
//         }}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   featuredWrapper: {
//     paddingVertical: 20,
//     backgroundColor: Colors.headerOne[0],
//     borderBottomRightRadius: 30,
//     borderBottomLeftRadius: 30,
//   },
//   bannerCard: { width: width, paddingHorizontal: 20, height: 160 },
//   bannerImage: {
//     width: "100%",
//     height: "100%",
//     borderRadius: 20,
//     resizeMode: "cover",
//   },
//   bannerGradient: {
//     ...StyleSheet.absoluteFillObject,
//     marginHorizontal: 20,
//     borderRadius: 20,
//     justifyContent: "flex-end",
//     padding: 15,
//   },
//   bannerText: { color: Colors.white, fontSize: 18, fontWeight: "800" },
// });

import React, { useRef, useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../../constants/Theme";

const { width } = Dimensions.get("window");

interface FeaturedBannerProps {
  data: any[];
  onPress: (item: any) => void;
  variant?: "home" | "minimal"; // Control UI layout based on current route
}

export const FeaturedBanner = ({
  data,
  onPress,
  variant = "home",
}: FeaturedBannerProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isMinimal = variant === "minimal";

  // useEffect(() => {
  //   if (data.length <= 1) return;

  //   const interval = setInterval(() => {
  //     let nextIndex = activeIndex + 1;
  //     if (nextIndex >= data.length) nextIndex = 0;

  //     flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  //     setActiveIndex(nextIndex);
  //   }, 3000);

  //   return () => clearInterval(interval);
  // }, [activeIndex, data.length]);

  const renderItem = ({ item }: { item: any }) => {
    const title = item.ProductName || item.Name;
    const image = item.ThumbnailImagePath || item.ImagePath;

    return (
      <TouchableOpacity
        style={[styles.bannerCard, isMinimal && styles.minimalCard]}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: image }}
          style={[styles.bannerImage, isMinimal && styles.minimalImage]}
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={[styles.bannerGradient, isMinimal && styles.minimalGradient]}
        >
          <Text style={styles.bannerText} numberOfLines={2}>
            {title}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.featuredWrapper, isMinimal && styles.minimalWrapper]}>
      {isMinimal && <Text style={styles.minimalHeading}>New Products</Text>}
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) =>
          (item.ProductId || item.CategoryId || Math.random()).toString()
        }
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  featuredWrapper: {
    paddingVertical: 20,
    backgroundColor: Colors.headerOne[0],
    borderBottomRightRadius: 30,
    borderBottomLeftRadius: 30,
  },
  minimalWrapper: {
    backgroundColor: "transparent",
    paddingVertical: 10,
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
  },
  minimalHeading: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  bannerCard: { width: width, paddingHorizontal: 20, height: 160 },
  minimalCard: {
    paddingHorizontal: 16,
    height: 180,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
    resizeMode: "cover",
  },
  minimalImage: {
    borderRadius: 14, // Flat, professional look
  },
  bannerGradient: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 20,
    borderRadius: 20,
    justifyContent: "flex-end",
    padding: 15,
  },
  minimalGradient: {
    marginHorizontal: 16,
    borderRadius: 14,
  },
  bannerText: { color: Colors.white, fontSize: 16, fontWeight: "800" },
});
