import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./ProductItem.less";
import { Card, Button, Checkbox } from "antd";
import {
  CloseCircleOutlined,
  MinusCircleFilled,
  SwapOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import axios from "axios";

ProductItem.propTypes = {};

function ProductItem(props) {
  const [image, setImage] = useState(null);
  const fetchProductImage = () => {
    axios
      .get(
        "/order/product/image?file=" +
          item?.image?.name +
          "&width=300&height=300",
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

  useEffect(fetchProductImage, []);

  const { item } = props;

  function onChange(e) {
    console.log(`checked = ${e.target.checked}`);
  }

  if (item?.mfd_exp?.dates) {
    var newDate = new Date(item?.mfd_exp?.dates[0]?.mfg_date);
    var mfdDate =
      newDate.getDate() +
      "/" +
      (newDate.getMonth() + 1) +
      "/" +
      newDate.getFullYear();

    var newdate = new Date(item?.mfd_exp?.dates[0]?.exp_date);
    var expDate =
      newdate.getDate() +
      "/" +
      (newdate.getMonth() + 1) +
      "/" +
      newdate.getFullYear();
  }

  return (
    <div className="product-items">
      <div>
        <img
          width={150}
          alt="product-images"
          style={{ borderRadius: "15px" }}
          src={image ? image : "/assets/No-image-found.jpg"}
        />
      </div>
      <div className="product-item-info">
        <div>
          <h2 style={{ fontSize: "17px" }}>{item.product_name}</h2>
          <p style={{ color: "#212121" }}>
            {item.unit} &emsp; | &emsp; Qty: {item.qty}
          </p>
        </div>
        <p style={{ color: "#212121" }}>Price:&ensp;₹{item.net_price} </p>
        {"New Order" !== props.status ||
          (item?.mfd_exp?.dates && (
            <div style={{ marginLeft: "40px" }}>
              <p style={{ marginBottom: 0, color: "#616161" }}>
                Manufacture: {mfdDate}
              </p>
              <p style={{ marginBottom: 0, color: "#616161" }}>
                Expiry: {expDate}{" "}
              </p>
            </div>
          ))}
      </div>
      {"Delivered" === props.status ? (
        !item.verify_status ? (
          <div
            style={{
              width: "10em",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CloseCircleOutlined
              style={{ fontSize: "25px", marginBottom: "15px", color: "red" }}
            />
            <p>Not Verified Yet</p>
          </div>
        ) : item.verify_status === 1 ? (
          <div
            style={{
              width: "10em",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CheckCircleFilled
              style={{
                fontSize: "25px",
                marginBottom: "10px",
                color: "#06c706",
              }}
            />
            <p>Verified</p>
          </div>
        ) : item.verify_status === 2 ? (
          <div
            style={{
              width: "10em",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MinusCircleFilled
              style={{ fontSize: "25px", marginBottom: "10px", color: "red" }}
            />
            <p>Undelivered</p>
          </div>
        ) : (
          item.verify_status === 3 && (
            <div
              style={{
                width: "10em",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <SwapOutlined
                style={{ fontSize: "25px", marginBottom: "10px", color: "red" }}
              />
              <p>Replacement</p>
            </div>
          )
        )
      ) : "Cancelled" === props.status ? (
        <div
          style={{
            width: "10em",
            visibility: "hidden",
          }}
        ></div>
      ) : (
        <div
          style={{
            width: "10em",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {"Packaging" === props.status && (
            <Checkbox onChange={(e) => props.onSelectItem(e.target.checked)} />
          )}
          {("Dispatched" === props.status || "Shipping" === props.status) && (
            <Checkbox
              checked={true}
              onChange={onChange}
              className="dispatched"
            />
          )}
          {"Replacement" !== props.status && (
            <Button
              style={{
                color: "#0d7bd9",
                borderColor: "#c5c5c5",
              }}
              onClick={props.openProductInfo}
            >
              Product Info
            </Button>
          )}
          {item.escalation_status && (
            <>
              {item.verify_status === 2 && item.escalation_status === 1 && (
                <>
                  <p
                    style={{
                      color: "#f43434",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Undelivered
                  </p>
                  <Button danger onClick={props.openReason}>
                    Reason
                  </Button>
                </>
              )}
              {item.verify_status === 3 && item.escalation_status === 1 && (
                <>
                  <p
                    style={{
                      color: "#f43434",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Replacement
                  </p>
                  <Button danger onClick={props.openReason}>
                    Reason
                  </Button>
                </>
              )}
              {item.escalation_status === 2 && (
                <>
                  <p
                    style={{
                      color: "#f43434",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Escalated by Shop
                  </p>
                  <Button danger onClick={props.openReason}>
                    Reason
                  </Button>
                </>
              )}
              {item.escalation_status === 3 && (
                <p
                  style={{
                    color: "#2eb502",
                    fontWeight: "100",
                    margin: "20px 0 0 0",
                  }}
                >
                  Accepted
                </p>
              )}
              {item.escalation_status === 4 && (
                <p
                  style={{
                    color: "#2eb502",
                    fontWeight: "100",
                    margin: "20px 0 0 0",
                  }}
                >
                  Accepted
                </p>
              )}
              {item.escalation_status === 5 && (
                <>
                  <p
                    style={{
                      color: "#f43434",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Refund Requested
                  </p>
                  <Button
                    onClick={props.openRefundModal}
                    style={{ borderColor: "#0000ff" }}
                  >
                    Refund
                  </Button>
                </>
              )}
              {item.escalation_status === 6 && (
                <>
                  <p
                    style={{
                      color: "#0000ff",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Refunded
                  </p>
                  <Button danger onClick={props.openReason}>
                    Reason
                  </Button>
                </>
              )}
              {item.escalation_status === 7 && (
                <>
                  <p
                    style={{
                      color: "#f43434",
                      fontWeight: "100",
                      margin: "20px 0 0 0",
                    }}
                  >
                    Closed
                  </p>
                  <Button danger onClick={props.openReason}>
                    Reason
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductItem;
