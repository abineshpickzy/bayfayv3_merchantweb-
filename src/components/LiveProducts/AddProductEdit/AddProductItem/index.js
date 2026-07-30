import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card } from "antd";
import {
  PlusOutlined,
  CloseOutlined,
  MinusCircleFilled,
  PlusCircleFilled,
  MinusOutlined,
} from "@ant-design/icons";

function AddProductItem(props) {
  const { item } = props;
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

  useEffect(fetchProductImage, [props.item]);
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
            {/* Colgate */}
          </h2>
          <p style={{ marginBottom: 0 }}>
            <span>
              {item.unit}
              {/* 100 ml */}
            </span>
            &ensp;|&ensp;
            <span>
              ₹ {item.mrp}
              {/* 100 */}
            </span>
          </p>
        </div>
        <div>
          {/* tax div */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            <div>Tax:</div>
            <div style={{ marginLeft: "17px" }}>
              <MinusOutlined
                onClick={() =>
                  item.tax > 0
                    ? props.UpdateProductTax(parseFloat(item.tax) - 0.5)
                    : 0
                }
                style={{
                  color: "#ff2d2d",
                  fontSize: "20px",
                  userSelect: "none",
                }}
              />
              <input
                type="number"
                step="any"
                style={{
                  width: "70px",
                  margin: "0 8px",
                  textAlign: "center",
                  border: "none",
                  background: "none",
                }}
                value={item.tax}
                onChange={(e) => props.UpdateProductTax(e.target.value || 0)}
              />
              <PlusOutlined
                onClick={() =>
                  props.UpdateProductTax(parseFloat(item.tax) + 0.5)
                }
                style={{
                  color: "#8bc34a",
                  fontSize: "20px",
                  userSelect: "none",
                }}
              />
            </div>
          </div>
          {/* offer div */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            <div>Offer:</div>
            <div style={{ marginLeft: "10px" }}>
              <MinusOutlined
                onClick={() =>
                  item.offer > 0
                    ? props.UpdateProductOffer(parseFloat(item.offer) - 0.5)
                    : 0
                }
                style={{
                  color: "#ff2d2d",
                  fontSize: "20px",
                  userSelect: "none",
                }}
              />
              <input
                type="number"
                step="any"
                style={{
                  width: "70px",
                  margin: "0 8px",
                  textAlign: "center",
                  border: "none",
                  background: "none",
                }}
                value={item.offer}
                onChange={(e) => props.UpdateProductOffer(e.target.value || 0)}
              />
              <PlusOutlined
                onClick={() =>
                  props.UpdateProductOffer(parseFloat(item.offer) + 0.5)
                }
                style={{
                  color: "#8bc34a",
                  fontSize: "20px",
                  userSelect: "none",
                }}
              />
            </div>
          </div>

          {/* price div */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            Price: &ensp;
            <MinusCircleFilled
              onClick={() =>
                item.price > 0
                  ? props.UpdateProductPrice(parseFloat(item.price) - 1)
                  : 0
              }
              style={{ color: "#ff2d2d", fontSize: "25px", userSelect: "none" }}
            />
            <input
              type="number"
              step="any"
              style={{
                width: "70px",
                margin: "0 8px",
                textAlign: "center",
                border: "solid 1px rgb(224, 224, 224)",
                backgroundColor: "#f5f5f5",
              }}
              value={item.price}
              // value={item.products.stock}
              // disabled
              onChange={(e) => props.UpdateProductPrice(e.target.value || 0)}
            />
            <PlusCircleFilled
              onClick={() =>
                props.UpdateProductPrice(parseFloat(item.price) + 1)
              }
              style={{ color: "#8bc34a", fontSize: "25px", userSelect: "none" }}
            />
          </div>

          {/*Stock div  */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Stock: &ensp;
            <MinusCircleFilled
              onClick={() =>
                item.stock > 0
                  ? props.updateProductStock(parseInt(item.stock) - 1)
                  : 0
              }
              style={{ color: "#ff2d2d", fontSize: "25px", userSelect: "none" }}
            />
            <input
              type="number"
              step="any"
              style={{
                width: "70px",
                margin: "0 8px",
                textAlign: "center",
                border: "solid 1px rgb(224, 224, 224)",
                backgroundColor: "#f5f5f5",
              }}
              value={item.stock}
              // disabled
              onChange={(e) => props.updateProductStock(e.target.value || 0)}
            />
            <PlusCircleFilled
              onClick={() => props.updateProductStock(parseInt(item.stock) + 1)}
              style={{ color: "#8bc34a", fontSize: "25px", userSelect: "none" }}
            />
          </div>
        </div>
        <CloseOutlined
          style={{
            position: "absolute",
            right: "15px",
            top: "15px",
            fontSize: "15px",
            userSelect: "none",
          }}
          onClick={() => props.RemoveProduct()}
        />
      </div>
    </Card>
  );
}

export default AddProductItem;
