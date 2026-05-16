import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";
import { useAuth } from "../../../store/AuthContext";
import { Alert } from "react-native";

export const useSettings = () => {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const res = {
    Data: [
      {
        DeliveryTypeId: 1,
        Name: "Executive",
        DisplayName: "Executive Delivery (Next Day)",
        EstimatedDays: 1,
        Charge: 500,
      },
      {
        DeliveryTypeId: 2,
        Name: "Standard",
        DisplayName: "Standard Shipping",
        EstimatedDays: 2,
        Charge: 350,
      },
      {
        DeliveryTypeId: 3,
        Name: "Normal",
        DisplayName: "Normal Shipping",
        EstimatedDays: 5,
        Charge: 200,
      },
      {
        DeliveryTypeId: 4,
        Name: "Free",
        DisplayName: "Saver (Free Shipping)",
        EstimatedDays: 7,
        Charge: 0,
      },
    ],
    Message: "Delivery options retrieved successfully",
    Type: "Success",
    HttpStatusCode: 200,
  };

  const fetchDeliveryOptions = async () => {
    setLoading(true);
    try {
      //   const res = await customerApi.getDeliveryOptions();
      console.log(`delivery option responce is: ${res.Data}`);
      if (res?.HttpStatusCode === 200) {
        setDeliveryOptions(res.Data);
      }
    } catch (err) {
      console.error("Settings fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  useEffect(() => {
    fetchDeliveryOptions();
  }, []);

  return { deliveryOptions, loading, handleLogout };
};
