import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { cartApi, CartResponse } from "@/features/cart/services/cartApi";
import { useAuth } from "./AuthContext";
import { useRouter } from "expo-router";
const GUEST_SESSION_KEY = "guest_cart_session_id";

interface CartContextType {
  cartData: any | null;
  cartCount: number;
  loading: boolean;
  serverError: boolean;
  refreshing: boolean;
  processingIds: Set<number>;
  cartMessage: string | null;
  deleteLoading: {
    active: boolean;
    cartId: number | null;
  };
  setCartMessage: (msg: string | null) => void;
  fetchCart: () => Promise<void>;
  addItemToCart: (
    productId: number,
    productDetailId: number,
    quantity: number,
  ) => Promise<boolean>;
  updateCartItemQuantity: (cartId: number, quantity: number) => Promise<void>;
  removeCartItem: (cartId: number) => Promise<void>;
  executeCheckout: (attachments?: string[]) => Promise<any>;
  isAuthenticated: boolean;
  isCartBannerDismissed: boolean;
  showCartBanner: boolean;
  dismissCartBanner: () => Promise<void>;
  markCartAsVisited: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Extract both authenticated state and a settled flag from AuthContext
  // If your AuthContext doesn't have isAuthSettled, we add a fallback check below
  const { isAuthenticated, isAuthSettled } = useAuth() as any;
  const router = useRouter();
  const [cartData, setCartData] = useState<CartResponse["Data"] | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // 🌟 Pass the exact object shape directly into the useState generic wrapper
  const [deleteLoading, setDeleteLoading] = useState<{
    active: boolean;
    cartId: number | null;
  }>({
    active: false,
    cartId: null, // Clean initialization without nasty inline type castings
  });

  // const setActionLoading = (key: keyof LoadingState, value: boolean) => {
  //   setLoading((prev) => ({ ...prev, [key]: value }));
  // };
  // 1. Initialize or load the tracking tracking session keys safely
  useEffect(() => {
    const initializeSessionId = async () => {
      try {
        let storedId = await SecureStore.getItemAsync(GUEST_SESSION_KEY);
        if (!storedId) {
          storedId = `guest_${Crypto.randomUUID()}`;
          await SecureStore.setItemAsync(GUEST_SESSION_KEY, storedId);
        }
        setGuestSessionId(storedId);
      } catch (err) {
        console.log("Failed to establish device tracking keys:", err);
        setCartMessage("You are not Eligible! Please Reload.");
      } finally {
        setIsSessionReady(true);
        setTimeout(() => setCartMessage(null), 2000);
      }
    };
    initializeSessionId();
  }, []);

  console.log(`fuck you : ${guestSessionId}`);

  const [isCartBannerDismissed, setIsCartBannerDismissed] =
    useState<boolean>(false);

  // 1. Load the user's manual dismissal preference on bootup sequence
  useEffect(() => {
    async function loadBannerState() {
      try {
        const state = await SecureStore.getItemAsync("CART_BANNER_DISMISSED");
        setIsCartBannerDismissed(state === "true");
      } catch (e) {
        console.log("Failed to read cart banner metrics:", e);
      }
    }
    loadBannerState();
  }, []);

  // 2. Banner business rule: Show if items exist AND user hasn't explicitly hit 'X'
  const showCartBanner =
    cartData?.CartItemList?.length > 0 && !isCartBannerDismissed;

  // Call this when user adds an item to cart
  const triggerBannerOnNewAddition = async () => {
    setIsCartBannerDismissed(false);
    await SecureStore.setItemAsync("CART_BANNER_DISMISSED", "false");
  };

  // User manually closes the banner via the close button
  const dismissCartBanner = async () => {
    setIsCartBannerDismissed(true);
    await SecureStore.setItemAsync("CART_BANNER_DISMISSED", "true");
  };

  // Automatically clears banner permanently when they land on the actual Cart Screen
  const markCartAsVisited = async () => {
    setIsCartBannerDismissed(true);
    await SecureStore.setItemAsync("CART_BANNER_DISMISSED", "true");
  };

