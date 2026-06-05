import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";

export const useOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await customerApi.getOrders(100, 1);
      console.log("Orders API response:", response);
      if (response?.Data?.CustomerOrders) {
        setOrders(response.Data.CustomerOrders);
      }
    } catch (err: any) {
      setError(err.Message || "Failed to fetch orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    refreshing,
    error,
    onRefresh: () => fetchOrders(true),
  };
};
