import React, { useEffect, useState, Fragment } from "react";
import "./AddProductEdit.less";
import { Card, Input, Button, Menu, Spin, Row, Col, message } from "antd";
import { SearchOutlined, PlusOutlined, MoreOutlined } from "@ant-design/icons";
import PagePagination from "../../Pagination";
import AddProductItem from "./AddProductItem";
import axios from "axios";

function AddProductEdit(props) {
  const [floatingMenu, setFloatingMenu] = useState(false);
  const [selectAllProduct, setSelectAllProduct] = useState(false);
  const [loading, SetLoading] = useState(false);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);
  const [searching, setSearching] = useState(false);
  const [searchedProductList, setSearchedProductList] = useState([]);

  const { categoryId, storeId, products } = props;
  const [productList, setProductList] = useState(
    products.map((o) => {
      return {
        ...o,
        productInfo: {
          ...o.productInfo,
          stock: 25,
          price: o.productInfo.mrp,
          tax: 0,
          offer: 0,
        },
      };
    })
  );

  const handlePageChange = (value) => {
    setMinValue(value * numEachPage - numEachPage);
    setMaxValue(value * numEachPage);
  };

  const handlePageCountChange = (value) => {
    setNumEachPage(value);
    if (maxValue - minValue !== value) {
      setMaxValue(minValue + value);
    }
  };

  const updateProductStock = (stock, index) => {
    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      productInfo: {
        ...productListUpdate[index].productInfo,
        stock: stock,
      },
    };
    setProductList(productListUpdate);
  };

  const UpdateProductPrice = (price, index) => {
    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      productInfo: {
        ...productListUpdate[index].productInfo,
        price: price,
      },
    };
    setProductList(productListUpdate);
  };

  const UpdateProductTax = (tax, index) => {
    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      productInfo: {
        ...productListUpdate[index].productInfo,
        tax: tax,
      },
    };
    setProductList(productListUpdate);
  };

  const UpdateProductOffer = (offer, index) => {
    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      productInfo: {
        ...productListUpdate[index].productInfo,
        offer: offer,
      },
    };
    setProductList(productListUpdate);
  };

  const RemoveProduct = (id) => {
    console.log(id);
    setProductList(productList.filter((o) => o.productInfo._id !== id));
  };
  useEffect(() => {
    if (productList.length === 0) {
      props.goBack();
    }
  }, [productList]);

  const AddProductInSale = () => {
    SetLoading(true);
    let params = productList.map((item) => {
      let o = {
        product_id: item.productInfo._id,
        stock: item.productInfo.stock,
        selling_price: item.productInfo.price,
        offer: item.productInfo.offer,
        tax: item.productInfo.tax,
      };

      if (item.productInfo.sku) {
        o = {
          ...o,
          product_code: item.productInfo.sku,
        };
      } else if (item.productInfo.upc) {
        o = {
          ...o,
          product_code: item.productInfo.upc,
        };
      } else if (item.productInfo.ean) {
        o = {
          ...o,
          product_code: item.productInfo.ean,
        };
      }

      return o;
    });

    axios
      .post("/inv/products/add", {
        store_id: storeId,
        product_info: params,
      })
      .then((response) => {
        console.log("response of add product", response.data.message);
        SetLoading(false);
        message.success(response.data.message);
        let newurl = window.location.pathname + "?refreshCount=true";
        props.history.push(newurl);
        props.goBack();
      })
      .catch((error) => {
        message.error(error?.data?.response?.data || "Something went wrong!");
        SetLoading(false);
      });
  };

  const searchProduct = (e) => {
    let array = [...productList];

    let searched = array.filter((o) =>
      o.productInfo.product_name
        .toString()
        .toLowerCase()
        .includes(e.toLowerCase())
    );
    setSearchedProductList(searched);

    console.log(searched);
  };

  useEffect(() => {
    console.log("updated product list", productList);
  }, [productList]);

  const getPosition = (string, subString, index) => {
    return string.split(subString, index).join(subString).length;
  };

  let lastCategory = "";
  return (
    <div id="AddProductsEdit">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Live&ensp;/
        </span>
        &ensp;
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Add Products&ensp;/
        </span>
        &ensp;
        <span>Edit</span>
      </p>
      <div style={{ position: "sticky", top: "13px", zIndex: 100 }}>
        <div style={{ position: "relative" }}>
          <div className="top-action-div">
            <Card>
              <div className="top-action-div-main-div">
                <div style={{ width: "36%" }}>
                  <Input
                    //size="large"
                    allowClear
                    placeholder="Search Product"
                    prefix={<SearchOutlined />}
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        searchProduct(e.target.value);
                        setSearching(true);
                      } else {
                        setSearching(false);
                        setSearchedProductList([]);
                      }
                    }}
                  />
                </div>
                <div>
                  <MoreOutlined
                    style={{ fontSize: "25px" }}
                    onClick={() => setFloatingMenu((prev) => !prev)}
                  />
                </div>
              </div>
            </Card>
          </div>
          {/* {floatingMenu && (
            <div className="float-menu-div">
              <Menu mode="inline">
                <Menu.Item key="5">
                  {selectAllProduct ? "Unselect All" : "Select All"}
                </Menu.Item>
                <hr />
                <Menu.Item key="6">Reset</Menu.Item>
              </Menu>
            </div>
          )} */}
        </div>
      </div>

      <div>
        <div className="products">
          {loading ? (
            <div
              style={{
                height: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spin size="large" />
            </div>
          ) : products.length === 0 ? (
            <div
              style={{
                height: "70vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontSize: "35px",
                  fontFamily: "Anton",
                  color: "#9e9e9e",
                }}
              >
                No Product Added
              </p>
            </div>
          ) : searching ? (
            <Row gutter={[24, 24]}>
              {searchedProductList
                .slice(minValue, maxValue)
                .map((item, index) => {
                  let productCategory = item.productInfo.category;
                  let firstString = "";
                  let lastString = "";
                  if (productCategory === lastCategory) {
                    productCategory = null;
                  } else {
                    lastCategory = productCategory;

                    firstString = productCategory.slice(
                      1,
                      getPosition(productCategory, "/", 2)
                    );

                    lastString = productCategory.slice(
                      productCategory.lastIndexOf("/") + 1
                    );
                  }
                  return (
                    <Fragment key={index}>
                      {productCategory && (
                        <Col span={24}>
                          <h2
                            style={{
                              margin: "0",
                              color: " #616161",
                              fontSize: "16px",
                            }}
                          >
                            {lastString === firstString
                              ? firstString
                              : firstString + " > " + lastString}
                          </h2>
                        </Col>
                      )}
                      <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={6}
                        xxl={4}
                        span={6}
                      >
                        <AddProductItem
                          item={item.productInfo}
                          updateProductStock={(stock) =>
                            updateProductStock(stock, index)
                          }
                          UpdateProductPrice={(price) =>
                            UpdateProductPrice(price, index)
                          }
                          UpdateProductTax={(tax) =>
                            UpdateProductTax(tax, index)
                          }
                          UpdateProductOffer={(offer) =>
                            UpdateProductOffer(offer, index)
                          }
                          RemoveProduct={() =>
                            RemoveProduct(item.productInfo._id)
                          }
                        />
                      </Col>
                    </Fragment>
                  );
                })}
            </Row>
          ) : (
            <Row gutter={[24, 24]}>
              {productList.slice(minValue, maxValue).map((item, index) => {
                let productCategory = item.productInfo.category;
                let firstString = "";
                let lastString = "";
                if (productCategory === lastCategory) {
                  productCategory = null;
                } else {
                  lastCategory = productCategory;

                  firstString = productCategory.slice(
                    1,
                    getPosition(productCategory, "/", 2)
                  );

                  lastString = productCategory.slice(
                    productCategory.lastIndexOf("/") + 1
                  );
                }
                return (
                  <Fragment key={index}>
                    {productCategory && (
                      <Col span={24}>
                        <h2
                          style={{
                            margin: "0",
                            color: " #616161",
                            fontSize: "16px",
                          }}
                        >
                          {lastString === firstString
                            ? firstString
                            : firstString + " > " + lastString}
                        </h2>
                      </Col>
                    )}
                    <Col xs={24} sm={12} md={12} lg={8} xl={6} xxl={4} span={6}>
                      <AddProductItem
                        item={item.productInfo}
                        updateProductStock={(stock) =>
                          updateProductStock(stock, index)
                        }
                        UpdateProductPrice={(price) =>
                          UpdateProductPrice(price, index)
                        }
                        UpdateProductTax={(tax) => UpdateProductTax(tax, index)}
                        UpdateProductOffer={(offer) =>
                          UpdateProductOffer(offer, index)
                        }
                        RemoveProduct={() =>
                          RemoveProduct(item.productInfo._id)
                        }
                      />
                    </Col>
                  </Fragment>
                );
              })}
            </Row>
          )}
        </div>
      </div>

      <div className={"bottom-floating-menu "}>
        <Button style={{ color: "#ff3d3d" }} onClick={() => props.goBack()}>
          Cancel
        </Button>
        <Button
          type="primary"
          style={{ background: "#3abd3a", borderColor: "#3abd3a" }}
          onClick={AddProductInSale}
        >
          Put on Sale
        </Button>
      </div>

      {productList.length > numEachPage && (
        <PagePagination
          minValue={minValue}
          handlePageChange={handlePageChange}
          handlePageCountChange={handlePageCountChange}
          maxValue={maxValue}
          numEachPage={numEachPage}
          orderList={productList}
        />
      )}
    </div>
  );
}

export default AddProductEdit;
