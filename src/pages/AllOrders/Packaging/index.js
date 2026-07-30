import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import OrderList from "./List";
import ProductInfoPage from "../../../components/ProductInfo";
import Details from "./Details";

export default function Packaging(props) {
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
          onCountChange={props.onCountChange}
          history={props.history}
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
          {" "}
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
            status="Packaging"
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
