import React, { useState } from "react";

import OrderList from "./List";
import Details from "./Details";
import ProductInfoPage from "../ProductInfo";

export default function Shipping(props) {
  const [orderDetails, setOrderDetails] = useState(false);
  const [productInfo, setProductInfo] = useState(false);

  const { categoryId, storeId } = props.match.params;

  return (
    <div
      style={{ display: "flex", justifyContent: "center", minHeight: "100vh" }}
    >
      {!orderDetails && (
        <OrderList
          history={props.history}
          categoryId={categoryId}
          storeId={storeId}
          clickViewOrder={(item) => setOrderDetails(item)}
        />
      )}

      {orderDetails && !productInfo && (
        <Details
          history={props.history}
          item={orderDetails}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => setOrderDetails(false)}
          openProductInfo={(o) => setProductInfo(o)}
        />
      )}
      {productInfo && (
        <ProductInfoPage
          status="Shipping"
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
