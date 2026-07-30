import React, { useState } from "react";
import OrderList from "./List";
import ProductInfoPage from "../ProductInfo";
import Details from "./Details";

export default function Packaging(props) {
  const [orderDetails, setOrderDetails] = useState(false);
  const [productReason, setProductReason] = useState(false);
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

      {orderDetails && !productReason && !productInfo && (
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
          status="Packaging"
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
