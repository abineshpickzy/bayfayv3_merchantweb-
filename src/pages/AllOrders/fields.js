import { MailOutlined } from "@material-ui/icons";
import React from "react";

export const initialBody = {
  category_id: "All",
  location_name: "All",
  store_id: undefined,
  search_key: undefined,
  order_type: "All",
  filter: "All",
  filter_date: undefined,
};

export const filterOptions = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "Unread",
    label: "Unread",
  },
  {
    value: "Read",
    label: "Read",
  },
];

export const orderOptions = [
  {
    value: "All",
    label: "All",
  },
  {
    value: "Retail",
    label: "Retail",
  },
  {
    value: "WholeSale",
    label: "WholeSale",
  },
];

export const newOrdersColumns = [
  {
    title: "Sno",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "Support",
    dataIndex: "support",
    key: "support",
    render: (_, record) => {
      return (
        <div style={{ width: "20px" }}>
          <img
            src={
              record.support
                ? "/assets/envelope-open-solid.svg"
                : "/assets/envelope-solid.svg"
            }
            alt=""
          />
        </div>
      );
    },
  },
  {
    title: "Elapsed Time",
    dataIndex: "elapsed_time",
    key: "elapsed_time",
  },
  {
    title: "Order id",
    dataIndex: "order_id",
    key: "order_id",
  },
  {
    title: "Shop Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Shop Name",
    dataIndex: "shop_name",
    key: "shop_name",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "Total Amount",
    dataIndex: "total_amount",
    key: "total_amount",
  },
  {
    title: "Payment Mode",
    dataIndex: "payment_mode",
    key: "payment_mode",
  },
  {
    title: "Order Placed On",
    dataIndex: "ordered",
    key: "ordered",
  },
];

// packaging, dispatched, shipping orders

export const pdsOrdersColumns = [
  {
    title: "Sno",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "Support",
    dataIndex: "support",
    key: "support",
    render: (_, record) => {
      return (
        <div style={{ width: "20px" }}>
          <img
            src={
              record.support
                ? "/assets/envelope-open-solid.svg"
                : "/assets/envelope-solid.svg"
            }
            alt=""
          />
        </div>
      );
    },
  },
  {
    title: "Elapsed Time",
    dataIndex: "elapsed_time",
    key: "elapsed_time",
  },
  {
    title: "Order id",
    dataIndex: "order_id",
    key: "order_id",
  },
  {
    title: "Exp Delivery Time",
    dataIndex: "delivery_time",
    key: "delivery_time",
    render: (_, record) => {
      return (
        <div
          style={{
            color:
              new Date() - record.orderedTime >
              new Date(record.expected_time) - record.orderedTime
                ? "red"
                : "black",
          }}
        >
          {record.delivery_time}
        </div>
      );
    },
  },
  {
    title: "Shop Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Shop Name",
    dataIndex: "shop_name",
    key: "shop_name",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "Total Amount",
    dataIndex: "total_amount",
    key: "total_amount",
  },
  {
    title: "Payment Mode",
    dataIndex: "payment_mode",
    key: "payment_mode",
  },
  {
    title: "Order Placed On",
    dataIndex: "ordered",
    key: "ordered",
  },
];

export const deliveredOrdersColumns = [
  {
    title: "Sno",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "Support",
    dataIndex: "support",
    key: "support",
    render: (_, record) => {
      return (
        <div style={{ width: "20px" }}>
          <img
            src={
              record.support
                ? "/assets/envelope-open-solid.svg"
                : "/assets/envelope-solid.svg"
            }
            alt=""
          />
        </div>
      );
    },
  },
  {
    title: "Elapsed Time",
    dataIndex: "elapsed_time",
    key: "elapsed_time",
  },
  {
    title: "Order id",
    dataIndex: "order_id",
    key: "order_id",
  },
  {
    title: "Delivered Within",
    dataIndex: "delivered_within",
    key: "delivered_within",
  },
  {
    title: "Shop Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Shop Name",
    dataIndex: "shop_name",
    key: "shop_name",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "Total Amount",
    dataIndex: "total_amount",
    key: "total_amount",
  },
  {
    title: "Payment Mode",
    dataIndex: "payment_mode",
    key: "payment_mode",
  },
  {
    title: "Order Delivered On",
    dataIndex: "delivered",
    key: "delivered",
  },
];

export const cancelledOrdersColumns = [
  {
    title: "Sno",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "Support",
    dataIndex: "support",
    key: "support",
    render: (_, record) => {
      return (
        <div style={{ width: "20px" }}>
          <img
            src={
              record.support
                ? "/assets/envelope-open-solid.svg"
                : "/assets/envelope-solid.svg"
            }
            alt=""
          />
        </div>
      );
    },
  },
  {
    title: "Elapsed Time",
    dataIndex: "elapsed_time",
    key: "elapsed_time",
  },
  {
    title: "Order id",
    dataIndex: "order_id",
    key: "order_id",
  },
  {
    title: "Shop Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Shop Name",
    dataIndex: "shop_name",
    key: "shop_name",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "Promo Amount",
    dataIndex: "promo_amount",
    key: "promo_amount",
  },
  {
    title: "Total Amount",
    dataIndex: "total_amount",
    key: "total_amount",
  },
  {
    title: "Payment Mode",
    dataIndex: "payment_mode",
    key: "payment_mode",
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
  },
];

export const replacementOrdersColumns = [
  {
    title: "Sno",
    dataIndex: "sno",
    key: "sno",
  },
  {
    title: "Support",
    dataIndex: "support",
    key: "support",
    render: (_, record) => {
      return (
        <div style={{ width: "20px" }}>
          <img
            src={
              record.support
                ? "/assets/envelope-open-solid.svg"
                : "/assets/envelope-solid.svg"
            }
            alt=""
          />
        </div>
      );
    },
  },
  {
    title: "Elapsed Time",
    dataIndex: "elapsed_time",
    key: "elapsed_time",
  },
  {
    title: "Order id",
    dataIndex: "order_id",
    key: "order_id",
  },
  {
    title: "Shop Category",
    dataIndex: "category",
    key: "category",
  },
  {
    title: "Customer Name",
    dataIndex: "customer",
    key: "customer",
  },
  {
    title: "Shop Name",
    dataIndex: "shop_name",
    key: "shop_name",
  },
  {
    title: "Distance",
    dataIndex: "distance",
    key: "distance",
  },
  {
    title: "Promo Amount",
    dataIndex: "promo_amount",
    key: "promo_amount",
  },
  {
    title: "Total Amount",
    dataIndex: "total_amount",
    key: "total_amount",
  },
  {
    title: "Payment Mode",
    dataIndex: "payment_mode",
    key: "payment_mode",
  },
  {
    title: "Source",
    dataIndex: "source",
    key: "source",
  },
];
