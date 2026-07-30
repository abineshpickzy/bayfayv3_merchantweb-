import React, { useState, useEffect } from "react";
import OrderList from "./List";
import Details from "./Details";
import Escalation from "../Escalation";
import ProductInfoPage from "../ProductInfo";

export default function NewOrders(props) {
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
          locationQs={props.location.search}
          history={props.history}
          categoryId={categoryId}
          storeId={storeId}
          clickViewOrder={(item) => setOrderDetails(item)}
        />
      )}

      {orderDetails && !productReason && !productInfo && (
        <Details
          locationQs={props.location.search}
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
          status="New Order"
          item={orderDetails}
          productItem={productReason}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => setProductReason(false)}
        />
      )}
      {productInfo && (
        <ProductInfoPage
          status="New Order"
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
