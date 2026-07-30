import axios from "axios";
import React, { useEffect, useState } from "react";
import { Row, Col, Checkbox, Button } from "antd";
import { CloseOutlined } from "@ant-design/icons";

function ProductItem(props) {
  const { item } = props;
  const [image, setImage] = useState(null);
  const [closeReject, setCloseReject] = useState(false);

  const fetchProductImage = () => {
    if (item?.images) {
      axios
        .get(
          "/order/product/image?file=" +
            item?.images[0]?.name +
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
    }
  };

  useEffect(fetchProductImage, [item]);

  return (
    <div className="product-item">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div className="product-image">
          <img
            src={image ? image : "/assets/No-image-found.jpg"}
            alt="colgate"
            style={{ width: "105px", height: "auto", borderRadius: "10px" }}
          />
        </div>
        <div className="product-detail">
          <Row style={{ marginTop: 0 }} gutter={[12, 12]}>
            <Col className="w-40 f-end c-grey">Product Name:</Col>
            <Col className="w-60">{item.product_name}</Col>
          </Row>
          <Row style={{ marginTop: 0 }} gutter={[12, 12]}>
            <Col className="w-40 f-end c-grey">Price:</Col>
            <Col className="w-60">
              {item.selling_price && "₹ " + item.selling_price}
            </Col>
          </Row>
          <Row style={{ marginTop: 0 }} gutter={[12, 12]}>
            <Col className="w-40 f-end c-grey ">Stock:</Col>
            <Col className="w-60">{item.stock && item.stock}</Col>
          </Row>
          <Row style={{ marginTop: 0 }} gutter={[12, 12]}>
            <Col className="w-40 f-end c-grey">Unit:</Col>
            <Col className="w-60">{item.unit && item.unit}</Col>
          </Row>
          <Row style={{ marginTop: 0 }} gutter={[12, 12]}>
            <Col className="w-40 f-end c-grey">
              {item.upc ? "UPC/EAN" : "SKU"}
            </Col>
            <Col className="w-60">{item.upc ? item.upc : item.sku}</Col>
          </Row>
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {item.status === 0 && (
            <label
              style={{
                padding: "8px 40px",
                background: "#d0f0ff",
                marginRight: "15px",
                borderRadius: "3px",
                lineHeight: "normal",
              }}
            >
              Draft
            </label>
          )}
          {(item.status === 1 || item.status === 2) && (
            <label
              style={{
                padding: "8px",
                background: "#5ea807",
                marginRight: "15px",
                borderRadius: "3px",
                lineHeight: "normal",
                width: "135px",
                color: "#fff",
              }}
            >
              Waiting for Review
            </label>
          )}
          {item.status === 3 && closeReject === false && (
            <label
              style={{
                padding: "8px",
                background: "#f2dede",
                border: "solid 1px #ebccd1",
                marginRight: "15px",
                borderRadius: "3px",
                lineHeight: "normal",
                height: "90%",
                display: "flex",
              }}
            >
              <span
                style={{
                  marginRight: "10px",
                  color: "#a94442",
                  width: "150px",
                }}
              >
                <b>Rejected!</b>
                {item?.feedback[item.feedback.length - 1]?.message}
              </span>
              <CloseOutlined onClick={() => setCloseReject(true)} />
            </label>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Button
            type="link"
            style={{ marginTop: "-30px" }}
            onClick={props.EditProduct}
          >
            Edit
          </Button>
          <Checkbox
            onChange={(e) => props.onSelectItem(e.target.checked)}
            checked={props.checkedProduct}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
