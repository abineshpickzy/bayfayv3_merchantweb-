import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import MainLayout from "../../components/MainLayout";
import s from "./AllOrders.module.less";
import { NavLink, Route, Switch } from "react-router-dom";
import { getOrdersCount } from "./utils";
import NewOrders from "./NewOrders";
import Packaging from "./Packaging";
import Dispatched from "./Dispatched";
import Shipping from "./Shipping";
import Delivered from "./Delivered";
import Cancelled from "./Cancelled";
import Replacement from "./Replacement";
import { Spin } from "antd";
import { io } from "socket.io-client";

const links = [
  { title: "New Orders", to: "/store/all-orders/" },
  { title: "Packaging", to: "/store/all-orders/packaging" },
  { title: "Dispatched", to: "/store/all-orders/dispatched" },
  { title: "Shipping", to: "/store/all-orders/shipping" },
  { title: "Delivered", to: "/store/all-orders/delivered" },
  { title: "Cancelled", to: "/store/all-orders/canceled" },
  { title: "Replacement / Refund", to: "/store/all-orders/replacement" },
];

const AllOrders = (props) => {
  const [ordersCountArray, setOrdersCountArray] = useState([]);

  let interval = null;
  let timesRun = 0;
  let audio = new Audio("/assets/beep.wav");

  const handleOnCountChange = (status, count) => {
    setOrdersCountArray((prevState) =>
      prevState.map((item, index) => {
        if (status === 6 && index === 5) return { ...item, count };
        if (status === 7 && index === 6) return { ...item, count };
        if (status === index + 1 && status !== 6 && status !== 7)
          return { ...item, count };

        return item;
      })
    );
  };

  useEffect(() => {
    document.addEventListener("click", () => {
      clearInterval(interval);
      interval = null;
      timesRun = 0;
    });

    getOrdersCount().then((response) => {
      setOrdersCountArray(response);
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
          }, 20000);
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
          }, 20000);
        }

        props.history.push({
          search: `?refresh=${true}`,
        });
      });
      return () => {
        socket.disconnect();
        console.log("socket disconnect call");
      };
    }
  }, []);

  return (
    <MainLayout history={props.history}>
      <div className={s.container}>
        <React.Fragment>
          <div className="tabs">
            {links.map(({ title, to }, index) => (
              <NavLink
                exact
                className="tab"
                activeClassName="active"
                key={title}
                to={to}
              >
                {ordersCountArray[index] ? (
                  <React.Fragment>
                    {title} ({ordersCountArray[index]?.count})
                  </React.Fragment>
                ) : (
                  <Spin size="small" />
                )}
              </NavLink>
            ))}
          </div>

          <Switch>
            <Route path="/store/all-orders" exact>
              <NewOrders
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/packaging" exact>
              <Packaging
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/dispatched" exact>
              <Dispatched
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/shipping" exact>
              <Shipping
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/delivered" exact>
              <Delivered
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/canceled" exact>
              <Cancelled
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
            <Route path="/store/all-orders/replacement" exact>
              <Replacement
                history={props.history}
                location={props.location}
                onCountChange={handleOnCountChange}
              />
            </Route>
          </Switch>
        </React.Fragment>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(AllOrders);
