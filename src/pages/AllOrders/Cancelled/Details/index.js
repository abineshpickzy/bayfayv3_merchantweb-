import React, { useState, useEffect } from "react";
import "./Details.less";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { Card, Avatar, Spin, message, Row, Col } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ProductItem from "../../../../components/ProductItem";
import axios from "axios";

export default function Details(props) {
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [image, setImage] = useState(null);
  const [assistant, setAssistant] = useState(null);
  const [assistantImage, setAssistantImage] = useState(null);

  const { item, categoryId, storeId } = props;

  let assistantStatus;

  if ("assistant_info" in item && item.assistant_info.assistant_id) {
    if (item.assistant_info.status == 0) assistantStatus = "Not Yet Started";
    if (item.assistant_info.status == 1) assistantStatus = "On the way to Shop";
    if (item.assistant_info.status == 2) assistantStatus = "Waiting to Pickup";
    if (item.assistant_info.status == 3) assistantStatus = "Shipping";
    if (item.status == 5) assistantStatus = "Delivered";
  }

  const fetchAssociateImage = (name) => {
    axios
      .get(`/order/v2/profile/img?img=${name}&width=150`, {
        responseType: "arraybuffer",
      })
      .then((response) => {
        const base64 = btoa(
          new Uint8Array(response.data).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );
        const imageBase64 = "data:;base64," + base64;
        console.log(imageBase64);
        setAssistantImage(imageBase64);
      });
  };

  useEffect(() => {
    if ("assistant_info" in item && item.assistant_info.assistant_id) {
      axios
        .get(`/order/v2/user/${item.assistant_info.assistant_id}/info`)
        .then((response) => {
          const item = response.data.data[0];
          setAssistant(item);
          if ("avatar" in item) {
            fetchAssociateImage(item.avatar[0].name);
          }
        });
    }

    axios
      .post("/order/viewProducts", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("Dispatched ProductList: ", response.data.data);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
    if (item?.customer?.image) {
      fetchUserImage();
    }
  }, []);

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

  let date = new Date(item.ordered.at);
  let orderDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  let orderTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (item?.preferences?.custom_time) {
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
  }

  if (item?.cancelled) {
    var CancelledTime = new Date(item?.cancelled.at).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    var newDate = new Date(item?.cancelled.at);
    var CancelledDate =
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear();
  }

  return (
    <div id="Details">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Cancelled&ensp;/
        </span>
        &ensp;
        <span>{item.order_id}</span>
      </p>

      <Row gutter={16}>
        <Col>
          {" "}
          <Card>
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
                <p style={{ marginBottom: "1em" }}>
                  {item.order_id} &ensp; |&ensp; ₹{item.total_amount.toFixed()}{" "}
                  &ensp;|
                  {item.prices.tip_amount !== undefined ? (
                    <> | &ensp; Tip: {item.prices.tip_amount.toFixed()}</>
                  ) : (
                    ""
                  )}
                </p>
                {item?.status ? (
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
                ) : item.delivery_type === "Self Pickup" &&
                  !item.preferences?.custom_time ? (
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
                    <p style={{ margin: 0, textAlign: "center", width: "50%" }}>
                      Delivery TIme :
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
                ) : item.delivery_type !== "self pickup" &&
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
                    <p style={{ margin: 0, textAlign: "center", width: "50%" }}>
                      Delivery TIme :
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
                        style={{ margin: 0, textAlign: "center", width: "50%" }}
                      >
                        Delivery TIme :
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
                        {orderDeliveryFrom + " - " + orderDeliveryTO}
                      </p>
                    </div>
                  )
                )}
              </div>
              <div className="item-order-info">
                <p style={{ color: "#949494" }}>
                  Order placed at {orderTime + " - " + orderDate}
                </p>
                <div>
                  <LocationOnIcon color="primary" />_ _ _ _ _ _ _ _ _ _ _ _ _ _
                  _
                  <LocationOnIcon color="secondary" />
                </div>
                <p style={{ marginTop: "-5px" }}>
                  {item?.distance?.toFixed(1)}km
                </p>
                <p>
                  Status :
                  <span style={{ color: "#f33434" }}>
                    {item.status === "Cancelled by User"
                      ? "Cancelled by User"
                      : "Cancelled by Admin"}
                  </span>
                </p>
              </div>
            </div>
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
                    borderRadius: "2px",
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
              productList.map((item, index) => {
                return (
                  <ProductItem
                    openProductInfo={() => props.openProductInfo(item)}
                    status="Cancelled"
                    item={item}
                    key={index}
                  />
                );
              })
            )}
          </Card>
        </Col>
        <Col>
          <div className="side-cards">
            <Card>
              {"assistant_info" in item && item.assistant_info.assistant_id ? (
                assistant ? (
                  <div>
                    <div className="assistant-details">
                      <Avatar
                        size={64}
                        src={
                          assistantImage
                            ? assistantImage
                            : "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg"
                        }
                      />
                      <div className="info">
                        <p style={{ color: "#8A8A8A" }}>Delivered By</p>
                        <p>
                          {assistant.first_name} {assistant.last_name}
                        </p>
                        <p style={{ color: "#028BE3" }}>
                          +{assistant.mobile.dialing_code}{" "}
                          {assistant.mobile.number}
                        </p>
                        <p>Current location</p>
                      </div>
                      <div
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          navigator.clipboard.writeText(
                              `https://maps.google.com/?q=${assistant.location.coordinates[1]},${assistant.location.coordinates[0]}`
                          );
                          message.success(
                              "Copied, paste in the browser address bar"
                          );
                        }}
                        className="icon"
                      >
                        <img src="/assets/map-icon.svg" alt="map-icon" />
                      </div>
                    </div>
                  </div>
                ) : null
              ) : (
                <span style={{ display: "flex", justifyContent: "center" }}>
                  Associate not yet assigned
                </span>
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
}
