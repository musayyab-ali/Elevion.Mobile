import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

export const ProductMiniSkeleton = () => {
  const skeletonItems = Array.from({ length: 4 });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {skeletonItems.map((_, index) => (
        <MotiView
          key={`prod-skel-${index}`}
          from={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
          style={styles.cardContainer}
        >
          {/* Match exact 110px image container frame bounds */}
          <View style={styles.imageFrame}>
            <Skeleton colorMode="light" width="100%" height={110} radius={12} />
          </View>

          {/* Metadata Grid blocks for Text Title and Currency Value */}
          <View style={styles.metaFrame}>
            <Skeleton colorMode="light" width="85%" height={12} radius={4} />
            <View style={styles.priceSpacer}>
              <Skeleton colorMode="light" width="50%" height={11} radius={4} />
            </View>
          </View>
        </MotiView>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 14,
    flexDirection: "row",
  },
  cardContainer: {
    width: 135,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageFrame: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  metaFrame: {
    marginTop: 8,
    paddingHorizontal: 2,
    gap: 6,
  },
  priceSpacer: {
    marginTop: 2,
  },
});
