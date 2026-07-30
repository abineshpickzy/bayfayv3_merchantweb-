import React, { useState, useEffect } from "react";
import "./Details.less";
import { DownloadOutlined } from "@ant-design/icons";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import {
  Skeleton,
  Switch,
  Card,
  Avatar,
  Button,
  Image,
  Spin,
  message,
  Popconfirm,
} from "antd";
import { Link } from "react-router-dom";
import ProductItem from "../../../../components/ProductItem";
import AcceptModal from "../AcceptModal";
import CancelOrder from "../../../../components/CancelModel";
import RefundModal from "../../../../components/RefundModal";
import axios from "axios";

export default function Details(props) {
  const [CancelModal, setCancelModal] = useState(false);
  const [acceptModel, setAcceptModel] = useState(false);
  const [isRefundModal, setIsRefundModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [image, setImage] = useState(null);
  const [refundProductMoney, setRefundProductMoney] = useState(null);

  const { item, categoryId, storeId } = props;

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
        props.goBack();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const downloadNoteImage = () => {
    axios
      .get("/order/notes/download?file=" + item.notes.image, {
        responseType: "blob",
      })
      .then(({ data }) => {
        console.log(data);
        const downloadUrl = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", "file.png");
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  };

  useEffect(() => {
    if (item.has_escalation) {
      axios
        .post("/order/escalate/viewProducts", {
          order_id: item._id,
          shop_id: storeId,
          category_id: categoryId,
        })
        .then((response) => {
          console.log("New order ProductList =", response.data.data);
          setProductList(response.data.data);
          setLoading(false);
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
        });
    } else {
      axios
        .post("/order/viewProducts", {
          order_id: item._id,
          shop_id: storeId,
          category_id: categoryId,
        })
        .then((response) => {
          console.log("Neworder ProductList =", response.data.data);
          setProductList(response.data.data);
          setLoading(false);
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
        });
    }
    if (item?.customer?.image) {
      fetchUserImage();
    }
  }, []);

  let date = new Date(item.ordered.at);
  let orderDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  let orderTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (item.preferences.custom_time) {
    console.log(new Date(item.preferences.custom_time.from));
    console.log(new Date(item.preferences.custom_time.to));
    var orderDeliveryFrom = new Date(
      item.preferences.custom_time.from
    ).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    var orderDeliveryTO = new Date(
      item.preferences.custom_time.to
    ).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    var expectedDate = null;

    if (
      new Date(item.preferences?.custom_time.to).getDate() >
        new Date().getDate() ||
      new Date(item.preferences?.custom_time.to).getMonth() >
        new Date().getMonth()
    ) {
      let newDate = new Date(item.preferences?.custom_time.to);

      expectedDate =
        newDate.getDate() +
        "/" +
        (newDate.getMonth() + 1) +
        "/" +
        newDate.getFullYear();
    }
  }

  return (
    <div id="Details">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          New Order&ensp;/
        </span>
        &ensp;
        <span>{item.order_id}</span>
      </p>

      <Card className="orderer-detail">
        <div className="items">
          <Avatar
            size={64}
            src={
              image
                ? image
                : "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
            }
          >
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
              {item.order_id} &ensp; |&ensp; ₹{item.total_amount.toFixed()}{" "}
              &ensp;
              {item.prices.tip_amount != undefined ? (
                <> | &ensp; Tip: {item.prices.tip_amount.toFixed()}</>
              ) : (
                ""
              )}
            </p>
            <p>Payment Status: {item.payment_mode}</p>

            {item.delivery_type === "Self Pickup" &&
              !item.preferences.custom_time && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "10px 0",
                    padding: "5px 15px",
                    border: "solid 1px #2db115",
                    background: "#cff5c5",
                    borderRadius: "2px",
                  }}
                >
                  <p style={{ margin: 0, textAlign: "center", width: "50%" }}>
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
                    30 to 55 mins (self pickup)
                  </p>
                </div>
              )}

            {item.delivery_type !== "self pickup" &&
              !item.preferences.custom_time && (
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
                  <p style={{ margin: 0, textAlign: "center", width: "50%" }}>
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
              )}

            {item.preferences.custom_time && (
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
                <p style={{ margin: 0, textAlign: "center", width: "50%" }}>
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
                    flexDirection: "column",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    {orderDeliveryFrom + " - " + orderDeliveryTO}
                  </p>
                  {expectedDate && <p style={{ margin: 0 }}>{expectedDate}</p>}
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
            <p style={{ marginTop: "-5px" }}>{item?.distance?.toFixed(1)}km</p>
            <p>
              Status :{" "}
              <span
                style={
                  item.has_escalation || item.is_escalated_order
                    ? { color: "#f33434" }
                    : { color: "#5eb662" }
                }
              >
                {item.has_escalation || item.is_escalated_order
                  ? "Replacement /Undelivered"
                  : "New Order"}
              </span>
            </p>
          </div>
        </div>
        {item.has_escalation ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "0 10px 0px 90px",
              margin: "5px 0",
            }}
          >
            {item.payment_mode === "Online" && (
              <Button
                danger
                onClick={() => {
                  setRefundProductMoney(false);
                  setIsRefundModal(true);
                }}
                style={{
                  borderColor: "#c5c5c5",
                }}
              >
                Refund
              </Button>
            )}
            <Button
              type="primary"
              onClick={() => setAcceptModel(true)}
              style={{ background: "#0275d8", border: "#0275d8" }}
            >
              Accept
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-evenly",
              paddingRight: "140px",
              margin: "5px 0",
            }}
          >
            <Button
              danger
              onClick={() => setCancelModal(true)}
              style={{
                borderColor: "#c5c5c5",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => setAcceptModel(true)}
              style={{ background: "#0275d8", border: "#0275d8" }}
            >
              Accept
            </Button>
          </div>
        )}
      </Card>

      {item.notes && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "15px 0",
            padding: "5px 15px",
            border: "solid 1px #2db115",
            background: "#cff5c5",
            borderRadius: "2px",
            width: "700px",
          }}
        >
          <p style={{ margin: "0", width: "60%" }}> {item.notes.text}</p>

          {item.notes.image && (
            <div
              onClick={() => downloadNoteImage()}
              style={{
                border: "solid 1px #cccccc",
                background: "#ffffff",
                borderRadius: "5px",
                padding: "5px",
              }}
            >
              <DownloadOutlined /> Download attachment
            </div>
          )}
        </div>
      )}

      <Card
        title="Product List"
        className="product-list"
        extra={"Total Products: " + productList.length}
      >
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
        ) : (
          productList.map((o, index) => {
            return (
              <ProductItem
                status="New Order"
                openReason={() => props.openReason(o)}
                openProductInfo={() => props.openProductInfo(o)}
                openRefundModal={() => {
                  setRefundProductMoney(true);
                  setIsRefundModal(o);
                }}
                item={o}
                key={index}
              />
            );
          })
        )}
      </Card>
      <AcceptModal
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        history={props.history}
        onAccept={props.goBack}
        isOpen={acceptModel}
        onClose={() => setAcceptModel(false)}
      />
      <RefundModal
        refundProductMoney={refundProductMoney}
        ProductItem={isRefundModal}
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        isRefundModal={isRefundModal}
        onClose={() => setIsRefundModal(false)}
      />
      <CancelOrder
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        history={props.history}
        onCancelAccept={props.goBack}
        isCancelOrderOpen={CancelModal}
        onClose={() => setCancelModal(false)}
      />
    </div>
  );
}
