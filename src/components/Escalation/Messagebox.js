import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "../Image";

function Messagebox(props) {
  const [image, setImage] = useState(null);
  const { localDateTime, item } = props;

  useEffect(() => {
    item.image &&
      axios
        .get(
          "/order/escalate/image?file=" +
            item.image.name +
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
          // setShopImage(imageBase64);
          setImage(imageBase64);
        });
  }, []);
  return (
    <div
      className={item.by === "self" ? "product-detail self" : "product-detail"}
    >
      <h2 style={{ marginBottom: "5px", color: "#212121" }}>
        {item.by} &ensp; &ensp;{" "}
        <span
          style={{
            fontSize: "medium",
            fontWeight: "100",
            fontStyle: "italic",
            color: "#616161",
          }}
        >
          {localDateTime}
        </span>
      </h2>
      {/* <h3 style={{ color: "red", marginBottom: "5px" }}>
          Demaged Product
        </h3> */}
      {item.image ? (
        <Image
          url={`${process.env.REACT_APP_BASE_URL}/order/escalate/image?file=${item.image.name}&format=jpeg&width=1000&height=1000`}
          style={{ maxWidth: "100%" }}
        />
      ) : (
        <p style={{ marginBottom: "5px" }}>{item.message}</p>
      )}
    </div>
  );
}

export default Messagebox;
