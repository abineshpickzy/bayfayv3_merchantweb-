import React, { useEffect, useState } from "react";
import "./ConformationAssociate.less";
import { Modal, Button, Radio, Row, Col, message } from "antd";
import axios from "axios";
import moment from "moment";

function ConformationAssociate(props) {
  const [deliveryAssistant, setDeliveryAssistant] = useState([]);
  const [expectedTime, SetExpectedTime] = useState(moment().add(30, "minutes"));
  const [isConform, setIsConform] = useState(false);
  const [assistantId, setAssistantId] = useState();
  const [assistant, setAssistant] = useState();
  const [isAssign, setIsAssign] = useState(null);
  const { item } = props;

  const isConformationClose = () => {
    props.isConformationClose();
    setIsConform(false);
  };

  useEffect(() => {
    axios
      .post("/delivery/assistant/assign/auto/view", {
        order_id: item._id,
      })
      .then((response) => {
        console.log(" Auto Assign or not = ", response.data.success);
        setIsAssign(response.data.success);
      })
      .catch((error) => {});
  }, []);

  const getDeliveryAssistant = () => {
    axios
      .post("/delivery/assistant/active/list", {
        order_id: item._id,
        expected_delivery_time: expectedTime,
      })
      .then((response) => {
        console.log("delivery Assistant =", response);
        setDeliveryAssistant(response.data.data);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const AssignAssociate = () => {
    if (!assistantId) {
      message.error("Kindly select Delivery Associate !");
      return;
    }
    axios
      .post("/delivery/assistant/assign", {
        order_id: item._id,
        assistant_id: assistantId,
      })
      .then((response) => {
        console.log("Accept Response =", response);
        setAssistant(response.data.data);
        props.Assigned();
        props.isConformationClose();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  useEffect(() => {
    props.isConformationOpen && getDeliveryAssistant();
  }, [props.isConformationOpen]);

  return (
    <Modal
      className="conformation-associate"
      style={{ top: 30 }}
      visible={props.isConformationOpen}
      title={
        isConform || !isAssign ? "Assign to Delivery Associate" : "Confirmation"
      }
      onCancel={isConformationClose}
      footer={
        isConform || !isAssign
          ? [
              <Button onClick={isConformationClose}>Cancel</Button>,
              <Button type="primary" onClick={AssignAssociate}>
                Assign
              </Button>,
            ]
          : [
              <Button onClick={isConformationClose}>No</Button>,
              <Button
                type="primary"
                onClick={() => {
                  setIsConform(true);
                  getDeliveryAssistant();
                }}
              >
                Yes
              </Button>,
            ]
      }
    >
      {!isConform && isAssign ? (
        <div>
          <p style={{ margin: 0 }}>
            Are you sure you want to manually assign the order to delivery
            associate?
          </p>
        </div>
      ) : (
        <div className="manual-assistant">
          <p style={{ color: "#747474" }}>Select Associate : </p>
          <Radio.Group onChange={(e) => setAssistantId(e.target.value)}>
            {deliveryAssistant.map((item, index) => {
              return (
                <div className="radio-detail">
                  <div style={{ width: "280px" }}>
                    <Row gutter={8}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          color: "#616161",
                        }}
                        span={12}
                      >
                        Name:
                      </Col>
                      <Col span={12}>
                        {item.first_name + " " + item.last_name}
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          color: "#616161",
                        }}
                        span={12}
                      >
                        Standing Distance:
                      </Col>
                      <Col span={12}>
                        {item.distance.toFixed(2)} km from Shop
                      </Col>
                    </Row>
                    <Row gutter={8}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          color: "#616161",
                        }}
                        span={12}
                      >
                        Rating:
                      </Col>
                      <Col span={12}>{item.rating}</Col>
                    </Row>
                    <Row gutter={8}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          color: "#616161",
                        }}
                        span={12}
                      >
                        Current Order Count:
                      </Col>
                      <Col span={12}>{item.orders}</Col>
                    </Row>
                    <Row gutter={8}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "end",
                          color: "#616161",
                        }}
                        span={12}
                      >
                        status:
                      </Col>
                      <Col
                        span={12}
                        style={{ color: item.status === 1 ? "green" : "red" }}
                      >
                        {item.status === 1 ? "In Service" : "Idle"}
                      </Col>
                    </Row>
                  </div>
                  <div>
                    <Radio key={index} value={item._id} />
                  </div>
                </div>
              );
            })}
          </Radio.Group>
        </div>
      )}
    </Modal>
  );
}

export default ConformationAssociate;
