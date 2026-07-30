import React, { useEffect, useState } from "react";
import "./Escalation.less";
import { Card, Button, Input, message, Spin } from "antd";
import RefundModal from "../RefundModal";
import axios from "axios";
import Messagebox from "./Messagebox";

const { TextArea } = Input;

function Escalation(props) {
  const [loading, setLoading] = useState(false);
  const [reasonMessage, setReasonMessage] = useState();
  const [feedbackMessage, setFeedbackMessage] = useState();
  const [isRefundModal, setIsRefundModal] = useState(false);
  const { item, status, productItem, storeId, categoryId } = props;

  const getRefundView = () => {
    setLoading(true);
    axios
      .post("/order/escalate/viewCorrespondence", {
        category_id: categoryId,
        shop_id: storeId,
        order_id: item._id,
        product_id: productItem.id,
      })
      .then((response) => {
        console.log("refund Product : ", response.data.data);
        setReasonMessage(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  useEffect(getRefundView, []);

  const escalateProduct = () => {
    setLoading(true);
    if (!feedbackMessage) {
      message.error("please add some feedback message");
      setLoading(false);
      return;
    }
    axios
      .patch("/order/escalate/escalateProduct", {
        category_id: categoryId,
        shop_id: storeId,
        order_id: item._id,
        product_id: productItem.id,
        message: feedbackMessage,
      })
      .then((response) => {
        console.log("escalation", response.data.data);
        setReasonMessage(response.data.data);
        setLoading(false);
        getRefundView();
        setFeedbackMessage();
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const acceptProduct = () => {
    setLoading(true);
    axios
      .patch("/order/escalate/acceptProduct", {
        category_id: categoryId,
        shop_id: storeId,
        order_id: item._id,
        product_id: productItem.id,
      })
      .then((response) => {
        console.log("escalation", response.data.data);
        setReasonMessage(response.data.data);
        setLoading(false);
        props.goBack();
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  return (
    <div id="Escalation">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          {status}&ensp;/
        </span>
        &ensp;
        <span
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
          onClick={props.goBack}
        >
          {item.order_id}&ensp;/
        </span>
        &ensp;<span>Escalation Windows</span>
      </p>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "75vh",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <Card className="product-detail-card">
          <div style={{ minHeight: "100vh", paddingBottom: "50px" }}>
            {reasonMessage?.chat?.chat.map((item, index) => {
              var isoDateTime = new Date(item.at);
              var localDateTime =
                isoDateTime.toLocaleDateString() +
                " " +
                isoDateTime.toLocaleTimeString();
              return <Messagebox item={item} localDateTime={localDateTime} />;
            })}
          </div>
          <div style={{ height: "150px", position: "sticky", bottom: "5px" }}>
            <div className="feedback-area">
              <TextArea
                rows={4}
                value={feedbackMessage}
                placeholder="Enter your feedback / response"
                onChange={(e) => setFeedbackMessage(e.target.value)}
              />
            </div>

            <div className="refund-button">
              {item.payment_type !== "COD" && (
                <Button
                  type="primary"
                  danger
                  disabled={
                    productItem.escalation_status === 7 ||
                    productItem.escalation_status === 6
                      ? true
                      : false
                  }
                  onClick={() => {
                    setIsRefundModal(true);
                  }}
                >
                  Refund
                </Button>
              )}
              <Button
                type="primary"
                danger
                disabled={
                  productItem.escalation_status === 7 ||
                  productItem.escalation_status === 6
                    ? true
                    : false
                }
                onClick={() => escalateProduct()}
              >
                Escalate
              </Button>
              <Button
                type="primary "
                disabled={
                  productItem.escalation_status === 7 ||
                  productItem.escalation_status === 6
                    ? true
                    : false
                }
                onClick={() => acceptProduct()}
              >
                Accept
              </Button>
            </div>
          </div>
        </Card>
      )}
      <RefundModal
        refundProductMoney={true}
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        ProductItem={productItem}
        isRefundModal={isRefundModal}
        onClose={() => {
          setIsRefundModal(false);
          props.goBack();
        }}
      />
    </div>
  );
}

export default Escalation;
