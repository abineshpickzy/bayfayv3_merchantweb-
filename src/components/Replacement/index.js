import React, { useState } from "react";
import OrderList from "./List";
import Details from "./Details";
import ProductInfoPage from "../ProductInfo";
import Escalation from "../Escalation";

export default function Replacement(props) {
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
          openReason={(o) => setProductReason(o)}
          openProductInfo={(o) => setProductInfo(o)}
        />
      )}
      {productReason && (
        <Escalation
          status="Replacement / Refund "
          item={orderDetails}
          productItem={productReason}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => setProductReason(false)}
        />
      )}
      {productInfo && (
        <ProductInfoPage
          status="Replacement / Refund "
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
