import React, { useEffect, useState } from "react";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import { Modal, Button, Spin, message } from "antd";
import axios from "axios";
import "./SelectedProductModal.less";

export default function SelectedProductModal(props) {
  const { item, categoryId, storeId } = props;
  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState(null);

  const [image, setImage] = useState(null);

  useEffect(() => {
    setProductDetail(item);
  }, [item]);

  const fetchProductImage = () => {
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
  };
  useEffect(() => {
    if (item !== null && item !== false) {
      fetchProductImage();
    }
  }, [item]);

  const AddThisProduct = () => {
    axios({
      method: "post",
      // /inventory/:category_id/:store_id/:product_id/stk/ad
      url:
        "/inv/" +
        categoryId +
        "/" +
        storeId +
        "/" +
        productDetail._id +
        "/stk/ad",
      data: {
        stock: productDetail?.stock ? parseInt(productDetail?.stock) : 0,
        selling_price: productDetail?.selling_price
          ? parseFloat(productDetail?.selling_price)
          : 0,
        offer: productDetail?.offer ? parseFloat(productDetail?.offer) : 0,
        tax: productDetail?.tax ? parseFloat(productDetail?.tax) : 0,
      },
    })
      .then((response) => {
        console.log(response);
        props.onClose();
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  return (
    <Modal
      className="selected-product-modal"
      style={{ top: 15 }}
      visible={props.openAddSelectedProduct}
      onCancel={() => {
        props.onClose();
      }}
      width={900}
      mask={false}
      footer={false}
      maskClosable={false}
      closable={false}
    >
      <div className="main-content">
        {loading ? (
          <div>
            <Spin size="large" />
          </div>
        ) : (
          <>
            {productDetail && (
              <div className="product-detail">
                <div className="product-image-div">
                  <img
                    src={image ? image : "/assets/No-image-found.jpg"}
                    style={{ height: "180px", width: "auto" }}
                  />
                </div>
                <div className="product-info">
                  <h2 style={{ fontSize: "20px" }}>
                    {/* PRODUCT NAME */}
                    {productDetail.product_name}
                  </h2>
                  <p className="m-0">
                    <span>
                      {/* 10 ml */}
                      {productDetail.unit}
                    </span>

                    {productDetail.net_price && (
                      <span>
                        &ensp;|&ensp; ₹ {productDetail.net_price}
                        {/* 100 */}
                      </span>
                    )}
                  </p>
                </div>

                {/* Stock Div  */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "350px",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <MinusSquareFilled
                    style={{ fontSize: "50px", color: "#f44336" }}
                    onClick={() =>
                      setProductDetail({
                        ...productDetail,
                        stock:
                          productDetail.stock > 0
                            ? parseInt(productDetail.stock) - 1
                            : 0,
                      })
                    }
                  />
                  <div className="inputs-field">
                    <label className="inputs-label">Stock Count</label>
                    <div className="input-div">
                      <input
                        type="number"
                        className="inputs"
                        placeholder="Stock Count"
                        value={
                          productDetail?.stock !== 0
                            ? productDetail?.stock
                            : null
                        }
                        onChange={(e) => {
                          console.log("stock value", e.target.value);
                          setProductDetail({
                            ...productDetail,
                            stock:
                              e.target.value !== ""
                                ? parseInt(e.target.value)
                                : 0,
                          });
                        }}
                      />
                    </div>
                  </div>
                  <PlusSquareFilled
                    style={{ fontSize: "50px", color: "#38c53e" }}
                    onClick={() =>
                      setProductDetail({
                        ...productDetail,
                        stock: parseInt(productDetail.stock) + 1,
                      })
                    }
                  />
                </div>

                {/* Selling Price */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "350px",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div className="inputs-field">
                    <label className="inputs-label">Selling Price</label>
                    <div className="input-div">
                      <input
                        type="number"
                        step="any"
                        className="inputs"
                        placeholder="Selling Price"
                        value={
                          productDetail?.selling_price
                            ? productDetail?.selling_price
                            : null
                        }
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            selling_price: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Offer div */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "350px",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div className="inputs-field">
                    <label className="inputs-label">Offer %</label>
                    <div className="input-div">
                      <input
                        type="number"
                        step="any"
                        className="inputs"
                        placeholder="Offer %"
                        value={
                          productDetail?.offer ? productDetail?.offer : null
                        }
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            offer: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* tax div */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    width: "350px",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div className="inputs-field">
                    <label className="inputs-label">tax %</label>
                    <div className="input-div">
                      <input
                        type="number"
                        step="any"
                        className="inputs"
                        placeholder="tax %"
                        value={productDetail?.tax ? productDetail?.tax : null}
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            tax: e.target.value,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="action-button-div">
                  <Button
                    style={{ borderColor: "#78bff7" }}
                    onClick={() => {
                      props.onClose();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    style={{ borderColor: "#83c682", background: "#e9f2de" }}
                    onClick={AddThisProduct}
                  >
                    Add Product
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
