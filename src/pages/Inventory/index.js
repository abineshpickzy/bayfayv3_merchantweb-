import "./Inventory.less";
import React, { useEffect, useState } from "react";
import { Switch as SwitchRout, Route, Link } from "react-router-dom";
import axios from "axios";
import { UnApprovedProducts, LiveProducts, MainLayout } from "../../components";
import { message, Switch, Modal, Button, Spin } from "antd";
import { connect } from "react-redux";

const Inventory = (props) => {
  const [liveProductCount, setLiveProductCount] = useState();
  const [unApprovedProductCount, setUnApprovedProductCount] = useState();
  const [shopOpen, setShopOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [switchChange, setSwitchChange] = useState(false);
  const { categoryId, storeId } = props.match.params;

  useEffect(() => {
    setLoading(true);
    axios
      .get("/inv/" + categoryId + "/" + storeId + "/apr/vw?lm=25&sk=0")
      .then((res) => {
        console.log("Inventory live product Count: ", res.data.totalcount);
        setLiveProductCount(res.data.totalcount);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/inventory/" + categoryId + "/" + storeId + "/unapr/vw?lm=25&sk=0")
      .then((res) => {
        console.log(
          "Inventory unApproved product Count: ",
          res.data.data.total
        );
        // setLiveProductCount(res.data);
        setUnApprovedProductCount(res.data.data.total);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("props changes ....");
    console.log(props.locationQs);
    if (props.location.search.includes("?refreshCount=true")) {
      // getOrders();
      console.log("called count again ....");

      axios
        .get(
          "/inventory/" + categoryId + "/" + storeId + "/unapr/vw?lm=25&sk=0"
        )
        .then((res) => {
          console.log(
            "Inventory unApproved product Count: ",
            res.data.data.total
          );
          // setLiveProductCount(res.data);
          setUnApprovedProductCount(res.data.data.total);
          setLoading(false);
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
          setLoading(false);
        });

      axios
        .get("/inv/" + categoryId + "/" + storeId + "/apr/vw?lm=25&sk=0")
        .then((res) => {
          console.log("Inventory live product Count: ", res.data.totalcount);
          setLiveProductCount(res.data.totalcount);
          setLoading(false);
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
          setLoading(false);
        });
    }
  }, [props]);

  useEffect(() => {
    setLoading(true);
    axios
      .post("/shop/view/basic", {
        category_id: categoryId,
        shop_id: storeId,
      })
      .then((res) => {
        console.log("inventory shop detail: ", res.data.data);
        setShopOpen(res.data.data.is_open);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
        setLoading(false);
      });
  }, []);

  let selectedTab = findLastIndex(props.location.pathname, "/");

  function findLastIndex(str, x) {
    let index = -1;
    for (let i = 0; i < str.length; i++) if (str[i] === x) index = i;
    return index;
  }

  const EditShop = () => {
    setLoading(true);
    axios
      .post("/shop/edit", {
        category_id: categoryId,
        shop_id: storeId,
        data: {
          is_open: !shopOpen,
          private_is_open: !shopOpen,
        },
      })
      .then((res) => {
        console.log("Inventory  Shop Edit: ", res.data);
        res.data.success === true && setShopOpen(!shopOpen);
        setSwitchChange(false);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        setSwitchChange(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  return (
    <MainLayout
      categoryId={categoryId}
      storeId={storeId}
      history={props.history}
    >
      <div role="tablist" className="ant-tabs-nav custom-tab">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="ant-tabs-nav-wrap">
            <div
              className="ant-tabs-nav-list"
              style={{ transform: "translate(0px, 0px)" }}
            >
              <Link to={"/store/inventory/" + storeId + "/" + categoryId}>
                <div
                  className={
                    props.location.pathname.includes("") && selectedTab < 45
                      ? "ant-tabs-tab active"
                      : "ant-tabs-tab "
                  }
                >
                  <div
                    role="tab"
                    aria-selected="true"
                    className="ant-tabs-tab-btn"
                    tabIndex="0"
                    id="rc-tabs-5-tab-1"
                    aria-controls="rc-tabs-5-panel-1"
                  >
                    Live ({liveProductCount ? liveProductCount : 0})
                  </div>
                </div>
              </Link>
              <Link
                to={
                  "/store/inventory/" +
                  storeId +
                  "/" +
                  categoryId +
                  "/unapproved-products"
                }
              >
                <div
                  className={
                    props.location.pathname.includes("unapproved")
                      ? "ant-tabs-tab active"
                      : "ant-tabs-tab "
                  }
                >
                  <div
                    role="tab"
                    aria-selected="true"
                    className="ant-tabs-tab-btn"
                    tabIndex="0"
                    id="rc-tabs-5-tab-1"
                    aria-controls="rc-tabs-5-panel-1"
                  >
                    UnApproved (
                    {unApprovedProductCount ? unApprovedProductCount : 0})
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="shop-on-off">
            <span style={{ fontSize: "initial", verticalAlign: "middle" }}>
              Shop ON/OFF
            </span>
            &ensp;
            <Switch
              checkedChildren="Open"
              unCheckedChildren="Close"
              checked={shopOpen}
              onChange={(e) => {
                console.log(e);
                setSwitchChange(true);
              }}
            />
          </div>
        </div>
      </div>

      <SwitchRout>
        <Route
          exact
          path="/store/inventory/:storeId/:categoryId"
          component={LiveProducts}
        />
        <Route
          exact
          path="/store/inventory/:storeId/:categoryId/unapproved-products"
          component={UnApprovedProducts}
        />
      </SwitchRout>
      <Modal
        title="Info"
        visible={switchChange}
        onCancel={() => setSwitchChange(false)}
        centered
        className="shop-open-close-modal"
        footer={[
          <Button key="1" type="link" onClick={() => setSwitchChange(false)}>
            Cancel
          </Button>,
          <Button key="1" type="link" onClick={() => EditShop()}>
            Ok
          </Button>,
        ]}
      >
        <div>Do you want to {shopOpen ? "close" : "open"} the shop?</div>
      </Modal>
    </MainLayout>
  );
};

const mapStateToProps = (state) => {
  return {
    state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (data) => {
      dispatch({
        type: "LOGIN",
        payload: data,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inventory);
