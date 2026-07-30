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

function ProductItem(props) {
  const { item } = props;

  const [isPRoductShow, setIsProductShow] = useState(
    item.products?.is_visible === true ? true : false
  );
  const [image, setImage] = useState(null);

  const fetchProductImage = () => {
    axios
      .get(
        "/order/product/image?file=" +
          item?.product_info?.images[0]?.name +
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

  useEffect(fetchProductImage, [item]);

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
        <div
          style={{ textAlign: "center", marginTop: "20px" }}
          onClick={props.openProductInfo}
        >
          <img
            src={image ? image : "/assets/No-image-found.jpg"}
            alt="colgate"
            style={{ width: "100px", height: "auto", borderRadius: "10px" }}
          />
          <h2 style={{ margin: "0", fontSize: "16px", textAlign: "center" }}>
            {/* {item.product_name} */}
            {item.product_info.product_name}
          </h2>
          <p>
            <span>
              {/* {item.unit} */}
              {item.product_info.unit}
            </span>
            &ensp;|&ensp;
            <span>
              ₹ {/* {item.mrp} */}
              {item.products.selling_price}
            </span>
          </p>
        </div>
        <div style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
              marginLeft: "13px",
            }}
          >
            Price: &ensp;
            <MinusCircleFilled
              onClick={() =>
                item.products.selling_price > 0
                  ? props.updateProductPrice(item.products.selling_price - 1)
                  : 0
              }
              style={{ color: "#ff2d2d", fontSize: "25px", userSelect: "none" }}
            />
            <input
              type="number"
              step="any"
              style={{
                width: "50px",
                margin: "0 8px",
                textAlign: "center",
                border: "solid 1px rgb(224, 224, 224)",
                backgroundColor: "#f5f5f5",
              }}
              // value={20}
              value={item.products.selling_price}
              onChange={(e) =>
                props.updateProductPrice(parseFloat(e.target.value) || 0)
              }
            />
            <PlusCircleFilled
              onClick={() =>
                props.updateProductPrice(item.products.selling_price + 1)
              }
              style={{ color: "#8bc34a", fontSize: "25px", userSelect: "none" }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px",
            }}
          >
            Stock: &ensp;
            <MinusCircleFilled
              onClick={() =>
                item.products.stock > 0
                  ? props.updateProductStock(item.products.stock - 1)
                  : 0
              }
              style={{ color: "#ff2d2d", fontSize: "25px", userSelect: "none" }}
            />
            <input
              type="number"
              step="any"
              style={{
                width: "50px",
                margin: "0 8px",
                textAlign: "center",
                border: "solid 1px rgb(224, 224, 224)",
                backgroundColor: "#f5f5f5",
              }}
              // value={20}
              value={item.products.stock}
              onChange={(e) =>
                props.updateProductStock(parseInt(e.target.value) || 0)
              }
            />
            <PlusCircleFilled
              onClick={() => props.updateProductStock(item.products.stock + 1)}
              style={{ color: "#8bc34a", fontSize: "25px", userSelect: "none" }}
            />
          </div>

          <div
            style={{
              marginTop: "10px",
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>
              Hidden:&ensp;
              <Switch
                checked={isPRoductShow}
                onChange={(e) => {
                  setIsProductShow(e);
                  console.log("event", e);
                  props.shopVisible(e);
                }}
                className={isPRoductShow ? "show-product" : "hide-product"}
              />
            </div>

            <Checkbox
              onChange={(e) => props.onSelectItem(e.target.checked)}
              checked={props.checkedProduct}
            />
          </div>
        </div>

        <div className="extra-icon-div">
          <FormOutlined
            style={{
              color: "#0777d8",
              marginBottom: "10px",
              fontSize: "15px",
            }}
            onClick={props.UpdateThisProduct}
          />
          {item.products.stock_timing !== undefined &&
            item.products.stock_timing.length > 0 && (
              <ClockCircleOutlined
                style={{
                  color: "#ffa017",
                  marginBottom: "10px",
                  fontSize: "15px",
                }}
                onClick={props.openProductTiming}
              />
            )}
          {item.products.is_auto_stock_update === true && (
            <SyncOutlined
              style={{
                color: "#ea3170",
                marginBottom: "10px",
                fontSize: "15px",
              }}
              onClick={props.openProductAutoUpdate}
            />
          )}
        </div>
        {item.products?.offer > 0 && (
          <div className="offer-label-div">
            <label className="offer-label">
              <span>{item.products.offer}</span>% OFF
            </label>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ProductItem;
