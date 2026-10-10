import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Theme";
import ProductCard from "../../shop/components/ProductCard";
import { useWishlist } from "../../wishlist/hooks/useWishlist";
import { useAuth } from "@/store/AuthContext";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { readCache, writeCache, isOfflineError } from "../../../services/cache/offlineCache";
import type { Product } from "../../shop/types/shopTypes";
import { SEARCH_LIMIT, searchProducts } from "../services/searchApi";
import { DEFAULT_REFINEMENT, SORT_OPTIONS, pushRecentSearch, refineProducts, type Refinement } from "../utils/searchRefine";

const RECENT_KEY = "recent-searches";
const DEBOUNCE_MS = 350;

export const SearchScreen = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refinement, setRefinement] = useState<Refinement>(DEFAULT_REFINEMENT);
  const [recent, setRecent] = useState<string[]>([]);
  const [guardVisible, setGuardVisible] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    readCache<string[]>(RECENT_KEY).then((saved) => saved && setRecent(saved.data));
  }, []);

  // Wait for a pause in typing before asking the server.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);

  useEffect(() => {
    if (query.length < 2) {
      requestId.current += 1; // drop any answer still on its way
      setProducts([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }

    const id = ++requestId.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    searchProducts(query, controller.signal)
      .then((result) => {
        if (id !== requestId.current) return; // an older keystroke's answer must not replace a newer one
        setProducts(result.products);
        setTotal(result.total);
      })
      .catch((e) => {
        if (id !== requestId.current || e?.code === "ERR_CANCELED") return;
        setError(
          isOfflineError(e)
            ? "Unable to connect. Please check your internet and try again."
            : e?.response?.data?.Message ?? "Search failed. Please try again.",
        );
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });

    return () => controller.abort();
  }, [query]);

  const rememberSearch = useCallback(
    (value: string) => {
      const next = pushRecentSearch(recent, value);
      if (next !== recent) {
        setRecent(next);
        void writeCache(RECENT_KEY, next);
      }
    },
    [recent],
  );

  const submit = () => {
    Keyboard.dismiss();
    const value = text.trim();
    setQuery(value);
    if (products.length > 0 || value.length >= 2) rememberSearch(value);
  };

  const pick = (value: string) => {
    setText(value);
    setQuery(value);
    Keyboard.dismiss();
  };

  const clearRecent = () => {
    setRecent([]);
    void writeCache(RECENT_KEY, []);
  };

  const visible = useMemo(() => refineProducts(products, refinement, query), [products, refinement, query]);
  const searching = query.length >= 2;

  const header = (
    <View>
      <View style={styles.chips}>
        {SORT_OPTIONS.map((option) => {
          const active = refinement.sort === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setRefinement((r) => ({ ...r, sort: option.key }))}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.stockRow}>
        <Text style={styles.stockLabel}>In stock only</Text>
        <Switch
          value={refinement.inStockOnly}
          onValueChange={(value) => setRefinement((r) => ({ ...r, inStockOnly: value }))}
          trackColor={{ true: Colors.primary }}
          accessibilityLabel="In stock only"
        />
      </View>
      <Text style={styles.count} accessibilityLiveRegion="polite">
        {visible.length} {visible.length === 1 ? "result" : "results"}
        {total > SEARCH_LIMIT ? ` (first ${SEARCH_LIMIT} of ${total} matches, add more words to narrow down)` : ""}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.tertiary} />
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Search products"
          placeholderTextColor={Colors.tertiary}
          returnKeyType="search"
          onSubmitEditing={submit}
          autoFocus
          autoCorrect={false}
          accessibilityLabel="Search products"
        />
        {text.length > 0 && (
          <TouchableOpacity onPress={() => setText("")} accessibilityLabel="Clear search" hitSlop={10}>
            <Ionicons name="close-circle" size={20} color={Colors.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {!searching ? (
        <View style={styles.recentBox}>
          {recent.length > 0 ? (
            <>
              <View style={styles.recentHead}>
                <Text style={styles.recentTitle}>Recent searches</Text>
                <TouchableOpacity onPress={clearRecent} accessibilityRole="button">
                  <Text style={styles.link}>Clear</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chips}>
                {recent.map((item) => (
                  <TouchableOpacity key={item} style={styles.chip} onPress={() => pick(item)}>
                    <Ionicons name="time-outline" size={13} color={Colors.tertiary} />
                    <Text style={styles.chipText}> {item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.hint}>Type at least 2 letters to search products by name.</Text>
          )}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setQuery((q) => q + " ")} accessibilityRole="button">
            <Text style={styles.link}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : loading && products.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => `search-${item.ProductId}`}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={header}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={44} color={Colors.tertiary} />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.hint}>
                {refinement.inStockOnly ? "Try turning off \"In stock only\"." : "Check the spelling or try a different word."}
              </Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <View style={styles.cell}>
              <ProductCard
                product={item}
                index={index}
                isWishlisted={wishlistMap.has(item.ProductId)}
                isProcessing={isProcessing(item.ProductId)}
                onWishlistToggle={() => {
                  if (!isAuthenticated) {
                    setGuardVisible(true);
                    return;
                  }
                  toggleWishlist(item.ProductId, item.ProductDetailId ?? 0, item);
                }}
                onPress={() => {
                  rememberSearch(query);
                  router.navigate({ pathname: "/(product)/product-details", params: { productId: item.ProductId } });
                }}
              />
            </View>
          )}
        />
      )}

      <AuthGuardModal
        visible={guardVisible}
        onClose={() => setGuardVisible(false)}
        title="Account Required"
        subtitle="Create an account to securely save items to your wishlist across all your devices."
        iconName="heart"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.white },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 16,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },
  input: { flex: 1, fontSize: 15, color: Colors.textMain },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  cell: { marginBottom: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: Colors.white,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12.5, color: Colors.textMain, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  stockRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  stockLabel: { fontSize: 13.5, color: Colors.textMain, fontWeight: "600" },
  count: { fontSize: 12.5, color: Colors.tertiary, marginTop: 4, marginBottom: 14 },
  recentBox: { paddingHorizontal: 16 },
  recentHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  recentTitle: { fontSize: 14, fontWeight: "700", color: Colors.textMain },
  link: { color: Colors.accent, fontWeight: "700", fontSize: 13 },
  hint: { color: Colors.tertiary, fontSize: 13, textAlign: "center", marginTop: 6 },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 24, gap: 8 },
  errorText: { color: Colors.error, textAlign: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
});
