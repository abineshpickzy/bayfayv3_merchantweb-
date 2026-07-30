import React, { useEffect, useRef, useState } from "react";
import "./AddProduct.less";
import {
  Card,
  Input,
  Button,
  Menu,
  Spin,
  Row,
  Col,
  message,
  Divider,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  FilterFilled,
} from "@ant-design/icons";
import AddProductItem from "./AddProductItem";
import PagePagination from "../../Pagination";
import axios from "axios";
import ScanProductModal from "../../ScanProductModal";
import PaginationWithApi from "../../PaginationWithApi";

const { SubMenu } = Menu;

function AddProduct(props) {
  const [floatingMenu, setFloatingMenu] = useState(false);
  const [selectAllProduct, setSelectAllProduct] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);
  const [checkedProduct, setCheckedProduct] = useState([]);
  const [scanProduct, setScanProduct] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [categoryListItem, setCategoryListItem] = useState();
  const [totalCount, setTotalCount] = useState();
  const [searched, setSearched] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [categoryWise, setCategoryWise] = useState(null);

  const { categoryId, storeId } = props;
  const categoryMenuRef = useRef(null);
  const floatActionMenu = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        floatActionMenu.current &&
        !floatActionMenu.current.contains(event.target)
      ) {
        setFloatingMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [floatActionMenu]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(event.target)
      ) {
        setCategoryMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [categoryMenuRef]);

  const getProductList = () => {
    setLoading(true);
    axios
      // .get("/inv/" + categoryId + "/" + storeId + "/apr/vw?lm=100&sk=0")
      .post("/inv/products/list?skip=" + minValue + "&limit=" + numEachPage, {
        category_id: categoryId,
        store_id: storeId,
      })
      .then((response) => {
        console.log("Add Product List:", response.data);
        setTotalCount(response.data.count);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };
  useEffect(() => {
    console.log(numEachPage);
    if (searched || searched !== null) {
      SearchInProductList();
    } else if (categoryWise || categoryWise !== null) {
      SearchCategoryWise();
    } else {
      getProductList();
    }
  }, [numEachPage]);

  useEffect(() => {
    console.log(minValue);
    if (searched || searched !== null) {
      SearchInProductList();
    } else if (categoryWise || categoryWise !== null) {
      SearchCategoryWise();
    } else {
      getProductList();
    }
  }, [minValue]);

  const categoryList = () => {
    axios
      .post("/inv/category/list", {
        category_id: categoryId,
        store_id: storeId,
      })
      .then((response) => {
        console.log("category list ", response.data.data);
        setCategoryListItem(response.data.data);
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    getProductList();
    categoryList();
  }, []);

  const onSelectItem = (e, o) => {
    console.log("checked =", o);
    if (e === true) {
      if (checkedProduct.includes(o) === false) {
        setCheckedProduct([...checkedProduct, o]);
      }
    }
    if (e === false) {
      if (checkedProduct.includes(o) === true) {
        setCheckedProduct(
          checkedProduct.filter((checkedProduct) => checkedProduct !== o)
        );
      }
    }
  };

  useEffect(
    () => console.log("checked product", checkedProduct),
    [checkedProduct]
  );

  const SearchInProductList = (e) => {
    console.log("searched Input : ", e);
    if (e) {
      setSearched(e);
    }
    setLoading(true);
    axios
      .post("/inv/products/list?skip=" + minValue + "&limit=" + numEachPage, {
        category_id: categoryId,
        store_id: storeId,
        search_product: e ? e : searched,
      })
      .then((response) => {
        console.log(response.data.data);
        setTotalCount(response.data.count);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  // search and short product list by category
  const SearchCategoryWise = (e) => {
    setLoading(true);
    setSearched(null);
    setFiltered(null);
    if (e) {
      setCategoryWise(e);
      console.log("searched category wise", e);
    }
    axios
      .post("/inv/products/list?skip=" + minValue + "&limit=" + numEachPage, {
        category_id: categoryId,
        store_id: storeId,
        search_category: e ? e : categoryWise,
      })
      .then((response) => {
        console.log(response.data.data);
        setTotalCount(response.data.count);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  const checkedAllProduct = () => {
    let allProduct = [];
    productList.map((o) => {
      allProduct.push(
        ...o.category.filter((i) => i.productInfo.isExist === false)
      );
    });
    console.log("all Product :  ", allProduct);
    setCheckedProduct(allProduct);
  };

  const getPosition = (string, subString, index) => {
    return string.split(subString, index).join(subString).length;
  };

  const categories = [];
  if (categoryListItem) {
    categoryListItem.category.forEach((c) => {
      const cats = c.split("/");
      c = categories;
      let parent = "";
      for (let i = 0; i < cats.length; i++) {
        if (i > 0 && cats[i - 1].length > 0) {
          parent += `/${cats[i - 1]}`;
        }
        if (cats[i].length === 0) continue;
        let temp = c.find((t) => t.name === cats[i]);
        if (!temp) {
          temp = { parent, name: cats[i], children: [] };
          c.push(temp);
        }
        c = temp.children;
      }
    });
  }

  // category menu sub-menu , menu-item
  // call function recursively
  const CategoryMenuItem = (o) => {
    return o.map((o) => {
      return o.children.length > 0 ? (
        <SubMenu
          title={o.name}
          key={o.parent.concat("/" + o.name)}
          onTitleClick={() => {
            console.log(o);
            SearchCategoryWise(o.parent.concat("/" + o.name));
          }}
          className="category-sub-menu"
        >
          {CategoryMenuItem(o.children)}
        </SubMenu>
      ) : (
        <Menu.Item
          key={o.parent.concat("/" + o.name)}
          onClick={() => {
            console.log(o);
            SearchCategoryWise(o.parent.concat("/" + o.name));
          }}
          className="category-menu"
        >
          {o.name}
        </Menu.Item>
      );
    });
  };

  // category menu dropdown overlay
  const menu = (
    <div
      style={{
        borderRadius: " 5px",
        position: "absolute",
        right: 0,
        top: "10px",
        border: "solid 1px #ccc",
      }}
      ref={categoryMenuRef}
    >
      <Menu
        mode="inline"
        style={{
          width: "250px",
          borderRadius: " 5px",
        }}
        mode="vertical"
      >
        {categories.map((o) => {
          return (
            <>
              {
                o.name === "Offer Products" ? (
                  <>
                    <Menu.Item
                      key={o.name}
                      onClick={() => {
                        console.log(o);
                        SearchCategoryWise(o.parent.concat("/" + o.name));
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{o.name}</span>
                        <span>{categoryListItem.offer_prod_count}</span>
                      </div>
                    </Menu.Item>
                    <Menu.Item
                      key="All"
                      onClick={() => {
                        getProductList();
                        setSearched(null);
                        setFiltered(null);
                        setCategoryWise(null);
                      }}
                    >
                      All
                    </Menu.Item>
                  </>
                ) : o.children ? (
                  <SubMenu
                    title={o.name}
                    key={o.parent.concat("/" + o.name)}
                    onTitleClick={() => {
                      console.log(o);
                      SearchCategoryWise(o.parent.concat("/" + o.name));
                    }}
                  >
                    {CategoryMenuItem(o.children)}
                  </SubMenu>
                ) : (
                  <Menu.Item
                    key={o.parent.concat("/" + o.name)}
                    onClick={() => {
                      console.log(o);
                      SearchCategoryWise(o.parent.concat("/" + o.name));
                    }}
                  >
                    {o.name}
                  </Menu.Item>
                )

                // ) : (
                //   CategoryMenuItem(o)
                // )
              }
            </>
          );
        })}
      </Menu>
    </div>
  );

  return (
    <div id="AddProducts">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          Live&ensp;/
        </span>
        &ensp;
        <span>Add Products</span>
      </p>
      <div style={{ position: "sticky", top: "13px", zIndex: 100 }}>
        <div className="top-action-div">
          <Card>
            <div className="top-action-div-main-div">
              <div style={{ width: "36%" }}>
                <Input
                  //size="large"
                  placeholder="Search Product"
                  prefix={<SearchOutlined />}
                  allowClear
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setSearched(e.target.value);
                      SearchInProductList(e.target.value);
                    } else {
                      getProductList();
                      setSearched(null);
                    }
                  }}
                />
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                //size="large"
                style={{
                  width: "175px",
                  background: "#f08731",
                  border: "#f08731",
                }}
                onClick={() => props.AddNewProductOpen()}
              >
                Add Product
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                //size="large"
                style={{
                  width: "175px",
                  background: "rgb(2, 117, 216)",
                  border: "rgb(2, 117, 216)",
                }}
                onClick={() => setScanProduct(true)}
              >
                Scan Product
              </Button>
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                className="category-dropdown"
              >
                <Button
                  icon={<FilterFilled />}
                  //size="large"
                  // type="primary"
                  className="category-btn"
                  style={{
                    width: "150PX",
                    background: "#ffd700",
                    border: "#ffd700",
                  }}
                  onClick={() => {
                    setCategoryMenu((prev) => !prev);
                  }}
                >
                  Category
                </Button>
              </Dropdown>
              <div style={{ position: "relative" }}>
                <MoreOutlined
                  style={{ fontSize: "25px" }}
                  onClick={() => setFloatingMenu((prev) => !prev)}
                />
                {floatingMenu && (
                  <div className="float-menu-div" ref={floatActionMenu}>
                    <Menu mode="inline">
                      <Menu.Item key="5" onClick={checkedAllProduct}>
                        Select All
                      </Menu.Item>
                      <Divider className="m-0" />
                      <Menu.Item key="6" onClick={() => setCheckedProduct([])}>
                        Reset
                      </Menu.Item>
                    </Menu>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

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
        ) : productList.length === 0 ? (
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
        ) : (
          productList
            // .slice(minValue, maxValue)
            .map((item, index) => {
              let firstString = item.category_name.slice(
                1,
                getPosition(item.category_name, "/", 2)
              );

              let lastString = item.category_name.slice(
                item.category_name.lastIndexOf("/") + 1
              );
              return (
                <Row gutter={[24, 24]} key={index}>
                  <Col span={24}>
                    <h2
                      style={{
                        margin: "0",
                        color: " #616161",
                        fontSize: "18px",
                      }}
                    >
                      {lastString === firstString
                        ? firstString
                        : firstString + " > " + lastString}
                      {/* Category Name */}
                    </h2>
                  </Col>
                  {item.category.map((o, ind) => {
                    return (
                      <Col
                        xs={24}
                        sm={12}
                        md={12}
                        lg={8}
                        xl={6}
                        xxl={4}
                        span={6}
                        key={ind}
                      >
                        <AddProductItem
                          item={o.productInfo}
                          onSelectItem={(e) => onSelectItem(e, o)}
                          checkedProduct={checkedProduct.some(
                            (i) => i.productInfo._id === o.productInfo._id
                          )}
                        />
                      </Col>
                    );
                  })}
                </Row>
              );
            })
        )}
      </div>

      <div
        className={
          checkedProduct.length > 0
            ? "bottom-floating-menu d-flex"
            : "bottom-floating-menu d-none"
        }
      >
        <Button
          type="primary"
          style={{ backgroundColor: "#ff0000", borderColor: "#ff0000" }}
          onClick={() => setCheckedProduct([])}
        >
          Reset
        </Button>
        <Button
          type="primary"
          style={{ background: "#3abd3a", borderColor: "#3abd3a" }}
          onClick={() => {
            props.openAddProductEdit(checkedProduct);
          }}
        >
          Add Selected Products
        </Button>
      </div>

      {/* {productList.length > numEachPage && ( */}

      <PaginationWithApi
        minValue={minValue}
        handlePageChange={handlePageChange}
        handlePageCountChange={handlePageCountChange}
        maxValue={maxValue}
        numEachPage={numEachPage}
        orderList={totalCount}
      />
      {/* )} */}
      <ScanProductModal
        storeId={storeId}
        history={props.history}
        categoryId={categoryId}
        openScanProduct={scanProduct}
        onClose={() => setScanProduct(false)}
      />
    </div>
  );
}

export default AddProduct;
