import React, { useState, useEffect } from "react";
import "./AcceptModal.less";
import {
  Modal,
  Space,
  DatePicker,
  Switch,
  Radio,
  Button,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import axios from "axios";
import moment from "moment";

function AcceptModal(props) {
  const [orderAssign, setOrderAssign] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expectedTime, SetExpectedTime] = useState(moment().add(30, "minutes"));
  const [acceptItem, setAcceptItem] = useState([]);
  const [deliveryAssistant, setDeliveryAssistant] = useState([]);
  const [assistantError, setAssistantError] = useState();
  const [assistantId, setAssistantId] = useState();
  const [assistant, setAssistant] = useState();

  const { item, storeId, categoryId } = props;

  const acceptOrder = () => {
    setLoading(true);
    if (item.has_escalation || item.is_escalated_order) {
      axios
        .patch("/order/escalate/acceptOrder", {
          shop_id: storeId,
          category_id: categoryId,
          order_id: item._id,
          expectedTime: expectedTime,
        })
        .then((response) => {
          console.log("Accept Response =", response.data.data);
          setAcceptItem(response.data.data);
          setLoading(false);
          props.onAccept();
          props.onClose();
          let newurl = window.location.pathname + "?refreshCount=true";
          props.history.push(newurl);
          setOrderAssign(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
          setOrderAssign(false);
        });
    } else {
      axios
        .patch("/order/acceptOrder", {
          shop_id: storeId,
          category_id: categoryId,
          order_id: item._id,
          expectedTime: expectedTime,
        })
        .then((response) => {
          console.log("Accept Response =", response.data.data);
          setAcceptItem(response.data.data);
          setLoading(false);
          props.onAccept();
          props.onClose();
          let newurl = window.location.pathname + "?refreshCount=true";
          props.history.push(newurl);
          setOrderAssign(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
          setOrderAssign(false);
        });
    }
  };

  const selectDeliveryAssistant = () => {
    setLoading(true);
    axios
      .post("/delivery/assistant/active/list", {
        order_id: item._id,
        expected_delivery_time: expectedTime,
      })
      .then((response) => {
        console.log("delivery Assistant =", response.data.data);
        setLoading(false);
        setDeliveryAssistant(response.data.data);
      })
      .catch((error) => {
        setLoading(false);
        setAssistantError(error?.response?.data?.message);
      });
  };

  const ManualAssignAssociate = () => {
    console.log("order is manually assign");
    setLoading(true);
    if (!assistantId) {
      setLoading(false);
      setAssistantError("Assistant Id is require, please select Assistant");
      return;
    }
    axios
      .post("/delivery/assistant/assign", {
        order_id: item._id,
        assistant_id: assistantId,
      })
      .then((response) => {
        console.log("MAnual Assign Response =", response.data.data);
        setAssistant(response.data.data);
        setLoading(false);
        props.onClose();
        setOrderAssign(false);
      })
      .catch((error) => {
        setLoading(false);
        setAssistantError(error?.response?.data?.message);
        setOrderAssign(false);
      });
  };

  const AutoAssignAssociate = () => {
    console.log("order is Auto assign");
    setLoading(true);
    axios
      .post("/delivery/assistant/assign/auto", {
        order_id: item._id,
        auto_assign: !orderAssign,
        expected_delivery_time: expectedTime,
      })
      .then((response) => {
        console.log("Auto Asign Response =", response.data.data);
        setAssistant(response.data.data);
        setLoading(false);
        props.onClose();
        setOrderAssign(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
        setOrderAssign(false);
      });
  };

  const onTimeChange = (value, dateString) => {
    value && SetExpectedTime(new Date(value._d).toISOString());
  };

  const isDisabled = (items) => {
    if (items && items?.has_escalation == true) {
        return true
    } else {
      return false
    }
  }

  if (item.preferences?.custom_time) {
    var orderDeliveryFrom = new Date(
      item.preferences?.custom_time.from
    ).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    var orderDeliveryTO = new Date(
      item.preferences?.custom_time.to
    ).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  useEffect(() => {
    console.log("item, ", item);
    if (item?.is_wholesale) {
      setOrderAssign(true);
    }
  }, [item]);

  return (
    <Modal
      id="AcceptModal"
      className="accept-order"
      style={{ top: 30 }}
      title="Accept Order"
      visible={props.isOpen}
      onCancel={() => {
        props.onClose();
        setOrderAssign(false);
      }}
    >
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <div
          style={{
            width: "50%",
            textAlign: "center",
            padding: "0 10px",
            borderRight: "solid 1px #e5e5e5",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item.preferences?.custom_time && (
            <p>
              Customer Preferred Time: <br />
              <span style={{ color: "#ff4343" }}>
                {orderDeliveryFrom + " - " + orderDeliveryTO}
              </span>
            </p>
          )}
          {item.delivery_type !== "self pickup" &&
            !item.preferences?.custom_time && (
              <p>
                Customer Preferred Time: <br />
                <span style={{ color: "#ff4343" }}> 30 to 55 mins </span>
              </p>
            )}
          {item.delivery_type === "Self Pickup" &&
            !item.preferences?.custom_time && (
              <p>
                Customer Preferred Time: <br />
                <span style={{ color: "#ff4343" }}>
                  30 to 55 mins (self pickup)
                </span>
              </p>
            )}
        </div>
        <div style={{ width: "50%", textAlign: "center", padding: "0 10px" }}>
          <p>Expected Delivery Time :</p>
          <Space direction="vertical" size={12}>
            <DatePicker
              disabledDate={(current) => {
                let customDate = moment();
                return current && current < moment(customDate, "YYYY-MM-DD");
              }}
              showTime
              onChange={onTimeChange}
              defaultValue={expectedTime}
              format="YYYY-MM-DD  HH:mm "
            />
          </Space>
        </div>
      </div>

      <div className="task-assign">
        <p> Auto Assign: </p>
        <Switch
          className={orderAssign ? "auto-assign" : "manual-assign"}
          checked={orderAssign}
          disabled={item?.is_wholesale ? true : isDisabled(item)}
          onChange={() => {
            setOrderAssign(!orderAssign);
            orderAssign === true && setAssistantError();
            orderAssign === false && selectDeliveryAssistant();
          }}
        />
        <p>: Manual Assign </p>
      </div>

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
      ) : assistantError ? (
        <div
          style={{
            padding: "10px 20px",
            textAlign: "center",
            color: "#fd2626",
          }}
        >
          {assistantError}
        </div>
      ) : (
        orderAssign && (
          <div>
            <p style={{ color: "#747474", margin: "5px 10px" }}>
              Select Delivery Assistant :
            </p>
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
        )
      )}

      <div style={{ display: "flex", padding: "10px 5px" }}>
        <Button
          block
          style={{ margin: "0 5px" }}
          onClick={() => {
            props.onClose();
            setOrderAssign(false);
          }}
        >
          Cancel
        </Button>
        <Button
          block
          loading={loading}
          style={{
            margin: "0 5px",
            backgroundColor: "#2196F3",
            borderColor: "#2196F3",
            color: "#fff",
          }}
          onClick={() => {
            !orderAssign ? AutoAssignAssociate() : ManualAssignAssociate();
            acceptOrder();
            setOrderAssign(false);
          }}
        >
          Accept
        </Button>
      </div>
    </Modal>
  );
}

export default AcceptModal;
