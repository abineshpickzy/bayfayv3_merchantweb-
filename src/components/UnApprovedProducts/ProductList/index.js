import React, { useState, useRef, useEffect } from "react";
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
  Divider,
  Popconfirm,
} from "antd";
import axios from "axios";
import ProductItem from "./ProductItem";
import PaginationWithApi from "../../PaginationWithApi";
import UPCUploadModal from "../../UPC_EAN_UploadModal";
import SKUUploadModal from "../../SKU_ManageStockModal";
import ScanProductModal from "../../ScanProductModal";
import Modal from "antd/lib/modal/Modal";

function ProductList(props) {
  const [floatingMenu, setFloatingMenu] = useState(false);
  const [openUpcUpload, setOpenUpcUpload] = useState(false);
  const [openSkuUpload, setOpenSkuUpload] = useState(false);
  const [checkedProduct, setCheckedProduct] = useState([]);
  const [productList, setProductList] = useState([]);
  const [totalCount, setTotalCount] = useState();
  const [loading, setLoading] = useState(true);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);
  const [scanProduct, setScanProduct] = useState(false);
  const [filterMenu, setFilterMenu] = useState(false);
  const [searched, setSearched] = useState(null);
  const [filtered, setFiltered] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const floatActionMenu = useRef(null);
  const filterMenuRef = useRef(null);
  const popConfirmRef = useRef(null);

  const { categoryId, storeId } = props;

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

  const getProductList = () => {
    setLoading(true);
    axios
      .get(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/unapr/vw?lm=" +
          numEachPage +
          "&sk=" +
          minValue
      )
      .then((response) => {
        console.log("Inventory unApproved Product List:", response.data.data);
        setTotalCount(response.data.data.total);
        setProductList(response.data.data.products);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  // useEffect(() => {
  //   getProductList();
  //   // categoryList();
  // }, []);

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

  useEffect(() => {
    console.log(numEachPage);
    // localStorage.setItem("numEachPage", numEachPage);
    if (searched || searched !== null) {
      SearchInProductList();
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
  //   } else if (filtered || filtered !== null) {
  //     FilterList();
  //   } else {
  //     getProductList();
  //   }
  // }, [minValue]);

  const checkedAllProduct = () => {
    if (checkedProduct.length === productList.length) {
      setCheckedProduct([]);
    } else {
      let array = productList.map((o) => {
        return o;
      });
      setCheckedProduct(array);
    }
  };

  const onSelectItem = (e, o) => {
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
  //delete selected products
  const ConfirmDelete = () => {
    setLoading(true);
    let array = checkedProduct.filter((o) => o.status !== 1);
    let ids = array.map((o) => o._id);
    if (ids.length === 0) {
      message.error("Please select any draft product !");
      setLoading(false);
      setCheckedProduct([]);
      return;
    }
    axios
      .delete("/inv/" + categoryId + "/unapr/del/prds", {
        data: {
          ids: ids,
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

  //when user update stock of any product this function call
  //this will perform productlist locally and update isanyproductupdate array
  const onupdateStock = () => {
    setLoading(true);
    // setIsAnyItemUpdate([]);
    setCheckedProduct([]);
    setFloatingMenu(false);
    getProductList();
    let newurl = window.location.pathname + "?refreshCount=true";
    props.history.push(newurl);
  };

  const SearchInProductList = (e) => {
    setLoading(true);
    if (e) {
      setSearched(e);
    }
    setFiltered(null);
    let search_keyword = e ? e : searched;
    axios
      .get(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/unapr/vw?lm=" +
          numEachPage +
          "&sk=" +
          minValue +
          "&name=" +
          search_keyword
      )
      .then((response) => {
        console.log("UnApproved Searched List:", response.data);
        setTotalCount(response.data.data.total);
        setProductList(response.data.data.products);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  const FilterList = (e) => {
    setLoading(true);
    setSearched(null);
    let sku_upc, sort;
    if (e) {
      setFiltered(e);
    }

    let status;
    if (e) {
      status = e === "SKU" || e === "UPC" ? "&sku_upc=" : "&status=";
    } else {
      status =
        filtered === "SKU" || filtered === "UPC" ? "&sku_upc=" : "&status=";
    }
    sort = e
      ? e.split(" ").join("").toLowerCase()
      : filtered.split(" ").join("").toLowerCase();

    axios
      .get(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/unapr/vw?lm=" +
          numEachPage +
          "&sk=" +
          minValue +
          status +
          sort
      )
      .then((response) => {
        console.log("UnApproved Searched List:", response.data);
        setTotalCount(response.data.data.total);
        setProductList(response.data.data.products);
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
    <div id="UnApprovedProductList">
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
                  onChange={(e) => {
                    if (e.target.value !== "") {
                      setSearched(e.target.value);
                      SearchInProductList(e.target.value);
                    } else {
                      getProductList();
                      setSearched(null);
                      setFiltered(null);
                    }
                  }}
                  allowClear
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
                          }}
                        >
                          All
                        </Menu.Item>
                        <Menu.Item
                          key="2"
                          onClick={() => {
                            FilterList("Draft");
                          }}
                        >
                          Draft
                        </Menu.Item>
                        <Menu.Item
                          key="3"
                          onClick={() => {
                            FilterList(" Wait");
                          }}
                        >
                          Waiting For Review
                        </Menu.Item>
                        <Menu.Item
                          key="4"
                          onClick={() => {
                            FilterList("UPC");
                          }}
                        >
                          UPC
                        </Menu.Item>
                        <Menu.Item
                          key="5"
                          onClick={() => {
                            FilterList("SKU");
                          }}
                        >
                          SKU
                        </Menu.Item>
                        <Menu.Item
                          key="6"
                          onClick={() => {
                            FilterList("Reject");
                          }}
                        >
                          Rejected
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
                onClick={() => props.AddNewProductOpen(true)}
              >
                Add New Product
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
                      <Menu.Item key="5" onClick={checkedAllProduct}>
                        {checkedProduct.length === productList.length
                          ? "Unselect All"
                          : "Select All"}
                      </Menu.Item>
                      <Divider className="m-0" />

                      <Menu.Item
                        key="6"
                        disabled={checkedProduct.length > 0 ? false : true}
                        onClick={() => setConfirm(true)}
                        style={{ color: "red" }}
                        className="delete-menu"
                      >
                        Delete
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
          <Row gutter={[24, 24]} style={{ justifyContent: "center" }}>
            {productList &&
              productList.map((item, index) => {
                return (
                  <Col span={20} key={index}>
                    <ProductItem
                      item={item}
                      onSelectItem={(e) => onSelectItem(e, item)}
                      checkedProduct={checkedProduct.some((o) => o === item)}
                      EditProduct={() => props.AddNewProductOpen(item)}
                    />
                  </Col>
                );
              })}
          </Row>
        )}
      </div>

      <Modal
        visible={confirm}
        onCancel={() => setConfirm(false)}
        centered
        className="shop-open-close-modal"
        footer={[
          <Button key="1" type="link" onClick={() => setConfirm(false)}>
            Cancel
          </Button>,
          <Button
            key="1"
            type="link"
            onClick={() => {
              setConfirm(false);
              ConfirmDelete();
            }}
          >
            Ok
          </Button>,
        ]}
      >
        <div>Are you sure you want to delete selected products?</div>
      </Modal>

      <PaginationWithApi
        minValue={minValue}
        handlePageChange={handlePageChange}
        handlePageCountChange={handlePageCountChange}
        maxValue={maxValue}
        numEachPage={numEachPage}
        orderList={totalCount}
      />

      <UPCUploadModal
        status="unApprove"
        storeId={storeId}
        categoryId={categoryId}
        openUpcUpload={openUpcUpload}
        onClose={() => {
          onupdateStock();
          setOpenUpcUpload(false);
        }}
      />
      <SKUUploadModal
        storeId={storeId}
        status="unApprove"
        categoryId={categoryId}
        openSkuUpload={openSkuUpload}
        onClose={() => {
          setOpenSkuUpload(false);
          onupdateStock();
        }}
      />
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

export default ProductList;
