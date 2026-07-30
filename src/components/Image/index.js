import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Image } from "antd";
import "./Image.less";

export default function ImageComp(props) {
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

  const { style } = props;

  const fetchShopImageImage = () => {
    axios.get(props.url, { responseType: "arraybuffer" }).then((response) => {
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      setImage("data:;base64," + base64);
      setLoading(false);
    }).catch(() => {
      setImage("/assets/No-image-found.jpg");
      setLoading(false);
    });
  };

  useEffect(fetchShopImageImage, []);

  return (
      <div style={style} className="image-container">
      {loading ? (
        <p>Loading ...</p>
      ) : (
        <Image src={image} alt="image" preview={props.preview} />
      )}
    </div>
  );
}
