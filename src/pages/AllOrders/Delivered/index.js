import React, { useState } from "react";
import OrderList from "./List";
import Details from "./Details";
import ProductInfoPage from "../../../components/ProductInfo";
import { useLocation } from "react-router-dom";

export default function Delivered(props) {
  const [orderDetails, setOrderDetails] = useState(false);
  const [productInfo, setProductInfo] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [storeId, setStoreId] = useState("");
  const search = useLocation().search;
  const id = new URLSearchParams(search).get("id");

  if (id === null && orderDetails) {
    setOrderDetails(false);
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "center", minHeight: "100vh" }}
    >
      {!orderDetails && (
        <OrderList
          onCountChange={props.onCountChange}
          history={props.history}
          categoryId={categoryId}
          storeId={storeId}
          clickViewOrder={(item, category, store) => {
            setCategoryId(category);
            setStoreId(store);
            setOrderDetails(item);
          }}
        />
      )}

      {orderDetails && !productInfo && (
        <Details
          history={props.history}
          item={orderDetails}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => {
            let url = new URL(window.location.href);
            let params = new URLSearchParams(url.search);
            params.delete("id");
            props.history.push({ search: `?${params}` });
            setOrderDetails(false);
          }}
          openProductInfo={(o) => setProductInfo(o)}
        />
      )}
      {productInfo && (
        <ProductInfoPage
          status="Delivered"
          item={orderDetails}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => setProductInfo(false)}
          productItem={productInfo}
        />
      )}
    </div>
  );
}
