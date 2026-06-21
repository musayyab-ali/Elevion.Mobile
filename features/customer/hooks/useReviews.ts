import { useState, useEffect, useCallback } from "react";
import { customerApi } from "../services/customerApi";

// Type definition to specify context mode
type ReviewMode = "recent" | "all";

export const useReviews = (mode: ReviewMode = "recent") => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Conditionally fetch based on the requested screen mode
      const res = await (mode === "recent"
        ? customerApi.getCustomerReviews(1, 5) // Fetch small recent batch for Profile
        : customerApi.getAllReviews()); // Fetch all reviews for Dedicated Screen

      // 2. FIXED: Map through Axios' response wrapper 'res.data'
      if (res?.data?.Data?.Reviews) {
        setReviews(res.data.Data.Reviews);
      }
    } catch (err) {
      console.log(`Review fetch error [Mode: ${mode}]`, err);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    refresh: fetchReviews,
  };
};
