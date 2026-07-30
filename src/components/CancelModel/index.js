import React, { useEffect, useState } from "react";
import "./CancelOrder.less";
import axios from "axios";
import { Modal, Radio, Space, Button, message } from "antd";

function CancelModel(props) {
  const [loading, setLoading] = useState(false);
  const [cancelTitle, setCancelTitle] = useState([]);
  const [radioValue, setRadioValue] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");
  const { item, storeId } = props;

  useEffect(() => {
    setLoading(true);
    axios.get("/order/cancelReason/list").then((response) => {
      setCancelTitle(response.data.data);
      setLoading(false);
    });
  }, []);

  const cancelOrder = () => {
    setLoading(true);
    if (!radioValue) {
      message.error("Please select the problem from below Options!");
      setLoading(false);
      return;
    }
    if (radioValue === "Other reason" && cancelMessage === "") {
      message.error("Cancel message should not empty.");
      setLoading(false);
      return;
    }
    let body = {
      shop_id: storeId,
      order_id: item.order_id,
      title: radioValue,
    };
    if (cancelMessage !== "") {
      body = {
        ...body,
        message: cancelMessage,
      };
    }
    axios
      .post("/order/cancelOrder", body)
      .then((response) => {
        console.log("Cancel Response =", response);
        setLoading(false);
        message.success(response.data.message);
        props.onCancelAccept();
        let newurl = window.location.pathname + "?refreshCount=true";
        props.history.push(newurl);
        setRadioValue(false);
        setCancelMessage("");
        props.onClose();
      })
      .catch((error) => {
        console.log("ERROR Response =", error);
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const onChange = (e) => {
    setRadioValue(e.target.value);
  };

  return (
    <Modal
      id="CancelOrder"
      style={{ top: 30 }}
      className="cancel-order"
      title="Are you sure you want to cancel this order ?"
      visible={props.isCancelOrderOpen}
      onOk={cancelOrder}
      onCancel={() => {
        props.onClose();
        setRadioValue(false);
        setCancelMessage("");
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <Radio.Group onChange={onChange} value={radioValue}>
          <Space direction="vertical">
            {cancelTitle.map((item) => {
              return (
                <Radio key={item._id} value={item.display_name}>
                  {item.display_name}
                </Radio>
              );
            })}
          </Space>
        </Radio.Group>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <textarea
          rows="4"
          style={{ width: "100%" }}
          onChange={(e) => {
            setCancelMessage(e.target.value);
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Button
          style={{ width: "130px", borderColor: "#a9d0f1", color: "#3d95e0" }}
          onClick={props.onClose}
        >
          No
        </Button>
        <Button
          danger
          style={{ width: "130px" }}
          loading={loading}
          onClick={cancelOrder}
        >
          Cancel Order
        </Button>
      </div>
    </Modal>
  );
}

export default CancelModel;
