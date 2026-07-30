import "./Orders.less";
import React, { useEffect, useState } from "react";
import { Tabs, message } from "antd";
import {
    MainLayout,
    NewOrders,
    Packaging,
    Dispatched,
    Delivered,
    Shipping,
    Cancelled,
    Replacement,
} from "../../components";
import { Switch, Route, Link } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { connect } from "react-redux";

const Order = (props) => {
  const [orderCount, setOrderCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const { categoryId, storeId } = props.match.params;

  let interval = null;
  let timesRun = 0;
  let audio = new Audio("/assets/beep.wav");

  useEffect(() => {
    console.log(props);
    Notification.requestPermission().then((res) => {
      console.log(res);
    });

    document.addEventListener("click", () => {
      console.log("clear interval");
      clearInterval(interval);
      interval = null;
      timesRun = 0;
    });

    if (props.state.user) {
      const socket = io(process.env.REACT_APP_SOCKET_URL, {
        // transports: ["websocket", "polling"],
        query: {
          token: props.state.user.auth_token.access.token,
        },
      });

      socket.on("connect", (s) => {
        console.log("connect ....", s);
      });

      socket.on("disconnect", () => {
        console.log("user disconnected");
      });

      socket.on("connection", (e) => {
        console.log("connection .....");
        socket.emit("join", { email: props.state.user.merchant_profile.id });
        console.log(e);
      });

      socket.on("new_order", async (e) => {
        console.log("new_order .....");
        console.log(e);

        audio.play();

        if (!interval) {
          interval = setInterval(() => {
            audio.play();
            timesRun += 0.5;
            if (timesRun === 5.0) {
              clearInterval(interval);
              console.log("clear interval time");
              interval = null;
              timesRun = 0;
            }
          }, 30000);
        } else {
          clearInterval(interval);
          console.log("Clear first interval");
          interval = null;
          timesRun = 0;
          interval = setInterval(() => {
            audio.play();
            timesRun += 0.5;
            if (timesRun === 5.0) {
              clearInterval(interval);
              console.log("clear interval time");
              interval = null;
              timesRun = 0;
            }
          }, 30000);
        }

        let result = await Notification.requestPermission();
        console.log(result);

        var notification = new Notification("New Order", { body: e.address });

        // notification.onclick = function (event) {
        //   event.preventDefault(); // prevent the browser from focusing the Notification's tab
        //   clearInterval(interval);
        //   console.log("clear interval time");
        //   interval = null;
        //   timesRun = 0;
        //   // window.open();
        //   // window.focus();
        // };

        if (
          "/store/orders/" + storeId + "/" + categoryId ===
          props.location.pathname
        ) {
          props.history.push(
            "/store/orders/" + storeId + "/" + categoryId + "?refresh=true"
          );
        }

        axios
          .post("/order/count", {
            shop_id: storeId,
          })
          .then((response) => {
            setOrderCount(response.data.data);
          })
          .catch((error) => {
            message.error(
              error?.response?.data?.message || "Something went wrong."
            );
          });
      });
      return () => {
        socket.disconnect();
        console.log("socket disconnect call");
      };
    }
  }, []);

  useEffect(() => {
    console.log("props changes ....");
    console.log(props.locationQs);
    if (props.location.search.includes("?refreshCount=true")) {
      // getOrders();
      console.log("called count again ....");
      axios
        .post("/order/count", {
          shop_id: storeId,
        })
        .then((response) => {
          setOrderCount(response.data.data);
          setLoading(false);
          props.history.push(props.location.pathname);
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went wrong."
          );
        });
    }
  }, [props]);

  useEffect(() => {
    axios
      .post("/order/count", {
        shop_id: storeId,
      })
      .then((response) => {
        setOrderCount(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  }, []);

  let selectedTab = findLastIndex(props.location.pathname, "/");

  function findLastIndex(str, x) {
    let index = -1;
    for (let i = 0; i < str.length; i++) if (str[i] === x) index = i;
    return index;
  }

  return (
    <MainLayout
      categoryId={categoryId}
      storeId={storeId}
      history={props.history}
    >
      <div role="tablist" className="ant-tabs-nav custom-tab">
        <div className="ant-tabs-nav-wrap">
          <div
            className="ant-tabs-nav-list"
            style={{ transform: "translate(0px, 0px)" }}
          >
            <Link to={"/store/orders/" + storeId + "/" + categoryId}>
              <div
                className={
                  props.location.pathname.includes("") && selectedTab < 40
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
                  New Orders ({orderCount.newOrders})
                </div>
              </div>
            </Link>
            <Link
              to={"/store/orders/" + storeId + "/" + categoryId + "/packaging"}
            >
              <div
                className={
                  props.location.pathname.includes("packaging")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="1"
                  id="rc-tabs-5-tab-2"
                  aria-controls="rc-tabs-5-panel-2"
                >
                  Packaging ({orderCount.acceptedOrders})
                </div>
              </div>
            </Link>
            <Link
              to={"/store/orders/" + storeId + "/" + categoryId + "/dispatched"}
            >
              <div
                className={
                  props.location.pathname.includes("dispatched")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="2"
                  id="rc-tabs-5-tab-3"
                  aria-controls="rc-tabs-5-panel-3"
                >
                  Dispatched ({orderCount.readyToShipOrders})
                </div>
              </div>
            </Link>
            <Link
              to={"/store/orders/" + storeId + "/" + categoryId + "/shipping"}
            >
              <div
                className={
                  props.location.pathname.includes("shipping")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="3"
                  id="rc-tabs-5-tab-4"
                  aria-controls="rc-tabs-5-panel-4"
                >
                  Shipping ({orderCount.shippingOrders})
                </div>
              </div>
            </Link>
            <Link
              to={"/store/orders/" + storeId + "/" + categoryId + "/delivered"}
            >
              <div
                className={
                  props.location.pathname.includes("delivered")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="4"
                  id="rc-tabs-5-tab-5"
                  aria-controls="rc-tabs-5-panel-5"
                >
                  Delivered({orderCount.deliveredOrders})
                </div>
              </div>
            </Link>
            <Link
              to={"/store/orders/" + storeId + "/" + categoryId + "/cancelled"}
            >
              <div
                className={
                  props.location.pathname.includes("cancelled")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="5"
                  id="rc-tabs-5-tab-6"
                  aria-controls="rc-tabs-5-panel-6"
                >
                  Cancelled ({orderCount.cancelledOrders})
                </div>
              </div>
            </Link>
            <Link
              to={
                "/store/orders/" + storeId + "/" + categoryId + "/replacement"
              }
            >
              <div
                className={
                  props.location.pathname.includes("replacement")
                    ? "ant-tabs-tab active"
                    : "ant-tabs-tab "
                }
              >
                <div
                  role="tab"
                  aria-selected="false"
                  className="ant-tabs-tab-btn"
                  tabIndex="6"
                  id="rc-tabs-5-tab-7"
                  aria-controls="rc-tabs-5-panel-7"
                >
                  Replacement / Refund ({orderCount.escalatedOrders})
                </div>
              </div>
            </Link>
            <div
              className="ant-tabs-ink-bar ant-tabs-ink-bar-animated"
              style={{ left: "0px", width: "134px" }}
            ></div>
          </div>
        </div>
      </div>

      <Switch>
        <Route
          exact
          path="/store/orders/:storeId/:categoryId"
          component={NewOrders}
        />
        <Route
          exact
          path="/store/orders/:storeId/:categoryId/packaging"
          component={Packaging}
        />
        <Route
          exact
          path="/store/orders/:storeId/:categoryId/dispatched"
          component={Dispatched}
        />
        <Route
          path="/store/orders/:storeId/:categoryId/shipping"
          component={Shipping}
        />
        <Route
          path="/store/orders/:storeId/:categoryId/delivered"
          component={Delivered}
        />
        <Route
          path="/store/orders/:storeId/:categoryId/cancelled"
          component={Cancelled}
        />
        <Route
          path="/store/orders/:storeId/:categoryId/replacement"
          component={Replacement}
        />
      </Switch>
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

export default connect(mapStateToProps, mapDispatchToProps)(Order);
