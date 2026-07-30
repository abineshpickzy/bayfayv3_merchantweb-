import React, { useState, useEffect } from "react";
import "./Details.less";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { Card, Avatar, Button, Spin, Row, Col, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import ProductItem from "../../ProductItem";
import InvoiceModal from "../../InvoiceModal";
import RefundModal from "../../RefundModal";
import axios from "axios";

export default function Details(props) {
  const [isInvoice, setIsInvoice] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [isRefundModal, setIsRefundModal] = useState(false);
  const [image, setImage] = useState(null);
  const { item, storeId, categoryId } = props;

  useEffect(() => {
    axios
      .post("/order/escalate/viewProducts", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("replacement ProductList: ", response.data.data);
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

  const acceptEscalateOrder = () => {
    axios
      .patch("/order/escalate/acceptOrder", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
        expectedTime: new Date().toISOString(),
      })
      .then((response) => {
        console.log("replacement ProductList: ", response.data.data);
        setProductList(response.data.data);
        props.goBack();
        let newurl = window.location.pathname + "?refreshCount=true";
        props.history.push(newurl);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  let date = new Date(item.ordered);
  let orderDate =
    date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();

  let orderTime = date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (item.preferences.custom_time) {
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

  if (item?.verified) {
    var CancelledTime = new Date(item?.verified).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    var newDate = new Date(item?.verified);
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
          Replacement / Refund&ensp;/
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
                    {item.order_id} &ensp; |&ensp; ₹{item.amount.toFixed()}
                    &ensp;|
                    {item.tip_amount !== undefined ? (
                      <> | &ensp; Tip: {item.tip_amount.toFixed()}</>
                    ) : (
                      ""
                    )}
                  </p>
                  <div style={{ marginBottom: "1em", width: "340px" }}>
                    <p>
                      RP / RF Requested On :
                      {CancelledTime + " - " + CancelledDate}
                    </p>
                    <p>Delivery Method : {item.delivery_type}</p>
                  </div>
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
                    Status :
                    <span
                      style={
                        item?.refund_request_initiate !== true
                          ? { color: "#f33434" }
                          : { color: "#5eb662" }
                      }
                    >
                      {item?.refund_request_initiate === true
                        ? " Refund Request"
                        : " Replacement/Undelivered"}
                    </span>
                  </p>
                  <p>
                    Payment :
                    <span
                      style={
                        item.payment_type !== "Online"
                          ? { color: "#f33434" }
                          : { color: "#5eb662" }
                      }
                    >
                      {" " + item.payment_type}
                    </span>
                  </p>
                </div>
              </div>
              <div
                style={{
                  margin: "-25px 200px 0px 20px",
                  display: "flex",
                  justifyContent: "space-evenly",
                }}
              >
                <Button
                  type="primary"
                  onClick={() => setIsInvoice(true)}
                  style={{ background: "#0275d8", border: "#0275d8" }}
                >
                  Print Bill
                </Button>
                <Button disabled type="primary" onClick={acceptEscalateOrder}>
                  Accept
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
                  borderRadius: "5px",
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
              extra={"Total Products: " + productList?.length}
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
                productList?.map((item, index) => {
                  return (
                    <ProductItem
                      openReason={() => props.openReason(item)}
                      openProductInfo={() => props.openProductInfo(item)}
                      status="Replacement"
                      item={item}
                      key={index}
                      openRefundModal={() => {
                        setIsRefundModal(item);
                      }}
                    />
                  );
                })
              )}
            </Card>
          </div>
        </Col>

        <Col>
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
                        item?.customer.mobile?.number}
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
                        {item?.address &&
                          item?.address?.street +
                            ", " +
                            item?.address?.area +
                            ", " +
                            item?.address?.zipcode}
                      </span>
                    </div>
                  </p>
                )}
              </div>
            </Card>
          </div>
          {item?.store_info && (
            <div className="side-cards">
              <Card
                title="Shop contact details : "
                className="shop-contect-details"
              >
                <div>
                  {item?.store_info && (
                    <p>
                      Shop Name:
                      <br />
                      &ensp;&ensp;
                      <span style={{ color: "#0275d8" }}>
                        {item?.store_info?.display_name}
                      </span>
                    </p>
                  )}
                  {item?.store_info && (
                    <p style={{ marginBottom: "0px" }}>
                      Mobile number:
                      <br />
                      &ensp;&ensp;
                      <span style={{ color: "#0275d8" }}>
                        +
                        {item?.store_info?.mobile?.primary?.dialing_code +
                          " " +
                          item?.store_info.mobile?.primary?.number}
                      </span>
                    </p>
                  )}
                  {item?.store_info && (
                    <p style={{ marginBottom: "0px" }}>
                      Location:
                      <br />
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <LocationOnIcon color="primary" />
                        &ensp;
                        <span style={{ color: "#0275d8" }}>
                          {item?.store_info?.address?.street +
                            ", " +
                            item?.store_info?.address?.zipcode}
                        </span>
                      </div>
                    </p>
                  )}
                </div>
              </Card>
            </div>
          )}
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
      <RefundModal
        refundProductMoney={true}
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        ProductItem={isRefundModal}
        isRefundModal={isRefundModal}
        onClose={() => setIsRefundModal(false)}
      />
    </div>
  );
}
