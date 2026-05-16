// import { useState, useEffect } from "react";
// import { shopApi } from "../services/shopApi";
// import { Category, Product, LandingPageData } from "../types/shopTypes";

// // Static cache to store the tree and landing data globally
// let masterCategoryTree: Category[] = [];
// let landingPageProducts: LandingPageData[] = [];

// export const useDiscovery = (categoryId?: string) => {
//   const [subCategories, setSubCategories] = useState<Category[]>([]);
//   const [bannerProducts, setBannerProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);

//   // Helper to find category children in the recursive tree
//   const findChildrenInTree = (tree: Category[], id: number): Category[] => {
//     if (!tree) return [];
//     for (const node of tree) {
//       if (node?.CategoryId === id) {
//         return node?.children ?? []; // Use lowercase 'children' per your API response
//       }
//       if (node?.children && node.children.length > 0) {
//         const found = findChildrenInTree(node.children as Category[], id);
//         if (found.length > 0) return found;
//       }
//     }
//     return [];
//   };

//   const loadDiscoveryData = async () => {
//     setLoading(true);
//     try {
//       // 1. Initial Load of Global Data
//       if (masterCategoryTree.length === 0 || landingPageProducts.length === 0) {
//         const [treeRes, landingRes] = await Promise.all([
//           shopApi.getCategories({ Status: 1 }),
//           shopApi.getLandingPageProducts(),
//         ]);
//         masterCategoryTree = treeRes?.Data ?? [];
//         landingPageProducts = landingRes?.Data ?? [];
//       }

//       if (!categoryId) {
//         // --- HOME SCREEN LOGIC ---
//         const featuredRes = await shopApi.getFeaturedProducts();
//         setBannerProducts(featuredRes?.Data ?? []);
//         // Show only top-level categories
//         setSubCategories(masterCategoryTree);
//       } else {
//         // --- SUB-CATEGORY SCREEN LOGIC ---
//         const numericId = Number(categoryId);

//         // Find children locally from the pre-fetched tree
//         const children = findChildrenInTree(masterCategoryTree, numericId);
//         setSubCategories(children);

//         // Find banner products from the pre-fetched landing data
//         const categoryLanding = landingPageProducts.find(
//           (item) => item?.Category?.CategoryId === numericId,
//         );
//         setBannerProducts(categoryLanding?.ProductList ?? []);
//       }
//     } catch (error) {
//       console.error("Discovery Logic Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDiscoveryData();
//   }, [categoryId]);

//   return { subCategories, bannerProducts, loading };
// };

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
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: number; name: string; isLeaf: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Discovery Hook Runtime Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscoveryData();
  }, [categoryId]);

  return { subCategories, bannerProducts, breadcrumbs, loading };
};
