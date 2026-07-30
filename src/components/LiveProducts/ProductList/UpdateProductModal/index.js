import React, { useEffect, useState } from "react";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";
import { Modal, Button, Spin, message } from "antd";
import axios from "axios";
import "./UpdateProductModal.less";

export default function UpdateProductModal(props) {
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
          productDetail?.product_info?.images[0]?.name +
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
    if (props.openUpdateProduct && productDetail) {
      fetchProductImage();
    }
  }, [props.openUpdateProduct, productDetail]);

  const UpdateThisProduct = () => {
    setLoading(true);
    let params = [
      {
        _id: productDetail.products?.id,
        stock: parseInt(productDetail.products?.stock),
        selling_price: parseFloat(productDetail.products?.selling_price),
        offer: parseFloat(productDetail.products?.offer),
        tax: parseFloat(productDetail.products?.tax),
      },
    ];

    axios({
      method: "patch",
      url: "/inv/" + categoryId + "/" + storeId + "/up/stks",
      data: { inputs: params },
    })
      .then((response) => {
        console.log(response);
        setProductDetail(null);
        setLoading(false);
        // props.onupdateStock();
        props.onClose();
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  return (
    <Modal
      className="update-product-modal"
      title=""
      style={{ top: 10 }}
      visible={props.openUpdateProduct}
      onCancel={() => {
        props.onClose();
      }}
      width={900}
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
                    {productDetail.product_info.product_name}
                  </h2>
                  <p className="m-0">
                    <span>
                      {/* 10 ml */}
                      {productDetail.product_info.unit}
                    </span>
                    &ensp;|&ensp;
                    <span>
                      ₹ {productDetail.products.net_price}
                      {/* 100 */}
                    </span>
                  </p>
                </div>

                {/* Stock Div  */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "350px",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <MinusSquareFilled
                    style={{ fontSize: "50px", color: "#f44336" }}
                    onClick={() =>
                      setProductDetail({
                        ...productDetail,
                        products: {
                          ...productDetail.products,
                          stock:
                            productDetail.products.stock > 0
                              ? parseInt(productDetail.products.stock) - 1
                              : 0,
                        },
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
                          productDetail.products.stock !== 0
                            ? productDetail.products.stock
                            : null
                        }
                        onChange={(e) => {
                          console.log("stock value", e.target.value);
                          setProductDetail({
                            ...productDetail,
                            products: {
                              ...productDetail.products,
                              stock:
                                e.target.value !== ""
                                  ? parseInt(e.target.value)
                                  : 0,
                            },
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
                        products: {
                          ...productDetail.products,
                          stock: parseInt(productDetail.products.stock) + 1,
                        },
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
                    marginBottom: "10px",
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
                          productDetail.products?.selling_price
                            ? productDetail.products?.selling_price
                            : null
                        }
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            products: {
                              ...productDetail.products,
                              selling_price: e.target.value,
                            },
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
                    marginBottom: "10px",
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
                          productDetail.products?.offer
                            ? productDetail.products?.offer
                            : null
                        }
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            products: {
                              ...productDetail.products,
                              offer: e.target.value,
                            },
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
                    marginBottom: "10px",
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
                        value={
                          productDetail.products?.tax
                            ? productDetail.products?.tax
                            : null
                        }
                        onChange={(e) => {
                          setProductDetail({
                            ...productDetail,
                            products: {
                              ...productDetail.products,
                              tax: e.target.value,
                            },
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
                    onClick={UpdateThisProduct}
                  >
                    Update
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
