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
  refreshing: boolean;
  serverError: boolean;
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
  const { isAuthenticated } = useAuth();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [wishMessage, setWishMessage] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [serverError, setServerError] = useState<boolean>(false);

  const fetchWishlist = useCallback(
    async (isRefresh = false) => {
      if (!isAuthenticated) {
        setItems([]);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setServerError(false);

      try {
        const result = await wishlistApi.getWishlist(20, 1);
        setItems(result?.Data?.WishItemList ?? []);
      } catch (error) {
        console.log("Wishlist Fetch Core Exception:", error);
        setServerError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated],
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated, fetchWishlist]);

  const value = useMemo(
    () => ({
      items,
      setItems,
      loading,
      refreshing,
      wishMessage,
      setWishMessage,
      processingIds,
      setProcessingIds,
      fetchWishlist,
      serverError,
    }),
    [
      items,
      loading,
      refreshing,
      wishMessage,
      processingIds,
      fetchWishlist,
      serverError,
    ],
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
