import React, { useEffect, useState } from "react";
import axios from "axios";

const SearchedProductList = (props) => {
  const [image, setImage] = useState(null);
  const { item } = props;

  const fetchProductImage = () => {
    item.images.length > 0 &&
      axios
        .get(
          "/order/product/image?file=" +
            item.images[0].name +
            "&width=300&height=300",
          {
            responseType: "arraybuffer",
          }
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
    <div className="searched-product-details">
      <div style={{ display: "flex" }}>
        <img
          src={image ? image : "/assets/No-image-found.jpg"}
          alt="colgate"
          style={{ width: "70px", height: "auto", borderRadius: "10px" }}
        />

        <div style={{ marginLeft: "15px" }}>
          <p className="m-0" style={{ fontSize: "15px", fontWeight: "bold" }}>
            {item.product_name}
          </p>
          <p className="m-0">
            <span> {item.unit}</span>
            {/* &ensp;|&ensp;<span>₹ 100</span> */}
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{
            padding: " 0 10px",
            background: "none",
            borderRadius: "20px",
            border: "solid 1px #ccc",
            color: "#424242",
          }}
          onClick={props.setSelectedProduct}
        >
          select
        </button>
      </div>
    </div>
  );
};

export default SearchedProductList;
