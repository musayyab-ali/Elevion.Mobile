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
  processingIds: Set<number>;
  cartMessage: string | null;
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
  //  const [loading, setLoading] = useState<boolean>(false);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState<boolean>(false);
  const [serverError, setServerError] = useState<boolean>(false);
  type LoadingState = {
    fetching: boolean;
    checkout: boolean;
    deleting: boolean;
  };

  const [loading, setLoading] = useState<LoadingState>({
    fetching: false,
    checkout: false,
    deleting: false,
  });

  const setActionLoading = (key: keyof LoadingState, value: boolean) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  };
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

  console.log(`fuck me : ${guestSessionId}`);

  // 2. Fetch cart contents with conditional gates
  const fetchCart = useCallback(async () => {
    // 🛑 GATE 1: Wait until Auth state is resolved from SecureStore
    if (isAuthSettled === false) return;

    // 🛑 GATE 2: Wait until guest tracking keys are fully loaded from storage
    if (!isSessionReady) return;
    setActionLoading("fetching", true);
    // setLoading(true);
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
      console.log("fetchCart error:", error);
      setServerError(true);
    } finally {
      setActionLoading("fetching", false);
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
          await fetchCart();

          router.push("/(tabs)/category/cart");
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
        setCartMessage("There is somthing wrong! Check you connection.");
        fetchCart();
      } finally {
        setTimeout(() => setCartMessage(null), 2000);
      }
    },
    [fetchCart],
  );

  const removeCartItem = useCallback(
    async (cartId: number) => {
      // setLoading(true);
      setActionLoading("deleting", true);
      try {
        const response = await cartApi.deleteItem(cartId);
        console.log("Delete item response:", response);
        if (!response?.Data) {
          setCartMessage("There is somthing wrong! Check you connection.");
        }
        setCartCount(response.Data.CartCount);
        fetchCart();
      } catch (error) {
        console.log("Cart deletion routine exception:", error);
        setCartMessage("There is somthing wrong! Check you connection.");
      } finally {
        // setLoading(false);
        setActionLoading("deleting", false);
        setTimeout(() => setCartMessage(null), 2000);
      }
    },
    [fetchCart],
  );

  const executeCheckout = useCallback(
    async (attachments: string[] = []) => {
      // setLoading(true);
      setActionLoading("checkout", true);
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
        setCartMessage("There is somthing wrong! Check you connection.");
      } finally {
        // setLoading(false);
        setActionLoading("checkout", false);
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
