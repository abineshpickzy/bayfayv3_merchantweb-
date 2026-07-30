import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Switch,
  Checkbox,
  message,
  Spin,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  MinusCircleFilled,
  PlusCircleFilled,
  FormOutlined,
} from "@ant-design/icons";

function AddProductItem(props) {
  const { item } = props;

  const [isPRoductShow, setIsProductShow] = useState(
    item?.products?.is_visible === false ? false : true
  );
  const [image, setImage] = useState(null);

  const fetchProductImage = () => {
    axios
      .get(
        "/order/product/image?file=" +
          // item?.product_info?.images[0]?.name +
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
  };

  useEffect(fetchProductImage, []);

  return (
    <Card className="product-detail">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <img
            src={image ? image : "/assets/No-image-found.jpg"}
            alt="colgate"
            style={{ width: "100px", height: "auto", borderRadius: "10px" }}
          />
          <h2 style={{ margin: "0", fontSize: "16px", textAlign: "center" }}>
            {item.product_name}
            {/* {item.product_info.product_name} */}
            {/* Colgate */}
          </h2>
          <p style={{ marginBottom: 0 }}>
            <span>
              {item.unit}
              {/* {item.product_info.unit} */}
              {/* 100 ml */}
            </span>
            &ensp;|&ensp;
            <span>
              ₹ {item.mrp}
              {/* {item.products.net_price} */}
              {/* 100 */}
            </span>
          </p>
          <p>
            {item.sku ? "SKU: " : "EAN/UPC: "} {item.sku || item.upc}
          </p>
        </div>
        <div style={{ width: "100%" }}>
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {item.isExist ? (
              <label className="product-added">Product Added</label>
            ) : (
              <Checkbox
                onChange={(e) => props.onSelectItem(e.target.checked)}
                checked={props.checkedProduct}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

export default AddProductItem;
