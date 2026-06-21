import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { MotiView } from "moti";
import { Skeleton } from "moti/skeleton";

export const CategorySkeletonHorizontal = () => {
  // Generate a standard horizontal row of 5 layout elements
  const skeletonItems = Array.from({ length: 5 });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {skeletonItems.map((_, index) => (
        <MotiView
          key={`cat-skel-${index}`}
          from={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
            repeatReverse: true,
          }}
          style={styles.cardContainer}
        >
          {/* Circular Frame Outer Ring Shadow Replication */}
          <View style={styles.circleOuterRing}>
            <Skeleton colorMode="light" radius="round" width={74} height={74} />
          </View>
          {/* Double text line simulation heights */}
          <View style={styles.textTrack}>
            <Skeleton colorMode="light" width={60} height={10} radius={4} />
          </View>
        </MotiView>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cardContainer: {
    alignItems: "center",
    width: 80,
    marginHorizontal: 8,
  },
  circleOuterRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  textTrack: {
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    width: "100%",
  },
});
