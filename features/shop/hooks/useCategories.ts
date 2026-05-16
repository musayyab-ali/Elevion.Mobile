import { useState, useEffect, useCallback } from "react";
import { shopApi } from "../services/shopApi";
import { Category } from "../types/shopTypes";

let globalMasterTree: Category[] | null = null;

const findCategoryDeep = (
  data: Category[],
  targetId: string,
): Category | null => {
  for (const item of data) {
    if (item.CategoryId?.toString() === targetId) return item;
    // Fix: Using uppercase 'Children' to match your shopTypes.ts
    if (
      item.Children &&
      Array.isArray(item.Children) &&
      item.Children.length > 0
    ) {
      const found = findCategoryDeep(item.Children as Category[], targetId);
      if (found) return found;
    }
  }
  return null;
};

export const useCategories = (params: any = { Status: 1 }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    const targetId = params.CategoryId?.toString();

    if (targetId && globalMasterTree) {
      const found = findCategoryDeep(globalMasterTree, targetId);
      if (found && Array.isArray(found.Children) && found.Children.length > 0) {
        setCategories(found.Children as Category[]);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await shopApi.getCategories(params);
      const rawData = response?.Data || [];

      if (!targetId && rawData.length > 0) {
        globalMasterTree = rawData;
        setCategories(rawData);
      } else if (targetId) {
        const found = findCategoryDeep(globalMasterTree || rawData, targetId);
        // Fallback to rawData if the deep search fails
        setCategories((found?.Children as Category[]) || rawData);
      } else {
        setCategories(rawData);
      }
    } catch (err) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refresh: fetchCategories };
};
