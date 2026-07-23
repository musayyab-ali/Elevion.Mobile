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
  // Pagination Extensions
  loadingMore: boolean;
  hasMore: boolean;
  loadMoreWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

const BASE_PAGE_SIZE = 10;

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

  // Pagination Window Metrics
  const [currentSize, setCurrentSize] = useState<number>(BASE_PAGE_SIZE);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const fetchWishlist = useCallback(
    async (isRefresh = false) => {
      if (!isAuthenticated) {
        setItems([]);
        return;
      }

      if (isRefresh) {
        setCurrentSize(BASE_PAGE_SIZE);
        setHasMore(true);
      } else setLoading(true);

      setServerError(false);
      setCurrentSize(BASE_PAGE_SIZE);
      setHasMore(true);

      try {
        const result = await wishlistApi.getWishlist(BASE_PAGE_SIZE, 1);
        const fetchedItems = result?.Data?.WishItemList ?? [];
        setItems(fetchedItems);

        if (fetchedItems.length < BASE_PAGE_SIZE) {
          setHasMore(false);
        }
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

  const loadMoreWishlist = useCallback(async () => {
    if (loadingMore || !hasMore || !isAuthenticated) return;

    setLoadingMore(true);
    const nextSize = currentSize + BASE_PAGE_SIZE;

    try {
      const result = await wishlistApi.getWishlist(nextSize, 1);
      const incomingItems = result?.Data?.WishItemList ?? [];
      if (incomingItems.length < nextSize) {
        setHasMore(false);
      }
      if (incomingItems.length > items.length) {
        setItems(incomingItems);
        setCurrentSize(nextSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log("Wishlist Pagination Window Exception:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [currentSize, hasMore, loadingMore, isAuthenticated, items.length]);

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
      loadingMore,
      hasMore,
      loadMoreWishlist,
    }),
    [
      items,
      loading,
      refreshing,
      wishMessage,
      processingIds,
      fetchWishlist,
      serverError,
      loadingMore,
      hasMore,
      loadMoreWishlist,
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
