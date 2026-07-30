import React, { useEffect, useState } from "react";
import "./StoreListItem.less";
import {
  ShareAltOutlined,
  StarFilled,
  WhatsAppOutlined,
  FacebookFilled,
  LinkedinFilled,
  InstagramFilled,
} from "@ant-design/icons";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { message, Popover } from "antd";
import Image from "../Image";
import axios from "axios";

function StoreListItem(props) {
  const [storeUniqueId, setStoreUniqueId] = useState(null);
  const { item, history } = props;

  useEffect(() => {
    axios
      .post("/shop/view/username", {
        shop_id: item._id,
      })
      .then((response) => {
        setStoreUniqueId(response.data.data);
      })
      .catch((error) => {
        message.error(error?.response?.data.message || "Something went wrong.");
      });
  }, []);

  const content = (
    <div>
      <FacebookFilled
        onClick={() =>
          window.open(
            "https://www.facebook.com/sharer.php?u=https://bayfay.com/" +
              storeUniqueId.promoid_obj.shop_unique_id
          )
        }
      />
      <LinkedinFilled
        onClick={() =>
          window.open(
            "https://www.linkedin.com/sharing/share-offsite/?url=https://bayfay.com/" +
              storeUniqueId.promoid_obj.shop_unique_id
          )
        }
      />
    </div>
  );

  return (
    <div id="StoreListItem">
      <div className="list-item">
        <div>
          <div
            style={{ cursor: "pointer" }}
            onClick={() => {
              localStorage.setItem("storeName", JSON.stringify(item));
              history.push(
                "/store/orders/" + item._id + "/" + item.category_id
              );
            }}
          >
            <Image
              url={
                item.private_icon
                  ? `${process.env.REACT_APP_BASE_URL}/merchant/category/image?width=200&height=200&file=${item.private_icon}&format=png`
                   : `${process.env.REACT_APP_BASE_URL}/merchant/category/image?file=${item.category_image}&width=400&height=400`
              }
              style={{ height: 150 }}
              preview={false}
              imageName={item.category_image}
            />
          </div>
          <div className="extra-icons">
            <span
              className={
                item?.store_rating?.avg_rating > 0
                  ? "rating-star"
                  : "rating-star dis-none "
              }
            >
              <StarFilled style={{ color: "gold" }} />
              &ensp;
              {item?.store_rating?.avg_rating?.toFixed(1)}
            </span>
            <Popover
              className="share-store-link"
              content={content}
              trigger="click"
            >
              <ShareAltOutlined />
            </Popover>
          </div>
        </div>
        {item.new_order_count > 0 && (
          <span
            className={
              item?.new_order_count.toString().length === 1
                ? "new_order_count c-1"
                : item.new_order_count.toString().length === 2
                ? "new_order_count c-2"
                : "new_order_count c-3"
            }
          >
            {item?.new_order_count}
          </span>
        )}

        <p
          className="text-center"
          style={{
            marginTop: "10px",
            color: "#424242",
            fontSize: "15px",
            marginBottom: 0,
          }}
        >
          {item.display_name}
        </p>
      </div>
    </div>
  );
}

export default StoreListItem;
