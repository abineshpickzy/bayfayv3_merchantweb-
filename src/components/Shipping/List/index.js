import { Modal, message, Spin } from "antd";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Item from "../../OrderItem";
import PagePagination from "../../Pagination";
import CancelOrder from "../../CancelModel";
import axios from "axios";
import moment from "moment";

const List = (props) => {
  const [CancelModal, setCancelModal] = useState(false);
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

  const getShipped = () => {
    axios
      .post("/order/shippingOrders", {
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("Shipping data = ", response.data.data);
        setOrderList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const onCancelAccept = () => {
    setLoading(true);
    getShipped();
  };
  useEffect(getShipped, []);
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
            <>
              <p style={{ margin: "1em 0", textTransform: "capitalize" }}>
                {orderDate ? orderDate : ""}
              </p>
              <Item
                clickViewOrder={() => props.clickViewOrder(item)}
                storeId={storeId}
                categoryId={categoryId}
                onCancelAccept={() => {
                  setCancelModal(item);
                }}
                status="Shipping"
                item={item}
                key={index}
              />
            </>
          );
        })
      )}
      <CancelOrder
        history={props.history}
        storeId={storeId}
        categoryId={categoryId}
        onCancelAccept={onCancelAccept}
        item={CancelModal}
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
