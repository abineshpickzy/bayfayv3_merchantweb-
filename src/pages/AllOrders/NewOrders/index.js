import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import OrderList from "./List";
import Details from "./Details";
import Escalation from "../../../components/Escalation";
import ProductInfoPage from "../../../components/ProductInfo";

export default function NewOrders(props) {
  const [orderDetails, setOrderDetails] = useState(false);
  const [productReason, setProductReason] = useState(false);
  const [productInfo, setProductInfo] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [storeId, setStoreId] = useState("");

  const search = useLocation().search;
  const id = new URLSearchParams(search).get("id");

  if (id === null && orderDetails) {
    setOrderDetails(false);
  }

  return (
    <React.Fragment>
      {!orderDetails && (
        <OrderList
          locationQs={props.location.search}
          history={props.history}
          onCountChange={props.onCountChange}
          clickViewOrder={(item, category, store) => {
            setCategoryId(category);
            setStoreId(store);
            setOrderDetails(item);
          }}
        />
      )}

      {orderDetails && !productReason && !productInfo && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <Details
            locationQs={props.location.search}
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
            openReason={(o) => setProductReason(o)}
            openProductInfo={(o) => setProductInfo(o)}
          />
        </div>
      )}
      {productReason && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          {" "}
          <Escalation
            status="New Order"
            item={orderDetails}
            productItem={productReason}
            categoryId={categoryId}
            storeId={storeId}
            goBack={() => setProductReason(false)}
          />
        </div>
      )}
      {productInfo && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          {" "}
          <ProductInfoPage
            status="New Order"
            item={orderDetails}
            categoryId={categoryId}
            storeId={storeId}
            goBack={() => setProductInfo(false)}
            productItem={productInfo}
          />
        </div>
      )}
    </React.Fragment>
  );
}
