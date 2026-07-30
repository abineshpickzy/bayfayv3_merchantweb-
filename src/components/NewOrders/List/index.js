import { message, Spin } from "antd";
import React, { useState, useEffect, Fragment } from "react";
import Item from "../../OrderItem";
import AcceptModal from "../AcceptModal";
import CancelOrder from "../../CancelModel";
import PagePagination from "../../Pagination";
import axios from "axios";
import RefundModal from "../../RefundModal";
import moment from "moment";

const List = (props) => {
  const [acceptModel, setAcceptModel] = useState(false);
  const [CancelModal, setCancelModal] = useState(false);
  const [isRefundModal, setIsRefundModal] = useState(false);
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);

  const { categoryId, storeId } = props;

  const handlePageChange = (value) => {
    setMinValue(value * numEachPage - numEachPage);
    setMaxValue(value * numEachPage);
  };

  const handlePageCountChange = (value) => {
    setNumEachPage(value);
    if (maxValue - minValue !== value) {
      setMaxValue(minValue + value);
    }
  };

  const getOrders = () => {
    axios
      .post("/order/newOrder", {
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("NewOrders List =", response.data.data);
        setOrderList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  useEffect(() => {
    console.log("props changes ....");
    console.log(props.locationQs);
    if (props.locationQs.includes("?refresh=true")) {
      getOrders();
      props.history.push("/store/orders/" + storeId + "/" + categoryId);
    }
  }, [props.locationQs]);

  useEffect(getOrders, []);

  const onAccept = () => {
    setLoading(true);
    getOrders();
  };

  const onCancelAccept = () => {
    setLoading(true);
    getOrders();
  };

  let lastDate = "";
  return (
    <div>
      {loading ? (
        <div
          style={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : orderList.length === 0 ? (
        <div
          style={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{ fontSize: "35px", fontFamily: "Anton", color: "#9e9e9e" }}
          >
            No Records Found
          </p>
        </div>
      ) : (
        orderList.slice(minValue, maxValue).map((item, index) => {
          let orderDate = moment(item.ordered).fromNow();
          if (orderDate === lastDate) {
            orderDate = null;
          } else {
            lastDate = orderDate;
          }
          return (
            <Fragment key={index}>
              <p style={{ margin: "1em 0", textTransform: "capitalize" }}>
                {orderDate ? orderDate : ""}
              </p>
              <Item
                refreshList={getOrders}
                clickViewOrder={() => props.clickViewOrder(item)}
                storeId={storeId}
                categoryId={categoryId}
                isRefundMdal={() => {
                  setIsRefundModal(item);
                }}
                onAccept={() => {
                  setAcceptModel(item);
                }}
                onCancelAccept={() => {
                  setCancelModal(item);
                }}
                item={item}
                key={index}
                status="New Order"
              />
            </Fragment>
          );
        })
      )}
      <AcceptModal
        isOpen={acceptModel}
        storeId={storeId}
        history={props.history}
        categoryId={categoryId}
        item={acceptModel}
        onAccept={onAccept}
        onClose={() => setAcceptModel(false)}
      />
      <RefundModal
        refundProductMoney={false}
        history={props.history}
        item={isRefundModal}
        storeId={storeId}
        categoryId={categoryId}
        isRefundModal={isRefundModal}
        onClose={() => setIsRefundModal(false)}
      />
      <CancelOrder
        history={props.history}
        storeId={storeId}
        categoryId={categoryId}
        item={CancelModal}
        onCancelAccept={onCancelAccept}
        isCancelOrderOpen={CancelModal}
        onClose={() => setCancelModal(false)}
      />

      {orderList.length > 25 && (
        <PagePagination
          minValue={minValue}
          handlePageChange={handlePageChange}
          handlePageCountChange={handlePageCountChange}
          maxValue={maxValue}
          numEachPage={numEachPage}
          orderList={orderList}
        />
      )}
    </div>
  );
};

export default List;
