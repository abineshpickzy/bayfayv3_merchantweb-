import React, { useEffect, useState } from "react";
import { Modal, Button, Select, message, Spin, Input } from "antd";
import "./ContactCustomer.less";
import axios from "axios";

const { TextArea } = Input;

function ContactCustomer(props) {
  const [loading, setLoading] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [messageTxt, setMessageTxt] = useState(null);
  const { item, storeId } = props;

  useEffect(() => {
    setLoading(true);
    axios
      .post("/order/msgTemplate", {})
      .then((response) => {
        console.log("ContactCustomer messages Response =", response.data.data);
        setLoading(false);
        setMessageTemplates(response.data.data);
      })
      .catch((error) => {
        console.log("ERROR Response =", error);
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  }, []);

  const SendMessage = () => {
    setLoading(true);
    if (!messageTxt) {
      message.error("please select some valid template.");
      setLoading(false);
      return;
    }
    axios
      .post("/order/message", {
        order_id: item.order_id,
        store_id: storeId,
        message: messageTxt,
      })
      .then((response) => {
        console.log("send customer messages =", response.data.data);
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
  };

  return (
    <Modal
      className="contact-customer-modal"
      title="Message to Customer"
      style={{ top: 20 }}
      visible={props.isContactCustomer}
      onCancel={props.onClose}
      footer={[
        <Button key="1" type="primary" loading={loading} onClick={SendMessage}>
          Send Message
        </Button>,
      ]}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <div>
          <Select
            placeholder="Select Mesage Template"
            style={{ width: "100%" }}
            onChange={(e) => {
              setMessageTxt(
                messageTemplates[e].message.replaceAll(`$(id)`, item.order_id)
              );
            }}
          >
            {messageTemplates.map((item, index) => {
              return (
                <Select.Option key={index} value={index}>
                  {item.title}
                </Select.Option>
              );
            })}
          </Select>
          <TextArea
            rows={4}
            value={messageTxt}
            onChange={(e) => setMessageTxt(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}

export default ContactCustomer;
