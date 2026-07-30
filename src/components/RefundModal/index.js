import React, { useEffect, useState } from "react";
import { Modal, Button, Checkbox, message, Spin } from "antd";
import "./RefundModal.less";
import axios from "axios";

function RefundModal(props) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [escalatedProduct, setEscalatedProduct] = useState([]);
  const [sumOfPrice, setSumOfPrice] = useState(null);
  const { item, storeId, categoryId, refundProductMoney, ProductItem } = props;

  const refundMoney = () => {
    setLoading(true);
    if (refundProductMoney) {
      if (checked) {
        axios
          .patch("/order/escalate/refundProductRequest", {
            category_id: categoryId,
            shop_id: storeId,
            order_id: item._id,
            product_id: ProductItem.id,
          })
          .then((response) => {
            console.log("refund response", response.data.data);
            setLoading(false);
            props.onClose();
          })
          .catch((error) => {
            console.log("ERROR Response =", error);
            setLoading(false);
            message.error(
              error?.response?.data?.message || "Something went wrong."
            );
          });
      } else {
        axios
          .patch("/order/escalate/refundProduct", {
            category_id: categoryId,
            shop_id: storeId,
            order_id: item._id,
            product_id: ProductItem.id,
          })
          .then((response) => {
            console.log("refund response", response.data.data);
            setLoading(false);
            props.onClose();
          })
          .catch((error) => {
            console.log("ERROR Response =", error);
            setLoading(false);
            message.error(
              error?.response?.data?.message || "Something went wrong."
            );
          });
      }
    } else {
      if (checked) {
        axios
          .patch("/order/escalate/refundOrderRequest", {
            category_id: categoryId,
            shop_id: storeId,
            order_id: item._id,
          })
          .then((response) => {
            console.log("refund response", response.data.data);
            setLoading(false);
            props.onClose();
          })
          .catch((error) => {
            console.log("ERROR Response =", error);
            setLoading(false);
            message.error(
              error?.response?.data?.message || "Something went wrong."
            );
          });
      } else {
        // /order/escalate/refundOrder
        axios
          .patch("/order/escalate/refundOrder", {
            category_id: categoryId,
            shop_id: storeId,
            order_id: item._id,
          })
          .then((response) => {
            console.log("refund response", response.data.data);
            setLoading(false);
            props.onClose();
          })
          .catch((error) => {
            console.log("ERROR Response =", error);
            setLoading(false);
            message.error(
              error?.response?.data?.message || "Something went wrong."
            );
          });
      }
    }
  };

  const getEscalatedProducts = () => {
    setLoading(true);

    axios
      .post("/order/escalate/viewProducts", {
        category_id: categoryId,
        shop_id: storeId,
        order_id: item._id,
      })
      .then((response) => {
        console.log("ress", response.data.data);
        setEscalatedProduct(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("ERROR Response =", error);
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };
  useEffect(() => {
    if (item && !ProductItem) {
      getEscalatedProducts();
    }
    console.log("item", item);
    console.log("product item", ProductItem);
  }, [item, ProductItem]);

  useEffect(() => {
    console.log("escalated ", escalatedProduct);

    let sum = 0;
    for (let i = 0; i < escalatedProduct.length; i++) {
      sum +=
        (escalatedProduct[i].net_price -
          escalatedProduct[i].product_offer_amount) *
        escalatedProduct[i].escalated_qty;
    }
    setSumOfPrice(sum);
  }, [escalatedProduct]);

  return (
    <Modal
      className="refund-modal"
      title="Refund"
      visible={props.isRefundModal}
      onCancel={props.onClose}
      footer={[
        <Button key="1" onClick={props.onClose}>
          Cancel
        </Button>,
        <Button
          key="2"
          type="primary"
          loading={loading}
          onClick={() => refundMoney()}
        >
          Initiate Refund
        </Button>,
      ]}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "20vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h3>Are you sure you want to initiate refund?</h3>
          <p>
            Refund Amount: &ensp;
            <span style={{ color: "red" }}>
              ₹
              {
                typeof ProductItem === "object"
                  ? ((ProductItem.net_price - ProductItem.product_offer_amount) *
                    ProductItem.escalated_qty).toFixed(2)
                  : sumOfPrice?.toFixed(2)
                // : item?.amount?.toFixed(2)
              }
            </span>
          </p>
          <Checkbox onChange={(e) => setChecked(e.target.checked)}>
            Initiate refund after customer return the product
          </Checkbox>
        </div>
      )}
    </Modal>
  );
}

export default RefundModal;
