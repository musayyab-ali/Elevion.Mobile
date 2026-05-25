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

const GUEST_SESSION_KEY = "guest_cart_session_id";

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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Extract both authenticated state and a settled flag from AuthContext
  // If your AuthContext doesn't have isAuthSettled, we add a fallback check below
  const { isAuthenticated, isAuthSettled } = useAuth() as any;

  const [cartData, setCartData] = useState<CartResponse["Data"] | null>(null);
  const [cartCount, setCartCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);

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
        console.error("Failed to establish device tracking keys:", err);
      } finally {
        setIsSessionReady(true);
      }
    };
    initializeSessionId();
  }, []);

  console.log(`fuck me : ${guestSessionId}`);

  // 2. Fetch cart contents with conditional gates
  const fetchCart = useCallback(async () => {
    // 🛑 GATE 1: Wait until Auth state is resolved from SecureStore
    if (isAuthSettled === false) return;

    // 🛑 GATE 2: Wait until guest tracking keys are fully loaded from storage
    if (!isSessionReady) return;

    setLoading(true);
    try {
      let response: CartResponse;
      if (isAuthenticated) {
        response = await cartApi.getCart();
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
        setCartCount(count);
      } else {
        // Fallback clear reset rules if backend data arrives clean empty
        setCartData(null);
        setCartCount(0);
      }
    } catch (error: any) {
      console.error("Cart Hydration Runtime Interruption:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAuthSettled, guestSessionId, isSessionReady]);

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
          await fetchCart(); // Refresh context values across active layout tabs
          setApiMessage("Item appended successfully to your shopping bag.");
          return true;
        }
        return false;
      } catch (error: any) {
        console.error("Add to Bag Core Processing Exception:", error);
        setApiMessage(
          error?.Message || "Unable to update cart allocation values.",
        );
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
        console.error("Failed to sync structural quantity updates:", error);
        fetchCart();
      }
    },
    [fetchCart],
  );

  const removeCartItem = useCallback(
    async (cartId: number) => {
      setCartData((prev) => {
        if (!prev) return null;
        const filteredList = prev.CartItemList.filter(
          (item: any) => item.CartId !== cartId,
        );
        const newTotal = filteredList.reduce(
          (sum: number, i: any) => sum + (i.TotalAmount || 0),
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
        fetchCart();
      }
    },
    [fetchCart],
  );

  const executeCheckout = useCallback(
    async (attachments: string[] = []) => {
      setLoading(true);
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
          throw new Error(
            "No tracking authentication signature context established.",
          );
        }
        return checkoutResult;
      } catch (error: any) {
        console.error("Checkout execution exception:", error);
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
      guestSessionId,
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
      guestSessionId,
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
