import React, { useEffect, useState } from "react";
import { Button, Modal, message } from "antd";
import axios from "axios";
import "./DispatchModal.less";

function DispatchModal(props) {
  const [readyDispatch, setReadyDispatch] = useState([]);
  const [loading, setLoading] = useState(true);

  const { item, storeId, categoryId, checkedID, productList } = props;
  const readyToDispatch = () => {
    setLoading(true);
    axios
      .patch("/order/readyToShipOrder", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("Order ready to dispatch =", response.data.data);
        setReadyDispatch(response.data.data);
        setLoading(false);
        let newurl = window.location.pathname + "?refreshCount=true";
        props.history.push(newurl);
        props.onClose();
        props.onDispatch();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };
  return (
    <Modal
      className="dispatched-modal"
      visible={props.isDispatchOpen}
      onCancel={props.onClose}
      title="Info"
      footer={
        checkedID.length === productList.length && productList.length !== 0
          ? [
              <Button onClick={props.onClose}>Cancel</Button>,
              <Button type="primary" onClick={readyToDispatch}>
                Dispatch
              </Button>,
            ]
          : [
              <Button type="primary" onClick={readyToDispatch}>
                Continue
              </Button>,
              <Button onClick={props.onClose}>No</Button>,
            ]
      }
    >
      {checkedID.length === productList.length && productList.length !== 0 ? (
        <div style={{ width: "250px", textAlign: "center" }}>
          <p style={{ margin: 0 }}>
            All products are selected, dispatch the order!
          </p>
        </div>
      ) : (
        <div style={{ width: "250px", textAlign: "center" }}>
          <p style={{ margin: 0 }}>
            You have not Verified/Selected all products , are you sure you want
            to Dispatch the order?
          </p>
        </div>
      )}
    </Modal>
  );
}

export default DispatchModal;