  // 2. Fetch cart contents with conditional gates
  const fetchCart = useCallback(
    async (isRefreshing = false) => {
      // 🛑 GATE 1: Wait until Auth state is resolved from SecureStore
      if (isAuthSettled === false) return;

      // 🛑 GATE 2: Wait until guest tracking keys are fully loaded from storage
      if (!isSessionReady) return;
      if (isRefreshing) setRefreshing(true);
      else setLoading(true);

      try {
        let response: CartResponse;
        if (isAuthenticated) {
          response = await cartApi.getCart();
          // response = await cartApi.getCartGuest(guestSessionId);
        } else if (guestSessionId) {
          response = await cartApi.getCartGuest(guestSessionId);
        } else {
          return;
        }

        if (response?.Data) {
          setCartData(response.Data);
          const count =
            response.Data.CartItemList?.reduce(
              (sum, item) => sum + (item.Quantity || 0),
              0,
            ) || 0;
          console.log("count is :", count);
          setCartCount(count);
        } else {
          // Fallback clear reset rules if backend data arrives clean empty
          setCartData(null);
          setCartCount(0);
        }
      } catch (error: any) {
        console.log("fetchCart error:", error);
        setServerError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAuthenticated, isAuthSettled, guestSessionId, isSessionReady],
  );

  // Handle immediate auto-fetch execution gates securely
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // 3. Mutation: Add items to cart
  const addItemToCart = useCallback(
    async (
      productId: number,
      productDetailId: number,
      quantity: number,
    ): Promise<boolean> => {
      if (!isSessionReady || !guestSessionId) return false;

      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.add(productDetailId);
        return next;
      });

      try {
        let result;
        if (isAuthenticated) {
          result = await cartApi.addToCart(
            productId,
            productDetailId,
            quantity,
            guestSessionId,
          );
        } else {
          result = await cartApi.addToCartGuest(
            guestSessionId,
            productId,
            productDetailId,
            quantity,
          );
        }

        if (result?.HttpStatusCode === 200 || result?.Data) {
          await fetchCart();
          await triggerBannerOnNewAddition();
          return true;
        }
        return false;
      } catch (error: any) {
        console.log("Add to cart error:", error);
        setCartMessage(
          error?.Message || "Unable to update cart allocation values.",
        );
        return false;
      } finally {
        setTimeout(() => setCartMessage(null), 2000);
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(productDetailId);
          return next;
        });
      }
    },
    [isAuthenticated, guestSessionId, isSessionReady, fetchCart],
  );

  const updateCartItemQuantity = useCallback(
    async (cartId: number, quantity: number) => {
      if (quantity < 1) return;

      setCartData((prev) => {
        if (!prev) return null;
        const updatedList = prev.CartItemList.map((item: any) =>
          item.CartId === cartId
            ? {
                ...item,
                Quantity: quantity,
                TotalAmount: item.Price * quantity,
              }
            : item,
        );
        const newTotal = updatedList.reduce(
          (sum: number, i: any) => sum + i.TotalAmount,
          0,
        );
        return {
          ...prev,
          CartItemList: updatedList,
          NetTotal: newTotal,
          TotalPrice: newTotal,
        };
      });

      try {
        await cartApi.updateQuantity(cartId, quantity);
      } catch (error) {
        console.log("Failed to sync structural quantity updates:", error);
        setCartMessage(
          error?.Message || "There is something wrong! Check your connection.",
        );
        fetchCart();
      } finally {
        setTimeout(() => setCartMessage(null), 2000);
      }
    },
    [fetchCart],
  );
  const removeCartItem = useCallback(
    async (cartId: number) => {
      // 🌟 1. Store the exact item ID currently being deleted
      setDeleteLoading({ active: true, cartId: cartId });

      try {
        const response = await cartApi.deleteItem(cartId);
        console.log("Delete item response:", response);

        if (!response?.Data) {
          setCartMessage("There is something wrong! Check your connection.");
          return;
        }

        // Update global count tracking cleanly
        setCartCount(response.Data.CartCount);

        setCartData((prevItems) => {
          if (!prevItems) return prevItems;

          const currentItems = prevItems?.CartItemList || [];
          // Filter out the deleted item
          const updatedList = currentItems.filter(
            (item: any) => item.CartId !== cartId,
          );

          // 🔥 FIX: Recalculate totals dynamically so pricing summary updates immediately!
          const newTotal = updatedList.reduce(
            (sum: number, i: any) => sum + (i.TotalAmount || 0),
            0,
          );

          return {
            ...prevItems,
            CartItemList: updatedList,
            NetTotal: newTotal,
            TotalPrice: newTotal,
          };
        });
      } catch (error) {
        console.log("Cart deletion routine exception:", error);
        setCartMessage("There is something wrong! Check your connection.");
      } finally {
        // 🌟 3. Clear the explicit loading ID state by passing null
        setDeleteLoading({ active: false, cartId: null });
        setTimeout(() => setCartMessage(null), 2000);
      }
    },
    [setCartData, setCartCount],
  );
  // const removeCartItem = useCallback(
  //   async (cartId: number) => {
  //     // 🌟 1. Store the exact item ID currently being deleted
  //     setDeleteLoading({ active: true, cartId: cartId });

  //     try {
  //       const response = await cartApi.deleteItem(cartId);
  //       console.log("Delete item response:", response);

  //       if (!response?.Data) {
  //         setCartMessage("There is something wrong! Check your connection.");
  //         return;
  //       }

  //       // Update global count tracking cleanly
  //       setCartCount(response.Data.CartCount);
  //       setCartData((prevItems) => {
  //         if (!prevItems) return prevItems;

  //         // If your array key is named differently (e.g., Data or items), swap 'CartItems' with that key name
  //         const currentItems = prevItems?.CartItemList || [];

  //         return {
  //           ...prevItems,
  //           CartItemList: currentItems.filter(
  //             (item: any) => item.CartId !== cartId,
  //           ),
  //         };
  //       });
  //     } catch (error) {
  //       console.log("Cart deletion routine exception:", error);
  //       setCartMessage("There is something wrong! Check your connection.");
  //     } finally {
  //       // 🌟 3. Clear the explicit loading ID state by passing null
  //       setDeleteLoading({ active: false, cartId: null });
  //       setTimeout(() => setCartMessage(null), 2000);
  //     }
  //   },
  //   [setCartData, setCartCount], // Removed fetchCart dependency entirely
  // );

  const executeCheckout = useCallback(
    async (attachments: string[] = []) => {
      try {
        let checkoutResult;
        if (isAuthenticated) {
          checkoutResult = await cartApi.checkout(attachments);
        } else if (guestSessionId) {
          checkoutResult = await cartApi.checkoutGuest(
            guestSessionId,
            attachments,
          );
        } else {
          setCartMessage(
            "You are not Eligible! No tracking authentication signature",
          );
        }
        return checkoutResult;
      } catch (error: any) {
        console.log("Checkout execution exception:", error);
        setCartMessage(
          error?.Message || "Something went wrong processing your order.",
        );
      } finally {
        setTimeout(() => setCartMessage(null), 2000);
      }
    },
    [isAuthenticated, guestSessionId],
  );

  const value = useMemo(
    () => ({
      cartData,
      cartCount,
      loading,
      processingIds,
      cartMessage,
      fetchCart,
      addItemToCart,
      isAuthenticated,
      updateCartItemQuantity,
      executeCheckout,
      removeCartItem,
      guestSessionId,
      serverError,
      showCartBanner,
      isCartBannerDismissed,
      dismissCartBanner,
      markCartAsVisited,
      deleteLoading,
      refreshing,
    }),
    [
      cartData,
      cartCount,
      loading,
      processingIds,
      cartMessage,
      fetchCart,
      addItemToCart,
      isAuthenticated,
      updateCartItemQuantity,
      executeCheckout,
      removeCartItem,
      guestSessionId,
      serverError,
      showCartBanner,
      isCartBannerDismissed,
      dismissCartBanner,
      markCartAsVisited,
      deleteLoading,
      refreshing,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useSharedCartData = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error(
      "useSharedCartData must be wrapped within a CartProvider frame layer.",
    );
  return context;
};
