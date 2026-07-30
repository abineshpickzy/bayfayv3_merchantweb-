import React, { useState, useEffect, useRef } from "react";
import "./ProductList.less";
import {
  SearchOutlined,
  PlusOutlined,
  MoreOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  MinusCircleFilled,
  FilterFilled,
} from "@ant-design/icons";
import {
  Card,
  Input,
  Button,
  Row,
  Col,
  Menu,
  message,
  Spin,
  Popconfirm,
  Dropdown,
  Divider,
} from "antd";
import axios from "axios";
import ProductItem from "./ProductItem";
import AutoUpdateStockModal from "../AutoUpdateStockModal";
import ProductTimingModal from "../ProductTimingModal";
import ScanProductModal from "../../ScanProductModal";
import UpdateProductModal from "./UpdateProductModal";
import UPCUploadModal from "../../UPC_EAN_UploadModal";
import SKUUploadModal from "../../SKU_ManageStockModal";
import PaginationWithApi from "../../PaginationWithApi";

const { SubMenu } = Menu;

let NUM_PER_PAGE = localStorage.getItem("numEachPage");

function ProductList(props) {
  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [checkedProduct, setCheckedProduct] = useState([]);
  const [isAnyItemUpdate, setIsAnyItemUpdate] = useState([]);
  const [numEachPage, setNumEachPage] = useState(
    NUM_PER_PAGE !== null ? NUM_PER_PAGE : 25
  );
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);
  const [floatingMenu, setFloatingMenu] = useState(false);
  const [categoryMenu, setCategoryMenu] = useState(false);
  const [categoryListItem, setCategoryListItem] = useState();
  const [autoStockModal, setAutoStockModal] = useState(false);
  const [timingModal, setTimingModal] = useState(false);
  const [scanProduct, setScanProduct] = useState(false);
  const [updateProduct, setUpdateProduct] = useState(false);
  const [openUpcUpload, setOpenUpcUpload] = useState(false);
  const [openSkuUpload, setOpenSkuUpload] = useState(false);
  const [filterMenu, setFilterMenu] = useState(false);
  const [totalCount, setTotalCount] = useState();
  const [searched, setSearched] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [categoryWise, setCategoryWise] = useState(null);

  const { categoryId, storeId, history } = props;
  const categoryMenuRef = useRef(null);
  const floatActionMenu = useRef(null);
  const filterMenuRef = useRef(null);

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
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target)
      ) {
        setFilterMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterMenuRef]);

  const handlePageChange = (value) => {
    setMinValue(value * numEachPage - numEachPage);
    setMaxValue(value * numEachPage);
  };

  const handlePageCountChange = (value) => {
    if (value !== numEachPage) {
      setNumEachPage(value);
      if (maxValue - minValue !== value) {
        setMaxValue(minValue + value);
      }
    }
  };

  const getProductList = () => {
    setLoading(true);
    axios
      .get(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/apr/vw?lm=" +
          numEachPage +
          "&sk=" +
          minValue
      )
      // .post("/inv/products/list?skip=0&limit=25", {
      //   category_id: categoryId,
      //   store_id: storeId,
      // })
      .then((response) => {
        console.log("Inventory live Product List:", response.data);
        setTotalCount(response.data.totalcount);
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
    localStorage.setItem("numEachPage", numEachPage);
    if (searched || searched !== null) {
      SearchInProductList();
    } else if (categoryWise || categoryWise !== null) {
      SearchCategoryWise();
    } else if (filtered || filtered !== null) {
      FilterList();
    } else {
      getProductList();
    }
  }, [numEachPage, minValue]);

  // useEffect(() => {
  //   console.log(minValue);
  //   if (searched || searched !== null) {
  //     SearchInProductList();
  //   } else if (categoryWise || categoryWise !== null) {
  //     SearchCategoryWise();
  //   } else if (filtered || filtered !== null) {
  //     FilterList();
  //   } else {
  //     getProductList();
  //   }
  // }, [minValue]);

  const categoryList = () => {
    setLoading(true);
    axios
      .post("/inv/category/list", {
        category_id: categoryId,
        store_id: storeId,
      })
      .then((response) => {
        console.log("category list ", response.data.data);
        setCategoryListItem(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    // getProductList();
    categoryList();
  }, []);

  const saveMultipleProductChanges = () => {
    setLoading(true);
    let params = isAnyItemUpdate.map((item) => {
      let o = {
        _id: item.products.id,
        stock: item.products.stock,
        selling_price: item.products.selling_price,
        offer: item.products.offer,
        tax: item.products.tax,
        is_auto_stock_update: item.products.is_auto_stock_update
          ? item.products.is_auto_stock_update
          : false,
        is_visible: item.products.is_visible ? item.products.is_visible : false,
        // stock_timing: [],
      };
      // if (item.products.is_auto_stock_update) {
      //   o = {
      //     ...o,
      //     is_auto_stock_update: item.products.is_auto_stock_update,
      //   };
      // }

      return o;
    });

    axios({
      method: "patch",
      url: "/inv/" + categoryId + "/" + storeId + "/up/stks",
      data: { inputs: params },
    })
      .then((response) => {
        console.log(response);
        getProductList();
        setIsAnyItemUpdate([]);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const onSelectItem = (e, o) => {
    console.log("checked =", e);
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

  const shopVisible = (e, index, o) => {
    //this section for update productList

    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      products: {
        ...productListUpdate[index].products,
        is_visible: e,
      },
    };
    setProductList(productListUpdate);

    // this section for update or add object in isAnyItemUpdate

    let xyz = isAnyItemUpdate.some(
      (o) => o.products.id === productListUpdate[index].products.id
    );
    let array = [...isAnyItemUpdate];
    if (!xyz) {
      array.push(productListUpdate[index]);
      setIsAnyItemUpdate(array);
    } else {
      let indexAs = isAnyItemUpdate.findIndex(
        (o) => o.products.id === productListUpdate[index].products.id
      );
      array[indexAs] = {
        ...array[indexAs],
        products: {
          ...array[indexAs].products,
          is_visible: e,
        },
      };
      setIsAnyItemUpdate(array);
    }
  };

  const updateProductStock = (stock, index) => {
    //this section for update productList

    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      products: {
        ...productListUpdate[index].products,
        stock: stock,
      },
    };
    setProductList(productListUpdate);

    // this section for update or add object in isAnyItemUpdate

    let xyz = isAnyItemUpdate.some(
      (o) => o.products.id === productListUpdate[index].products.id
    );
    let array = [...isAnyItemUpdate];
    if (!xyz) {
      array.push(productListUpdate[index]);
      setIsAnyItemUpdate(array);
    } else {
      let indexAs = isAnyItemUpdate.findIndex(
        (o) => o.products.id === productListUpdate[index].products.id
      );
      array[indexAs] = {
        ...array[indexAs],
        products: {
          ...array[indexAs].products,
          stock: stock,
        },
      };
      setIsAnyItemUpdate(array);
    }
  };
  const updateProductPrice = (price, index) => {
    //this section for update productList

    let productListUpdate = [...productList];
    productListUpdate[index] = {
      ...productListUpdate[index],
      products: {
        ...productListUpdate[index].products,
        selling_price: price,
      },
    };
    setProductList(productListUpdate);

    // this section for update or add object in isAnyItemUpdate

    let xyz = isAnyItemUpdate.some(
      (o) => o.products.id === productListUpdate[index].products.id
    );
    let array = [...isAnyItemUpdate];
    if (!xyz) {
      array.push(productListUpdate[index]);
      setIsAnyItemUpdate(array);
    } else {
      let indexAs = isAnyItemUpdate.findIndex(
        (o) => o.products.id === productListUpdate[index].products.id
      );
      array[indexAs] = {
        ...array[indexAs],
        products: {
          ...array[indexAs].products,
          selling_price: price,
        },
      };
      setIsAnyItemUpdate(array);
    }
  };

  // const AutoUpdateStock = (type, index) => {
  //   //this section for update productList

  //   let productListUpdate = [...productList];
  //   productListUpdate[index] = {
  //     ...productListUpdate[index],
  //     products: {
  //       ...productListUpdate[index].products,
  //       is_auto_stock_update: type,
  //     },
  //   };
  //   setProductList(productListUpdate);

  //   // this section for update or add object in isAnyItemUpdate

  //   let xyz = isAnyItemUpdate.some(
  //     (o) => o.products.id === productListUpdate[index].products.id
  //   );
  //   let array = [...isAnyItemUpdate];
  //   if (!xyz) {
  //     array.push(productListUpdate[index]);
  //     setIsAnyItemUpdate(array);
  //   } else {
  //     let indexAs = isAnyItemUpdate.findIndex(
  //       (o) => o.products.id === productListUpdate[index].products.id
  //     );
  //     array[indexAs] = {
  //       ...array[indexAs],
  //       products: {
  //         ...array[indexAs].products,
  //         is_auto_stock_update: type,
  //       },
  //     };
  //     setIsAnyItemUpdate(array);
  //   }
  // };

  const ConfirmDelete = () => {
    setLoading(true);
    let body = new FormData();
    body.append("ids", checkedProduct);
    axios
      .delete("/inv/" + categoryId + "/" + storeId + "/apr/del/prds", {
        data: {
          ids: checkedProduct,
        },
      })
      .then((response) => {
        console.log(response);
        onupdateStock();
        setLoading(false);
        message.success(response.data.message);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(
    () => console.log("checked product", checkedProduct),
    [checkedProduct]
  );
  useEffect(
    () => console.log("isAnyItemUpdate product", isAnyItemUpdate),
    [isAnyItemUpdate]
  );

  const SearchInProductList = (e) => {
    setLoading(true);
    if (e) {
      setSearched(e);
    }
    setFiltered(null);
    setCategoryWise(null);
    axios
      .post("/inv/apr/category/vw", {
        c_id: categoryId,
        s_id: storeId,
        lm: numEachPage,
        sk: minValue,
        search_keyword: e ? e : searched,
      })
      .then((response) => {
        console.log(response.data.data);
        setTotalCount(response.data.totalcount);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  //when user update stock of any product this function call
  //this will perform productlist locally and update isanyproductupdate array
  const onupdateStock = () => {
    setLoading(true);
    setIsAnyItemUpdate([]);
    setCheckedProduct([]);
    setFloatingMenu(false);
    getProductList();
    let newurl = window.location.pathname + "?refreshCount=true";
    history.push(newurl);
  };

  // this function calling while user select any filter
  //this function return productlist filter-wise
  const FilterList = (e) => {
    setLoading(true);
    setSearched(null);
    if (e) {
      setFiltered(e);
    }
    setCategoryWise(null);
    axios
      .post("/inv/apr/category/vw", {
        c_id: categoryId,
        s_id: storeId,
        lm: numEachPage,
        sk: minValue,
        sort: e
          ? e.split(" ").join("").toLowerCase()
          : filtered.split(" ").join("").toLowerCase(),
      })
      .then((response) => {
        console.log(response.data.data);
        setTotalCount(response.data.totalcount);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  //  this is for separate category by children array
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
      .post("/inv/apr/category/vw", {
        c_id: categoryId,
        s_id: storeId,
        lm: numEachPage,
        sk: minValue,
        category_name: e ? e : categoryWise,
      })
      .then((response) => {
        console.log(response.data.data);
        setTotalCount(response.data.totalcount);
        setProductList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

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

  const checkedAllProduct = () => {
    if (checkedProduct.length === productList.length) {
      setCheckedProduct([]);
    } else {
      let array = productList.map((o) => {
        return o.products.id;
      });
      setCheckedProduct(array);
    }
  };

  return (
    <div id="LiveProductList">
      <div style={{ position: "sticky", top: "13px", zIndex: 100 }}>
        <div className="top-action-div">
          <Card>
            <div className="top-action-div-main-div">
              <div
                style={{
                  width: "32%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Input
                  placeholder="Search Product"
                  prefix={<SearchOutlined />}
                  style={{
                    border: "1px solid rgb(224, 224, 224)",
                    marginRight: "15px",
                  }}
                  value={searched}
                  allowClear
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setSearched(e.target.value);
                      SearchInProductList(e.target.value);
                    } else {
                      getProductList();
                      setSearched(null);
                      setFiltered(null);
                      setCategoryWise(null);
                    }
                  }}
                />
                <div style={{ position: "relative", lineHeight: "normal" }}>
                  <FilterFilled
                    style={{ fontSize: "20px" }}
                    onClick={() => {
                      setFilterMenu((prev) => !prev);
                    }}
                  />
                  {filterMenu && (
                    <div className="filter-menu-div" ref={filterMenuRef}>
                      <Menu mode="inline" style={{ width: "170px" }}>
                        <Menu.Item
                          key="1"
                          onClick={() => {
                            getProductList();
                            setSearched(null);
                            setFiltered(null);
                            setCategoryWise(null);
                          }}
                        >
                          Live
                        </Menu.Item>
                        <Menu.Item
                          key="2"
                          onClick={() => {
                            FilterList("Zero Stock");
                          }}
                        >
                          Zero Stock
                        </Menu.Item>
                        <Menu.Item
                          key="3"
                          onClick={() => {
                            FilterList("Low Stock");
                          }}
                        >
                          Low Stock
                        </Menu.Item>
                        <Menu.Item
                          key="4"
                          onClick={() => {
                            FilterList("High Stock");
                          }}
                        >
                          High Stock
                        </Menu.Item>
                        <Menu.Item
                          key="5"
                          onClick={() => {
                            FilterList("UPC");
                          }}
                        >
                          UPC
                        </Menu.Item>
                        <Menu.Item
                          key="6"
                          onClick={() => {
                            FilterList("SKU");
                          }}
                        >
                          SKU
                        </Menu.Item>
                        <Menu.Item
                          key="7"
                          onClick={() => {
                            FilterList("Timer");
                          }}
                        >
                          Timer
                        </Menu.Item>
                        <Menu.Item
                          key="8"
                          onClick={() => {
                            FilterList("Zero Stock");
                          }}
                        >
                          Auto Stock
                        </Menu.Item>
                        <Menu.Item
                          key="9"
                          onClick={() => FilterList("Hidden")}
                        >
                          Hidden
                        </Menu.Item>
                      </Menu>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                //size="large"
                style={{
                  width: "150PX",
                  background: "rgb(2, 117, 216)",
                  border: "rgb(2, 117, 216)",
                }}
                onClick={() => props.OpenAddProduct(true)}
              >
                Add Product
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                //size="large"
                style={{
                  width: "150PX",
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
                      <Menu.Item key="1" onClick={() => setOpenUpcUpload(true)}>
                        Bulk UPC/EAN Upload
                      </Menu.Item>
                      <Menu.Item key="2" onClick={() => setOpenSkuUpload(true)}>
                        Bulk SKU Upload
                      </Menu.Item>
                      <Menu.Item
                        key="3"
                        onClick={() => {
                          props.OpenBulkUploadLog();
                          setFloatingMenu(false);
                        }}
                      >
                        Bulk Upload Log
                      </Menu.Item>
                      {/* <Menu.Item key="4">Filter</Menu.Item> */}
                      <Menu.Item key="5" onClick={checkedAllProduct}>
                        {checkedProduct.length === productList.length
                          ? "Unselect All"
                          : "Select All"}
                      </Menu.Item>
                      <Divider className="m-0" />
                      <Menu.Item
                        key="6"
                        onClick={() => props.AddNewProductOpen()}
                      >
                        Add New Product
                      </Menu.Item>
                    </Menu>
                  </div>
                )}
              </div>
            </div>

            <div
              className={
                checkedProduct.length > 0
                  ? "top-action-div-second-div d-flex"
                  : "top-action-div-second-div d-none"
              }
            >
              <div>
                <Button
                  //size="large"
                  icon={<SyncOutlined style={{ color: "#ea3170" }} />}
                  style={{
                    color: "#ea3170",
                    marginRight: "10px",
                  }}
                  onClick={() => setAutoStockModal(true)}
                >
                  Auto Stock Update
                </Button>
                <Button
                  // size="large"
                  icon={<ClockCircleOutlined style={{ color: "#ffa017" }} />}
                  style={{
                    color: "#ffa017",
                    marginLeft: "10px",
                  }}
                  onClick={() => setTimingModal(true)}
                >
                  Product Timing
                </Button>
              </div>
              <Popconfirm
                placement="bottomRight"
                title={
                  "Are you sure you want to delete the selected live products?"
                }
                onConfirm={ConfirmDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  //size="large"
                  icon={<MinusCircleFilled style={{ color: "#ff2d2d" }} />}
                  style={{
                    color: "#ff2d2d",
                  }}
                >
                  Delete Products
                </Button>
              </Popconfirm>
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
          <Row gutter={[24, 24]}>
            {productList &&
              productList.map((item, index) => {
                return (
                  <Col
                    xs={24}
                    sm={12}
                    md={12}
                    lg={8}
                    xl={6}
                    xxl={4}
                    span={6}
                    key={index}
                  >
                    <ProductItem
                      item={item}
                      updateProductStock={(stock) =>
                        updateProductStock(stock, index)
                      }
                      updateProductPrice={(price) =>
                        updateProductPrice(price, index)
                      }
                      onSelectItem={(e) => onSelectItem(e, item.products.id)}
                      shopVisible={(e) => shopVisible(e, index, item)}
                      checkedProduct={checkedProduct.some(
                        (o) => o === item.products.id
                      )}
                      UpdateThisProduct={() => setUpdateProduct(item)}
                      openProductTiming={() => {
                        setCheckedProduct([item]);
                        setTimingModal(true);
                      }}
                      openProductAutoUpdate={() => {
                        setCheckedProduct([item]);
                        setAutoStockModal(true);
                      }}
                      openProductInfo={() => {
                        let obj = { ...item.products, ...item.product_info };
                        props.openProductInfo(obj);
                      }}
                    />
                  </Col>
                );
              })}
          </Row>
        )}
      </div>

      <div
        className={
          isAnyItemUpdate.length > 0
            ? "bottom-floating-menu d-flex"
            : "bottom-floating-menu d-none"
        }
      >
        <Button
          type="primary"
          style={{ background: "#f61d3a", borderColor: "#f61d3a" }}
          onClick={() => {
            setIsAnyItemUpdate([]);
            getProductList();
          }}
        >
          Cancel
        </Button>
        <Button
          style={{ background: "#4bdd4b", borderColor: "#8bc34a" }}
          onClick={saveMultipleProductChanges}
        >
          save
        </Button>
      </div>

      <PaginationWithApi
        minValue={minValue}
        handlePageChange={handlePageChange}
        handlePageCountChange={handlePageCountChange}
        maxValue={maxValue}
        numEachPage={numEachPage}
        orderList={totalCount}
      />

      <AutoUpdateStockModal
        storeId={storeId}
        categoryId={categoryId}
        // onupdateStock={onupdateStock}
        checkedProduct={checkedProduct}
        AutoUpdateModal={autoStockModal}
        onClose={() => {
          onupdateStock();
          setAutoStockModal(false);
        }}
      />
      <ProductTimingModal
        storeId={storeId}
        // onupdateStock={onupdateStock}
        categoryId={categoryId}
        checkedProduct={checkedProduct}
        TimingModal={timingModal}
        onClose={() => {
          onupdateStock();
          setTimingModal(false);
        }}
      />
      <ScanProductModal
        storeId={storeId}
        history={history}
        categoryId={categoryId}
        openScanProduct={scanProduct}
        onClose={() => setScanProduct(false)}
      />
      <UpdateProductModal
        item={updateProduct}
        storeId={storeId}
        categoryId={categoryId}
        // onupdateStock={onupdateStock}
        openUpdateProduct={updateProduct}
        onClose={() => {
          onupdateStock();
          setUpdateProduct(false);
        }}
      />
      <UPCUploadModal
        storeId={storeId}
        status="live"
        categoryId={categoryId}
        openUpcUpload={openUpcUpload}
        onClose={() => {
          onupdateStock();
          setOpenUpcUpload(false);
        }}
      />
      <SKUUploadModal
        storeId={storeId}
        status="live"
        categoryId={categoryId}
        openSkuUpload={openSkuUpload}
        onClose={() => {
          onupdateStock();
          setOpenSkuUpload(false);
        }}
      />
    </div>
  );
}

export default ProductList;
