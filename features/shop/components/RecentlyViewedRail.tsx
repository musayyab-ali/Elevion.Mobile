import React, { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { HomeProductMiniCard } from "./HomeProductMiniCard";
import { getRecentlyViewed, type RecentProduct } from "../utils/recentlyViewed";

/** "Recently viewed" row for the home screen; reloads each time the screen comes into view and hides itself when empty. */
export const RecentlyViewedRail = () => {
  const router = useRouter();
  const [items, setItems] = useState<RecentProduct[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getRecentlyViewed().then((list) => active && setItems(list));
      return () => {
        active = false;
      };
    }, []),
  );

  if (items.length === 0) return null;

  return (
    <View style={styles.block}>
      <Text style={styles.title}>Recently viewed</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => `recent-${item.ProductId}`}
        contentContainerStyle={styles.track}
        renderItem={({ item }) => (
          <HomeProductMiniCard
            product={item}
            onPress={() =>
              router.push({ pathname: "/(product)/product-details", params: { productId: item.ProductId } })
            }
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  block: { marginTop: 16 },
  title: { fontSize: 17, fontWeight: "800", color: "#0F172A", letterSpacing: -0.3, paddingHorizontal: 16, marginBottom: 10 },
  track: { paddingHorizontal: 14, paddingBottom: 6 },
});
