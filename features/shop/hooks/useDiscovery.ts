import { useState, useEffect } from "react";
import { shopApi } from "../services/shopApi";
import { Category, Product, LandingPageData, Banner } from "../types/shopTypes";

// Globally cached categories to speed up deep nesting tree navigation paths
let masterCategoryTree: Category[] = [];
let landingPageProducts: LandingPageData[] = [];

const findPathAndNode = (
  tree: Category[],
  targetId: number,
  currentPath: { id: number; name: string; isLeaf: boolean }[] = [],
): { children: Category[]; path: any[] } | null => {
  if (!tree) return null;

  for (const node of tree) {
    const childrenList = (node as any).children || (node as any).Children || [];
    const newPath = [
      ...currentPath,
      { id: node.CategoryId, name: node.Name, isLeaf: !!node.IsLeafNode },
    ];

    if (node.CategoryId === targetId) {
      return { children: childrenList, path: newPath };
    }

    if (childrenList.length > 0) {
      const found = findPathAndNode(childrenList, targetId, newPath);
      if (found) return found;
    }
  }
  return null;
};

export const useDiscovery = (categoryId?: string) => {
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [mobileBanners, setMobileBanners] = useState<Banner[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [homeSections, setHomeSections] = useState<LandingPageData[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: number; name: string; isLeaf: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      // Step 1: Initialize Global Core Cache Trees if empty
      if (masterCategoryTree.length === 0 || landingPageProducts.length === 0) {
        const [treeRes, landingRes] = await Promise.all([
          shopApi.getCategories({ Status: -1 }),
          shopApi.getLandingPageProducts(),
        ]);
        masterCategoryTree = treeRes?.Data ?? [];
        landingPageProducts = landingRes?.Data ?? [];
      }

      if (!categoryId) {
        // --- ROOT HOME VIEW ---
        const bannerRes = await shopApi.getMobileBanners();

        // Extracting mobile-specific platforms arrays from response body
        setMobileBanners(bannerRes?.Data?.MobilePlateFormBanners ?? []);
        setSubCategories(masterCategoryTree);
        setHomeSections(landingPageProducts);
        setCategoryProducts([]);
        setBreadcrumbs([]);
      } else {
        // --- DRILL DOWN SUB-CATEGORY VIEW ---
        const numericId = Number(categoryId);
        const result = findPathAndNode(masterCategoryTree, numericId);

        if (result) {
          setSubCategories(result.children);
          setBreadcrumbs(result.path);
        } else {
          setSubCategories([]);
          setBreadcrumbs([]);
        }

        // Fix: Querying directly against the category items list endpoint
        const productDataRes = await shopApi.getProductsByCategory(numericId);
        console.log("Product Data Response:", productDataRes);
        setCategoryProducts(productDataRes?.Data?.productListViewModel ?? []);
        setMobileBanners([]); // Clear home banners when looking at sub-categories
      }
    } catch (error) {
      console.log("Discovery Hook Runtime Error:", error);
      setServerError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscoveryData();
  }, [categoryId]);

  return {
    subCategories,
    mobileBanners,
    categoryProducts,
    homeSections,
    breadcrumbs,
    loading,
    serverError,
    loadDiscoveryData,

    // 🌟 BACKWARDS COMPATIBILITY ALIAS:
    // This trick ensures that your screens using "bannerProducts" will get banners on home screen,
    // and correctly get items/products inside sub-category screens without breaking your UI.
    bannerProducts: categoryId ? categoryProducts : mobileBanners,
  };
};
