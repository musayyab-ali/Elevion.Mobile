import { useSharedCartData } from "@/store/CartContext";

export function useProductCartActions(
  productId: number,
  productDetailId: number,
) {
  const { addItemToCart, processingIds, cartCount } = useSharedCartData();

  // Evaluates operational status directly against global tracking allocations arrays
  const isAddingToCart = processingIds.has(productDetailId);

  const handleAddProductToBag = async (selectedQuantity: number = 1) => {
    if (!productId || !productDetailId) {
      console.log(
        "Invalid component matrix definitions provided to Cart Controller runtime.",
      );
      return false;
    }
    return await addItemToCart(productId, productDetailId, selectedQuantity);
  };

  return {
    isAddingToCart,
    globalCartCount: cartCount,
    handleAddProductToBag,
  };
}
