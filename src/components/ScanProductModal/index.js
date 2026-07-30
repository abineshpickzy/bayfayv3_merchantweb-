import React, { useEffect, useState } from "react";
import "./ScanProductModal.less";
import { Button, message, Modal, Spin } from "antd";
import axios from "axios";
import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons";

function ScanProductModal(props) {
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upc, setUpc] = useState();
  const [image, setImage] = useState(null);

  const { categoryId, storeId, history } = props;

  const fetchProductImage = () => {
    axios
      .get(
        "/order/product/image?file=" +
          searchedProduct?.product?.images[0]?.name +
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
  const searchProductByUPC = () => {
    setLoading(true);
    if (upc === "") {
      message.error("Please Enter Valid UPC/SKU!");
      return;
    }
    axios
      .get("/inventory/upc/" + categoryId + "/" + storeId + "/" + upc)
      .then((response) => {
        console.log("Scaned product", response.data.data);
        setSearchedProduct(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
        let res = window.confirm("Do you want to add this Product?");
        if (res === true) {
          history.push({
            pathname: window.location.pathname,
            state: { isNewProduct: upc },
          });
          props.onClose();
        }
      });
  };

  useEffect(() => {
    fetchProductImage();
  }, [searchedProduct]);

  const updateProduct = () => {
    setLoading(true);
    let params = [
      {
        _id: searchedProduct.products?.id,
        stock: parseInt(searchedProduct.products?.stock),
        selling_price: parseFloat(searchedProduct.products?.selling_price),
        offer: parseFloat(searchedProduct.products?.offer),
        tax: parseFloat(searchedProduct.products?.tax),
      },
    ];

    axios({
      method: "patch",
      url: "/inv/" + categoryId + "/" + storeId + "/up/stks",
      data: { inputs: params },
    })
      .then((response) => {
        console.log(response);
        setUpc();
        setSearchedProduct(null);
        setLoading(false);
        props.onClose();
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const updateAndContinue = () => {
    setLoading(true);
    let params = [
      {
        _id: searchedProduct.products?.id,
        stock: parseInt(searchedProduct.products?.stock),
        selling_price: parseFloat(searchedProduct.products?.selling_price),
        offer: parseFloat(searchedProduct.products?.offer),
        tax: parseFloat(searchedProduct.products?.tax),
      },
    ];

    axios({
      method: "patch",
      url: "/inv/" + categoryId + "/" + storeId + "/up/stks",
      data: { inputs: params },
    })
      .then((response) => {
        console.log(response);
        setUpc();
        setSearchedProduct(null);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const addProduct = () => {
    setLoading(true);

    let prod_id = searchedProduct.products?.id
      ? searchedProduct.products?.id
      : searchedProduct.product._id;

    axios({
      method: "post",
      // /inventory/:category_id/:store_id/:product_id/stk/ad
      url: "/inv/" + categoryId + "/" + storeId + "/" + prod_id + "/stk/ad",
      data: {
        stock: parseInt(searchedProduct.products?.stock || 0),
        selling_price: parseFloat(searchedProduct.products?.selling_price || 0),
        offer: parseFloat(searchedProduct.products?.offer || 0),
        tax: parseFloat(searchedProduct.products?.tax || 0),
      },
    })
      .then((response) => {
        console.log(response);
        setUpc();
        setSearchedProduct(null);
        setLoading(false);
        let newurl = window.location.pathname + "?refreshCount=true";
        history.push(newurl);
        props.onClose();
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const addAndContinue = () => {
    setLoading(true);

    let prod_id = searchedProduct.products?.id
      ? searchedProduct.products?.id
      : searchedProduct.product._id;

    axios({
      method: "post",
      // /inventory/:category_id/:store_id/:product_id/stk/ad
      url: "/inv/" + categoryId + "/" + storeId + "/" + prod_id + "/stk/ad",
      data: {
        stock: parseInt(searchedProduct.products?.stock || 0),
        selling_price: parseFloat(searchedProduct.products?.selling_price || 0),
        offer: parseFloat(searchedProduct.products?.offer || 0),
        tax: parseFloat(searchedProduct.products?.tax || 0),
      },
    })
      .then((response) => {
        console.log(response);
        let newurl = window.location.pathname + "?refreshCount=true";
        history.push(newurl);
        setUpc();
        setSearchedProduct(null);
        setLoading(false);
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
      className="scan-modal"
      title="Scan Product"
      style={{ top: 0 }}
      visible={props.openScanProduct}
      onCancel={() => {
        setSearchedProduct(null);
        setUpc();
        props.onClose();
      }}
      width={900}
    >
      <div className="main-content">
        {loading ? (
          <div>
            <Spin size="large" />
          </div>
        ) : searchedProduct === null ? (
          <>
            <div className="search-div">
              <label>UPC/EAN/SKU </label>
              <input
                type="number"
                step="any"
                onChange={(e) => setUpc(e.target.value)}
                value={upc}
                style={{ border: "solid 1px #bbb", borderRadius: "3PX" }}
              />
              <Button style={{ minWidth: 100 }} onClick={searchProductByUPC}>
                Search
              </Button>
            </div>
            <div>
              <Button
                style={{ width: "180px" }}
                onClick={() => {
                  setUpc();
                  setSearchedProduct(null);
                  props.onClose();
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="product-detail">
              <div className="product-image-div">
                <img
                  src={image ? image : "/assets/No-image-found.jpg"}
                  style={{
                    width: "180px",
                    height: "auto",
                    borderRadius: "10px",
                  }}
                />
              </div>
              <div className="product-info">
                <h2 style={{ fontSize: "20px" }}>
                  {searchedProduct.product.product_name}
                </h2>
                <p>
                  <span>
                    {/* 10 ml */}
                    {searchedProduct.products?.unit
                      ? searchedProduct.products?.unit
                      : searchedProduct.product.unit}
                  </span>
                  &ensp;|&ensp;
                  <span>
                    ₹ {/* {item.mrp} */}
                    {searchedProduct.products?.net_price
                      ? searchedProduct.products?.net_price
                      : searchedProduct.product.mrp}
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
                  onClick={() => {
                    setSearchedProduct({
                      ...searchedProduct,
                      products: {
                        ...searchedProduct.products,
                        stock:
                          searchedProduct.products?.stock > 0
                            ? searchedProduct.products?.stock - 1
                            : 0,
                      },
                    });
                  }}
                />
                <div className="inputs-field">
                  <label className="inputs-label">Stock Count</label>
                  <div className="input-div">
                    <input
                      type="number"
                      step="any"
                      className="inputs"
                      placeholder="Stock Count"
                      value={
                        searchedProduct?.products?.stock
                          ? searchedProduct?.products?.stock
                          : null
                      }
                      onChange={(e) => {
                        setSearchedProduct({
                          ...searchedProduct,
                          products: {
                            ...searchedProduct?.products,
                            stock: parseInt(e.target.value),
                          },
                        });
                      }}
                    />
                  </div>
                </div>
                <PlusSquareFilled
                  style={{ fontSize: "50px", color: "#38c53e" }}
                  onClick={() => {
                    setSearchedProduct({
                      ...searchedProduct,
                      products: {
                        ...searchedProduct.products,
                        stock: searchedProduct.products?.stock + 1,
                      },
                    });
                  }}
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
                        searchedProduct.products?.selling_price
                          ? searchedProduct.products?.selling_price
                          : null
                      }
                      onChange={(e) => {
                        setSearchedProduct({
                          ...searchedProduct,
                          products: {
                            ...searchedProduct.products,
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
                        searchedProduct.products?.offer
                          ? searchedProduct.products?.offer
                          : null
                      }
                      onChange={(e) => {
                        setSearchedProduct({
                          ...searchedProduct,
                          products: {
                            ...searchedProduct.products,
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
                        searchedProduct.products?.tax
                          ? searchedProduct.products?.tax
                          : null
                      }
                      onChange={(e) => {
                        setSearchedProduct({
                          ...searchedProduct,
                          products: {
                            ...searchedProduct.products,
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
                    setSearchedProduct(null);
                    setUpc();
                    props.onClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  style={{ borderColor: "#83c682", background: "#e9f2de" }}
                  onClick={
                    searchedProduct.products?.id ? updateProduct : addProduct
                  }
                >
                  {searchedProduct.products?.id ? "Update" : "Add Product"}
                </Button>
                <Button
                  style={{ borderColor: "#78bff7" }}
                  onClick={
                    searchedProduct.products?.id
                      ? updateAndContinue
                      : addAndContinue
                  }
                >
                  {searchedProduct.products?.id
                    ? "Update and Continue"
                    : "Add and Continue"}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ScanProductModal;
