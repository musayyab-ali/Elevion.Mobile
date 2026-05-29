import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";

export const useOrders = () => {
  // const [orders, setOrders] = useState([
  //   {
  //     OrderId: 1,
  //     OrderNumber: "455",
  //     OrderDate: "12-4-2019",
  //     PaymentStatus: 1,
  //     PaymentStatusName: "Fuck",
  //     Status: 1,
  //     OrderStatus: "Processing",
  //     PaymentMethodValue: 1,
  //     PaymentMethod: "Cash On Delivery",
  //     CustomOrder: true,
  //     Total: 7000,
  //   },
  //   {
  //     OrderId: 2,
  //     OrderNumber: "456",
  //     OrderDate: "12-5-2019",
  //     PaymentStatus: 1,
  //     PaymentStatusName: "Fuck",
  //     Status: 1,
  //     OrderStatus: "Complete",
  //     PaymentMethodValue: 1,
  //     PaymentMethod: "Online Payment",
  //     CustomOrder: true,
  //     Total: 2000,
  //   },
  // ]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await customerApi.getOrders(1, 20);
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
