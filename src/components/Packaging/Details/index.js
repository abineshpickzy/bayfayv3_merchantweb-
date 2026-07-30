import React, { useState, useEffect } from "react";
import "./Details.less";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import { DownloadOutlined } from "@ant-design/icons";
import { Card, Avatar, Button, Spin, Row, Col, message } from "antd";
import ProductItem from "../../ProductItem";
import ConformationAssociate from "../../ConformationAssociate";
import ContactCustomer from "../../ContactCustomerModal";
import InvoiceModal from "../../InvoiceModal";
import CancelOrder from "../../CancelModel";
import DispatchModal from "../DispatchModal";
import axios from "axios";

export default function Details(props) {
  const [Conformation, setConformation] = useState(false);
  const [isInvoice, setIsInvoice] = useState(false);
  const [CancelModal, setCancelModal] = useState(false);
  const [dispatchModal, setDispatchModal] = useState(false);
  const [contactCustomer, setContactCustomer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [assignLoading, setAssignLoading] = useState(true);
  const [assistantAssigned, setAssistantAssigned] = useState(false);
  const [productList, setProductList] = useState([]);
  const [image, setImage] = useState(null);
  const [isAssign, setIsAssign] = useState(null);
  const [checkedID, setCheckedID] = useState([]);

  const { item, categoryId, storeId } = props;

  useEffect(() => {
    axios
      .post("/order/viewProducts", {
        order_id: item._id,
        shop_id: storeId,
        category_id: categoryId,
      })
      .then((response) => {
        console.log("Packaging productList = ", response.data.data);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });

    axios
      .post("/delivery/assistant/assign/auto/view", {
        order_id: item._id,
      })
      .then((response) => {
        console.log(" Auto Assign or not = ", response.data.success);
        setIsAssign(response.data.success);
        setAssignLoading(false);
      })
      .catch((error) => {
        setAssignLoading(false);
      });
    if (item?.customer?.image) {
      fetchUserImage();
    }
  }, []);

  useEffect(() => {
    if (checkedID.length === productList.length && productList.length !== 0) {
      if (checkedID !== 0) {
        setDispatchModal(true);
      }
    }
  }, [checkedID]);

  const onSelectItem = (e, id) => {
    console.log("checked =", e);
    if (e === true) {
      if (checkedID.includes(id) === false) {
        setCheckedID([...checkedID, id]);
      }
    }
    if (e === false) {
      console.log("include", checkedID.includes(id));
      if (checkedID.includes(id) === true) {
        setCheckedID(checkedID.filter((checkedID) => checkedID !== id));
      }
    }
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
  return (
    <div id="Details">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Packaging&ensp;/
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
                    {item.order_id} &ensp; |&ensp; ₹{item.amount.toFixed()}{" "}
                    &ensp;
                    {item.tip_amount !== undefined ? (
                      <> | &ensp; Tip: {item.tip_amount.toFixed()}</>
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
                <Button
                  type="primary"
                  onClick={() => setContactCustomer(true)}
                  style={{
                    background: "#0275d8",
                    border: "#0275d8",
                    padding: "1px",
                  }}
                >
                  Contact Customer
                </Button>
                <Button
                  type="primary"
                  style={{ background: "#0275d8", border: "#0275d8" }}
                  onClick={() => setIsInvoice(true)}
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
                      status="Packaging"
                      item={item}
                      key={index}
                      onSelectItem={(e) => onSelectItem(e, item.id)}
                    />
                  );
                })
              )}
            </Card>
          </div>
        </Col>

        <Col>
          <div className="side-cards">
            <Card className="shop-contect-details">
              {assistantAssigned || item?.assistant_info ? (
                <Button disabled>Assigned</Button>
              ) : isAssign ? (
                <Button
                  type="primary"
                  style={{ background: "#0275d8", border: "#0275d8" }}
                  loading={assignLoading}
                  onClick={() => {
                    setConformation(true);
                  }}
                >
                  Order in the Delivery Queue
                </Button>
              ) : (
                <Button
                  type="primary"
                  style={{ background: "#0275d8", border: "#0275d8" }}
                  loading={assignLoading}
                  onClick={() => {
                    setConformation(true);
                  }}
                >
                  Assign To Associate
                </Button>
              )}

              <Button
                type="primary"
                onClick={() => setDispatchModal(true)}
                style={{
                  background: "#5ea807",
                  border: "#5ea807",
                  width: "120px",
                }}
              >
                Dispatch
              </Button>
              <Button onClick={() => setIsInvoice(true)}>Print Invoice</Button>
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
                    {item?.store_info?.display_name}
                  </span>
                </p>
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
      <ConformationAssociate
        isConformationOpen={Conformation}
        item={item}
        isConformationClose={() => setConformation(false)}
        Assigned={() => {
          setAssistantAssigned(true);
        }}
      />
      <InvoiceModal
        isInvoiceOpen={isInvoice}
        history={props.history}
        item={item}
        productList={productList}
        storeId={storeId}
        isInvoiceClose={() => setIsInvoice(false)}
      />
      <CancelOrder
        history={props.history}
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        onCancelAccept={props.goBack}
        isCancelOrderOpen={CancelModal}
        onClose={() => setCancelModal(false)}
        // onCancelOrderClose={() => setCancelModal(false)}
      />
      <DispatchModal
        history={props.history}
        onDispatch={props.goBack}
        storeId={storeId}
        categoryId={categoryId}
        item={item}
        checkedID={checkedID}
        productList={productList}
        isDispatchOpen={dispatchModal}
        onClose={() => setDispatchModal(false)}
      />

      <ContactCustomer
        item={item}
        storeId={storeId}
        isContactCustomer={contactCustomer}
        onClose={() => setContactCustomer(false)}
      />
    </div>
  );
}
