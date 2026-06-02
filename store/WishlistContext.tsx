import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { wishlistApi } from "../features/wishlist/services/wishlistApi";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  items: any[];
  setItems: React.Dispatch<React.SetStateAction<any[]>>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
  wishMessage: string | null;
  setWishMessage: (msg: string | null) => void;
  processingIds: Set<number>;
  setProcessingIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  fetchWishlist: (isRefresh?: boolean) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Consume live authentication dependencies directly
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [wishMessage, setWishMessage] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

  const fetchWishlist = useCallback(
    async (isRefresh = false) => {
      // 🛑 Hard stop if the explicit user security parameters are missing
      if (!isAuthenticated) {
        console.log("oh god");
        setItems([]);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await wishlistApi.getWishlist(100, 1);
        setItems(result?.Data?.WishItemList ?? []);
      } catch (error) {
        console.log("Wishlist Fetch Core Exception:", error);
        setWishMessage("Failed to retrieve your saved favorites catalog.");
      } finally {
        setTimeout(() => setWishMessage(null), 2000);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  // Dynamic initialization sync: Triggers every single time user auth token state toggles
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setItems([]); // Clear out local collection cache cleanly on user exit
    }
  }, [isAuthenticated, fetchWishlist]);

  const value = useMemo(
    () => ({
      items,
      setItems,
      loading,
      setLoading,
      refreshing,
      setRefreshing,
      wishMessage,
      setWishMessage,
      processingIds,
      setProcessingIds,
      fetchWishlist,
    }),
    [items, loading, refreshing, wishMessage, processingIds, fetchWishlist],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useSharedWishlistData = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error(
      "useSharedWishlistData must be used within a WishlistProvider",
    );
  }
  return context;
};
