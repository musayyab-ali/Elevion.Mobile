import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import * as Crypto from "expo-crypto"; // Or any fallback UUID generator/SecureStore configuration
import { cartApi, CartResponse } from "@/features/cart/services/cartApi";
import { useAuth } from "./AuthContext";
interface CartContextType {
  cartData: any | null;
  cartCount: number;
  loading: boolean;
  processingIds: Set<number>;
  apiMessage: string | null;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{
  children: React.ReactNode;
  // userToken?: string | null;
}> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartData, setCartData] = useState<CartResponse["Data"] | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  // const isAuthenticated = useMemo(() => !!userToken, [userToken]);
  console.log("CartContext initialization - Authenticated:", isAuthenticated);
  // Lazy initialize or generate a persistent Guest Session Id tracking signature string
  useEffect(() => {
    if (!isAuthenticated && !guestSessionId) {
      setGuestSessionId(`guest_${Crypto.randomUUID()}`);
    }
  }, [isAuthenticated, guestSessionId]);

  // Master fetching orchestration routing system
  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      let response: CartResponse;
      if (isAuthenticated) {
        response = await cartApi.getCart();
        // console.log("API Response for Get Cart Context:", response.Data);
      } else if (guestSessionId) {
        response = await cartApi.getCartGuest(guestSessionId);
        // console.log(
        //   "API Response for Get Cart session Context:",
        //   response.Data,
        // );
      } else {
        return;
      }

      if (response?.Data) {
        setCartData(response.Data);
        // Calculate item list length fallback if backend doesn't aggregate explicit structural flags
        const count =
          response.Data.CartItemList?.reduce(
            (sum, item) => sum + (item.Quantity || 0),
            0,
          ) || 0;
        setCartCount(count);
      }
    } catch (error: any) {
      console.error("Cart Hydration Runtime Interruption:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, guestSessionId]);

  // Triggers immediate fetch invocation context parameters on mount or auth identity transformation
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Unified execution block managing pipeline states safely with error parsing bounds
  const addItemToCart = useCallback(
    async (
      productId: number,
      productDetailId: number,
      quantity: number,
    ): Promise<boolean> => {
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
          );
        } else if (guestSessionId) {
          result = await cartApi.addToCartGuest(
            guestSessionId,
            productId,
            productDetailId,
            quantity,
          );
        } else {
          throw new Error(
            "No secure validation context or guest tracing identifier available.",
          );
        }

        if (result?.HttpStatusCode === 200 || result?.Data) {
          setCartCount(result.Data.CartCount);
          await fetchCart(); // Re-sync entire structural array state mapping summary details smoothly
          setApiMessage("Item appended successfully to your shopping bag.");
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Add to Bag Core Processing Exception Exception:", error);
        const errorMsg =
          error?.Message || "Unable to update cart allocation values.";
        setApiMessage(errorMsg);
        return false;
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev);
          next.delete(productDetailId);
          return next;
        });
        setTimeout(() => setApiMessage(null), 4000);
      }
    },
    [isAuthenticated, guestSessionId, fetchCart],
  );

  const updateCartItemQuantity = useCallback(
    async (cartId: number, quantity: number) => {
      if (quantity < 1) return;

      // Optimistic UI updates to keep interactions incredibly fast
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
          (sum: number, item: any) => sum + item.TotalAmount,
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
        console.error("Failed to sync structural quantity updates:", error);
        fetchCart(); // Rollback if API fails
      }
    },
    [fetchCart],
  );

  const removeCartItem = useCallback(
    async (cartId: number) => {
      // Optimistic item removal
      setCartData((prev) => {
        if (!prev) return null;
        const filteredList = prev.CartItemList.filter(
          (item: any) => item.CartId !== cartId,
        );
        const newTotal = filteredList.reduce(
          (sum: number, item: any) => sum + (item.TotalAmount || 0),
          0,
        );
        return {
          ...prev,
          CartItemList: filteredList,
          NetTotal: newTotal,
          TotalPrice: newTotal,
        };
      });

      try {
        const response = await cartApi.deleteItem(cartId);
        if (response?.Data) {
          setCartCount(response.Data.CartCount);
        }
      } catch (error) {
        console.error("Cart deletion routine exception:", error);
        fetchCart(); // Rollback sequence
      }
    },
    [fetchCart],
  );

  // const executeCheckout = useCallback(
  //   async (attachments: string[] = []) => {
  //     setLoading(true);
  //     try {
  //       let checkoutResult;
  //       if (isAuthenticated) {
  //         checkoutResult = await cartApi.checkout(attachments);
  //       } else if (guestSessionId) {
  //         checkoutResult = await cartApi.checkoutGuest(
  //           guestSessionId,
  //           attachments,
  //         );
  //       } else {
  //         throw new Error(
  //           "No tracking authentication signature context established.",
  //         );
  //       }

  //       // Clean up internal states upon successful order placement
  //       setCartData(null);
  //       setCartCount(0);
  //       return checkoutResult;
  //     } catch (error: any) {
  //       console.error("Checkout execution exception:", error);
  //       setApiMessage(error?.Message || "Checkout validation failure.");
  //       throw error;
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [isAuthenticated, guestSessionId],
  // );
  const executeCheckout = useCallback(
    async (attachments: string[] = []) => {
      setLoading(true);
      try {
        let checkoutResult;
        if (isAuthenticated) {
          console.log(
            "Executing authenticated checkout with attachments:",
            attachments,
          );
          checkoutResult = await cartApi.checkout(attachments);
        } else if (guestSessionId) {
          console.log(
            "Executing guest checkout with attachments:",
            attachments,
          );
          checkoutResult = await cartApi.checkoutGuest(
            guestSessionId,
            attachments,
          );
        } else {
          throw new Error(
            "No tracking authentication signature context established.",
          );
        }

        // ✅ FIX: Do NOT clear cart data here. The user is only REVIEWING the checkout summary right now!
        console.log("Checkout result:", checkoutResult);
        return checkoutResult;
      } catch (error: any) {
        console.error("Checkout execution exception:", error);
        setApiMessage(error?.Message || "Checkout validation failure.");
        throw error;
      } finally {
        setLoading(false);
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
      apiMessage,
      fetchCart,
      addItemToCart,
      isAuthenticated,
      updateCartItemQuantity,
      executeCheckout,
      removeCartItem,
    }),
    [
      cartData,
      cartCount,
      loading,
      processingIds,
      apiMessage,
      fetchCart,
      addItemToCart,
      isAuthenticated,
      updateCartItemQuantity,
      executeCheckout,
      removeCartItem,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useSharedCartData = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      "useSharedCartData must balance explicitly wrapped execution within a CartProvider frame layer.",
    );
  }
  return context;
};
