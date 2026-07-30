import React, { useState, useEffect } from "react";
import "./Details.less";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { DownloadOutlined } from "@ant-design/icons";
import { Card, Avatar, Button, Spin, Row, Col, message } from "antd";
import ProductItem from "../../../../components/ProductItem";
import CancelOrder from "../../../../components/CancelModel";
import InvoiceModal from "../../InvoiceModalAllOrders";
import axios from "axios";

export default function Details(props) {
  const [CancelModal, setCancelModal] = useState(false);
  const [isInvoice, setIsInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [assistantInfo, setAssistantInfo] = useState([]);
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
        console.log("Shipping ProductList=", response.data.data);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });

    if (item.assistant_info) {
      axios
        .get("/order/user/" + item?.assistant_info?.assistant_id + "/info")
        .then((response) => {
          console.log("assistant info , ", response.data.data);
          setAssistantInfo(response.data.data);
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

  const deliveredOrder = () => {
    axios
      .patch("/order/deliverTheOrder", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("delivered order ===", response.data.data);
        let newurl = window.location.pathname + "?refreshCount=true";
        props.history.push(newurl);
        props.goBack();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const openTracker = () => {
    let your_lat = assistantInfo[0].location.coordinates[1];
    let your_lng = assistantInfo[0].location.coordinates[0];
    window.open(
      "http://maps.google.com/maps?q=" + your_lat + "," + your_lng,
      "_blank"
    );
  };

  let date = new Date(item.ordered.at);
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

  return (
    <div id="Details">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Shipping&ensp;/
        </span>
        &ensp;
        <span>{item.order_id}</span>
      </p>

      <Row gutter={16}>
        <Col>
          <div style={{ maxHeight: "110vh", overflow: "auto" }}>
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
                    {item.order_id} &ensp; |&ensp; ₹
                    {item.total_amount.toFixed()} &ensp;
                    {item.prices.tip_amount !== undefined ? (
                      <> | &ensp; Tip: {item.prices.tip_amount.toFixed()}</>
                    ) : (
                      ""
                    )}
                  </p>
                  {!item.preferences?.is_anytime ? (
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
                          padding: "0 15px",
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
                          padding: "0 15px",
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
                    <LocationOnIcon color="primary" />_ _ _ _ _ _ _ _ _ _ _ _ _
                    _ _
                    <LocationOnIcon color="secondary" />
                  </div>
                  <p style={{ marginTop: "-5px" }}>
                    {item?.distance?.toFixed(1)}km
                  </p>
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
                  {/* <p>Payment Status: {item.payment_type}</p> */}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  padding: "0 20px 0 35px",
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
                {item.assistant_info && (
                  <Button
                    type="primary"
                    onClick={openTracker}
                    style={{
                      background: "#0275d8",
                      border: "#0275d8",
                      padding: "1px",
                    }}
                  >
                    Track Order
                  </Button>
                )}
                <Button
                  type="primary"
                  onClick={() => setIsInvoice(true)}
                  style={{ background: "#0275d8", border: "#0275d8" }}
                >
                  Print Bill
                </Button>
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
                      status="Shipping"
                      item={item}
                      key={index}
                    />
                  );
                })
              )}
            </Card>
          </div>
        </Col>
        <Col>
          <div className="side-cards">
            <Card
              title="Shop contact details : "
              className="shop-contect-details"
            >
              {item.assistant_info && (
                <Button
                  type="primary"
                  onClick={openTracker}
                  style={{
                    background: "#0275d8",
                    border: "#0275d8",
                    padding: "1px",
                  }}
                >
                  Track Order
                </Button>
              )}
              <Button
                type="primary"
                onClick={deliveredOrder}
                style={{
                  background: "#5ea807",
                  border: "#5ea807",
                  width: "120px",
                }}
              >
                Deliver Order
              </Button>
              <Button onClick={() => setIsInvoice(true)}>Print Invoice</Button>
            </Card>
          </div>

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
                    <div className="status">
                      Status:
                      <button
                        style={{
                          cursor: "default",
                          backgroundColor: "#03a9f4",
                          padding: "3px 15px",
                          border: "none",
                          borderRadius: "10px",
                          marginLeft: "15px",
                        }}
                      >
                        {assistantStatus}
                      </button>
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

          <div className="side-cards">
            <Card title="Customer details: " className="shop-contect-details">
              <div>
                <p>
                  Customer Name:
                  <br />
                  &ensp;&ensp;
                  <span style={{ color: "#0275d8" }}>
                    {item?.customer.name}
                  </span>
                </p>
                <p>
                  Mobile number:
                  <br />
                  &ensp;&ensp;
                  <span style={{ color: "#0275d8" }}>
                    {item?.customer?.mobile &&
                      item?.customer?.mobile?.dialing_code +
                        " " +
                        item?.customer.mobile?.number}{" "}
                  </span>
                </p>
                {item.delivery_type !== "self pickup" && (
                  <p style={{ marginBottom: "0px" }}>
                    Location:
                    <br />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <LocationOnIcon color="primary" />
                      &ensp;
                      <span style={{ color: "#0275d8" }}>
                        {item?.customer?.address &&
                          item?.customer?.address?.street +
                            ", " +
                            item?.customer?.address?.area +
                            ", " +
                            item?.customer?.address?.zipcode}
                      </span>
                    </div>
                  </p>
                )}
              </div>
            </Card>
          </div>
          <div className="side-cards">
            <Card
              title="Shop contact details : "
              className="shop-contect-details"
            >
              <div>
                <p>
                  Shop Name:
                  <br />
                  &ensp;&ensp;
                  <span style={{ color: "#0275d8" }}>
                    {item?.store?.display_name}
                  </span>
                </p>
                <p style={{ marginBottom: "0px" }}>
                  Location:
                  <br />
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <LocationOnIcon color="primary" />
                    &ensp;
                    <span style={{ color: "#0275d8" }}>
                      {item?.store?.address?.street +
                        ", " +
                        item?.store?.address?.zipcode}
                    </span>
                  </div>
                </p>
              </div>
            </Card>
          </div>
          {/* {item.delivery_type !== "self pickup" && (
            <div className="side-cards">
              <Card
                title="Delivery details : "
                className="shop-contect-details"
              >
                <div>
                  <p style={{ marginBottom: "0px" }}>
                    Address:
                    <br />
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <LocationOnIcon color="primary" />
                      &ensp;
                      <span style={{ color: "#0275d8" }}>
                        {item.address &&
                          item.address.street +
                            ", " +
                            item.address.area +
                            ", " +
                            item.address.zipcode}
                      </span>
                    </div>
                  </p>
                </div>
              </Card>
            </div>
          )} */}
        </Col>
      </Row>
      <InvoiceModal
        isInvoiceOpen={isInvoice}
        history={props.history}
        item={item}
        productList={productList}
        storeId={storeId}
        isInvoiceClose={() => setIsInvoice(false)}
      />
      <CancelOrder
        storeId={storeId}
        categoryId={categoryId}
        onCancelAccept={props.goBack}
        item={item}
        isCancelOrderOpen={CancelModal}
        onClose={() => setCancelModal(false)}
      />
    </div>
  );
}
