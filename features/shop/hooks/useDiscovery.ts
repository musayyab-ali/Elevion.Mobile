import { useState, useEffect } from "react";
import { shopApi } from "../services/shopApi";
import { Category, Product, LandingPageData } from "../types/shopTypes";

// Globally cached single source of truth
let masterCategoryTree: Category[] = [];
let landingPageProducts: LandingPageData[] = [];

// Helper function to find a category node and trace its lineage for breadcrumbs
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
  const [bannerProducts, setBannerProducts] = useState<Product[]>([]);
  // const [shopMessage, setShopMessage] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: number; name: string; isLeaf: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const loadDiscoveryData = async () => {
    setLoading(true);
    try {
      // 1. Core initialization fetch
      if (masterCategoryTree.length === 0 || landingPageProducts.length === 0) {
        const [treeRes, landingRes] = await Promise.all([
          shopApi.getCategories({ Status: 1 }),
          shopApi.getLandingPageProducts(),
        ]);
        masterCategoryTree = treeRes?.Data ?? [];
        landingPageProducts = landingRes?.Data ?? [];
      }

      if (!categoryId) {
        // --- ROOT HOME VIEW ---
        const featuredRes = await shopApi.getFeaturedProducts();
        setBannerProducts(featuredRes?.Data ?? []);
        setSubCategories(masterCategoryTree);
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

        // Match product banners out of lander records
        const categoryLanding = landingPageProducts.find(
          (item) => item?.Category?.CategoryId === numericId,
        );
        setBannerProducts(categoryLanding?.ProductList ?? []);
      }
    } catch (error) {
      console.log("Discovery Hook Runtime Error:", error);
      //  setShopMessage("There is somthing wrong! Could not find Categories. ");
      setServerError(true);
    } finally {
      setLoading(false);
      // setTimeout(() => setShopMessage(null), 2000);
    }
  };

  useEffect(() => {
    loadDiscoveryData();
  }, [categoryId]);

  return {
    subCategories,
    bannerProducts,
    breadcrumbs,
    loading,
    serverError,
    loadDiscoveryData,
  };
};
