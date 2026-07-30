import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Item.less";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import {
  Skeleton,
  Switch,
  Card,
  Avatar,
  Button,
  message,
  Popconfirm,
} from "antd";
import { Image } from "../Image";
import axios from "axios";

const { Meta } = Card;

export default function Index(props) {
  const { item, categoryId, storeId, status } = props;
  const [image, setImage] = useState(null);

  const fetchUserImage = () => {
    if (
      !item?.customer?.image ||
      !item.customer ||
      !item.customer.image ||
      item.customer === undefined ||
      item.customer.image === undefined
    ) {
      return;
    }

    axios
      .get(
        "/order/customer/image?file=" +
          item?.customer?.image +
          "&format=jpeg&width=500&height=500",
        { responseType: "arraybuffer" }
      )
      .then((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const imageBase64 = "data:;base64," + base64;
        setImage(imageBase64);
      });
  };

  const escalateOrder = () => {
    axios
      .patch("/order/escalate/escalateOrder", {
        category_id: categoryId,
        shop_id: storeId,
        order_id: item._id,
      })
      .then((response) => {
        console.log(response.data.data);
        props.refreshList();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  useEffect(fetchUserImage, []);

  let date = new Date(item.ordered);
  let orderDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  let orderTime = date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  if (item.preferences?.custom_time) {
    var orderDeliveryFrom = new Date(
      item.preferences?.custom_time.from
    ).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    var orderDeliveryTO = new Date(
      item.preferences?.custom_time.to
    ).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else if (item.preferences?.expected_time) {
    var expectedTime = new Date(
      item.preferences?.expected_time.at
    ).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    var newDate = new Date(item.preferences?.expected_time.at);
    var expectedDate =
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear();
  }

  if (item?.delivered) {
    var DeliveredTime = new Date(item?.delivered).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    var newDate = new Date(item?.delivered);
    var DeliveredDate =
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear();
  }

  if (item?.cancelled) {
    var CancelledTime = new Date(item?.cancelled).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    var newDate = new Date(item?.cancelled);
    var CancelledDate =
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear();
  }

  return (
    <div id="OrderItem">
      <Card>
        <div className="items">
          <Avatar size={64} src={image ? image : "/assets/avatar.jpg"}>
            U
          </Avatar>
          <div className="item_info">
            <h2
              style={{
                marginBottom: "10px",
                lineHeight: "initial",
                fontSize: "19px",
                color: "#424242",
              }}
            >
              {item.customer.name}
            </h2>
            <p style={{ marginBottom: "5px" }}>
              {item.order_id}&ensp;|&ensp;₹{item.amount.toFixed()}&ensp;{" "}
              {item.tip_amount !== undefined ? (
                <> | &ensp; Tip: {item.tip_amount.toFixed()}</>
              ) : (
                ""
              )}
            </p>
            {"New Order" !== props.status && (
              <p style={{ marginBottom: "10px" }}>
                Payment Status: {item.payment_type}
              </p>
            )}
            {(item.delivered && "Delivered" === props.status) ||
            "Replacement" === props.status ? (
              <div style={{ marginBottom: "1em", width: "340px" }}>
                <p style={{ margin: 0 }}>
                  Delivered On : &ensp;
                  <span>{DeliveredTime + " - " + DeliveredDate}</span>
                </p>
              </div>
            ) : "Cancelled" === props.status ? (
              item.cancelled ? (
                <div style={{ marginBottom: "1em", width: "340px" }}>
                  <p style={{ margin: 0 }}>
                    Cancelled at: &ensp;
                    <span>{CancelledTime + " - " + CancelledDate}</span>
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom: "1em", width: "340px" }}></div>
              )
            ) : "New Order" === props.status ? (
              item.delivery_type === "Self-Pickup" &&
              item.preferences?.is_anytime ? (
                <div
                  style={{
                    display: "flex",
                    border: "solid 1px #52c41a",
                    background: "#9eec77",
                    marginBottom: "1em",
                    borderRadius: "2px",
                    width: "340px",
                    height: "44px",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      textAlign: "center",
                      width: "50%",
                      padding: " 0 15px",
                    }}
                  >
                    Customer Preferred Delivery time :
                  </p>

                  <p
                    style={{
                      margin: 0,
                      textAlign: "center",
                      width: "50%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      flexDirection: "column",
                      fontWeight: "bold",
                      padding: "0 15px",
                    }}
                  >
                    30 to 55 mins
                    <span style={{ color: "#f33434" }}>(self pickup)</span>
                  </p>
                </div>
              ) : item.delivery_type !== "Self-Pickup" &&
                !item.preferences?.custom_time ? (
                <div
                  style={{
                    display: "flex",
                    border: "solid 1px #f33434",
                    background: "#fbe9e9",
                    marginBottom: "1em",
                    borderRadius: "2px",
                    width: "340px",
                    height: "44px",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      textAlign: "center",
                      width: "50%",
                      padding: " 0 15px",
                    }}
                  >
                    Customer Preferred Delivery time :
                  </p>
                  <p
                    style={{
                      margin: 0,
                      textAlign: "center",
                      width: "50%",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      fontWeight: "bold",
                      padding: "0 15px",
                    }}
                  >
                    30 to 55 mins
                  </p>
                </div>
              ) : (
                item.preferences?.custom_time && (
                  <div
                    style={{
                      display: "flex",
                      border: "solid 1px #ffc145",
                      background: "#fff59c",
                      marginBottom: "1em",
                      borderRadius: "2px",
                      width: "340px",
                      height: "44px",
                      alignItems: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        textAlign: "center",
                        width: "50%",
                        padding: " 0 15px",
                      }}
                    >
                      Customer Preferred Delivery time :
                    </p>

                    {/* // <p style={{ margin: 0, textAlign: "center", width: "50%" , padding:" 0 15px"}}>
                    //   Delivery Time :
                    // </p> */}

                    <p
                      style={{
                        margin: 0,
                        textAlign: "center",
                        width: "50%",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        fontWeight: "bold",
                        padding: "0 15px",
                      }}
                    >
                      {orderDeliveryFrom + " - " + orderDeliveryTO}
                    </p>
                  </div>
                )
              )
            ) : ("Packaging" === props.status ||
                "Shipping" === props.status ||
                "Dispatched" === props.status) &&
              !item.preferences?.is_anytime ? (
              <div
                style={{
                  display: "flex",
                  border: "solid 1px #f33434",
                  background: "#fbe9e9",
                  marginBottom: "1em",
                  borderRadius: "2px",
                  width: "340px",
                  height: "44px",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    width: "50%",
                    padding: " 0 15px",
                  }}
                >
                  Shop Expected Delivery Time :
                </p>
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    fontWeight: "bold",
                    padding: "0 8px",
                  }}
                >
                  30 to 55 mins
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  border: "solid 1px #ffc145",
                  background: "#fff59c",
                  marginBottom: "1em",
                  borderRadius: "2px",
                  width: "340px",
                  height: "44px",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    width: "50%",
                    padding: " 0 15px",
                  }}
                >
                  Shop Expected Delivery Time :
                </p>

                <p
                  style={{
                    margin: 0,
                    textAlign: "center",
                    width: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    fontWeight: "bold",
                    padding: "0 8px",
                  }}
                >
                  {expectedTime + " - " + expectedDate}
                </p>
              </div>
            )}
          </div>
          <div className="item-order-info">
            <p style={{ color: "#949494" }}>
              Order placed at {orderTime + " - " + orderDate}
            </p>
            <div>
              <LocationOnIcon color="primary" />_ _ _ _ _ _ _ _ _ _ _ _ _ _ _
              <LocationOnIcon color="secondary" />
            </div>
            <p style={{ marginTop: "-5px" }}>
              {item.distance && item.distance.toFixed(1)}km
            </p>
            <p>
              Status : &ensp;
              {("Packaging" === props.status ||
                "Shipping" === props.status ||
                "Dispatched" === props.status ||
                "New Order" === props.status) &&
              (item.has_escalation || item.is_escalated_order) ? (
                <span style={{ color: "#f33434" }}>
                  Replacement /Undelivered
                </span>
              ) : "Delivered" === props.status ? (
                <span
                  style={
                    item.status !== "Verified"
                      ? { color: "#f33434" }
                      : { color: "#5eb662" }
                  }
                >
                  {item.status}
                </span>
              ) : "Cancelled" === props.status ? (
                <span style={{ color: "#f33434" }}>
                  {item.status === "Cancelled by User"
                    ? "Cancelled by User"
                    : "Cancelled by Admin"}
                </span>
              ) : "Replacement" === props.status ? (
                <span
                  style={
                    item?.refund_request_initiate !== true
                      ? { color: "#f33434" }
                      : { color: "#5eb662" }
                  }
                >
                  {item?.refund_request_initiate === true
                    ? "Refund Request"
                    : "Replacement/Undelivered"}
                </span>
              ) : (
                <span style={{ color: "#5eb662" }}>New Order</span>
              )}
            </p>
          </div>
        </div>

        {/* when packaging or dispatched or shipping page open then list show only Cancel and view order button */}
        {("Packaging" === props.status ||
          "Shipping" === props.status ||
          "Dispatched" === props.status) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "0 200px 0 43px",
              margin: "10px 0",
            }}
          >
            <Button
              danger
              onClick={props.onCancelAccept}
              style={{
                borderColor: "#c5c5c5",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              style={{ background: "#0275d8", border: "#0275d8" }}
              onClick={props.clickViewOrder}
            >
              View Order
            </Button>
          </div>
        )}

        {("Delivered" === props.status ||
          "Cancelled" === props.status ||
          "Replacement" === props.status) && (
          <div
            style={{
              display: "flex",
              margin: "-5px 0 10px 85px",
            }}
          >
            <Button
              type="primary"
              style={{ background: "#0275d8", border: "#0275d8" }}
              onClick={props.clickViewOrder}
            >
              View Order
            </Button>
          </div>
        )}

        {/* when new order page open then this buttons shows */}

        {item.has_escalation && "New Order" === props.status ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "0px 10px 0px 70px",
              margin: "10px 0",
            }}
          >
            {item.payment_type === "Online" && (
              <Button
                danger
                onClick={props.isRefundMdal}
                style={{
                  borderColor: "#c5c5c5",
                }}
              >
                Refund
              </Button>
            )}

            <Button
              type="primary"
              onClick={props.onAccept}
              style={{ background: "#0275d8", border: "#0275d8" }}
            >
              Accept
            </Button>
            <Button
              style={{
                color: "#0d7bd9",
                borderColor: "#c5c5c5",
              }}
              onClick={props.clickViewOrder}
            >
              View Order
            </Button>
            <Popconfirm
              title="Do you want to escalate the whole order?"
              onConfirm={escalateOrder}
              okText="Yes"
              cancelText="No"
            >
              <Button
                danger
                style={{
                  borderColor: "#c5c5c5",
                }}
              >
                Escalate
              </Button>
            </Popconfirm>
          </div>
        ) : (
          "New Order" === props.status && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                padding: "0px 10px 0px 50px",
                margin: "10px 0",
              }}
            >
              <Button
                danger
                onClick={props.onCancelAccept}
                style={{
                  borderColor: "#c5c5c5",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={props.onAccept}
                style={{ background: "#0275d8", border: "#0275d8" }}
              >
                Accept
              </Button>
              <Button
                style={{
                  color: "#0d7bd9",
                  borderColor: "#c5c5c5",
                }}
                onClick={props.clickViewOrder}
              >
                View Order
              </Button>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
