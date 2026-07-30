import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Layout, Menu, Button } from "antd";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  NavLink,
} from "react-router-dom";
import Image from "../Image";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  MenuOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  LogoutOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  MailOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { connect } from "react-redux";
import "./Layout.less";
import axios from "axios";

const { Header, Sider, Content, Footer } = Layout;
const { SubMenu } = Menu;

function MainLayout(props) {
  const [collapsed, setCollapsed] = useState(false);
  const [storeName, setStoreName] = useState();

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    setStoreName(JSON.parse(localStorage.getItem("storeName")));
  }, []);
  const { categoryId, storeId, user } = props;

  if (user === null) {
    return <Redirect to="/login" />;
  }

  return (
    <>
      <Layout>
        <Sider
          trigger={null}
          collapsible={false}
          theme="light"
          className="side-bar-root"
          collapsed={collapsed}
        >
          <Menu
            theme="light"
            mode="inline"
            defaultSelectedKeys={[
              (categoryId === null || categoryId === undefined) &&
              (storeId === null || storeId === undefined)
                ? "4"
                : "2",
            ]}
            selectedKeys={
              props.history.location.pathname.includes("dashboard")
                ? ["1"]
                : props.history.location.pathname.includes(
                    "orders" || "all-orders"
                  )
                ? ["2"]
                : props.history.location.pathname.includes("inventory")
                ? ["3"]
                : props.history.location.pathname.includes("store") && ["4"]
            }
            style={{ bakgroundColor: "#fafafa" }}
          >
            {(categoryId === null || categoryId === undefined) &&
            (storeId === null || storeId === undefined) ? (
              <>
                <Menu.Item
                  key="4"
                  icon={<ShopOutlined style={{ fontSize: "22px" }} />}
                >
                  <Link to="/store">Store List</Link>
                </Menu.Item>
                {/* <Menu.Item key="5" icon={<UserOutlined />}>
                  Users
                </Menu.Item>
                <Menu.Item key="6" icon={<UsergroupAddOutlined />}>
                  Groups
                </Menu.Item>
                <Menu.Item key="7" icon={<UploadOutlined />}>
                  Assign Roles
                </Menu.Item>
                <Menu.Item key="8" icon={<UserOutlined />}>
                  Profile
                </Menu.Item>
                <Menu.Item key="9" icon={<SettingOutlined />}>
                  Setting
                </Menu.Item>
                <Menu.Item key="10" icon={<UploadOutlined />}>
                  Help
                </Menu.Item> */}
              </>
            ) : (
              <>
                {collapsed ? (
                  <div
                    style={{
                      borderBottom: "solid 1px #b5b5b5",
                    }}
                  >
                    {storeName && (
                      <Image
                        url={
                          storeName.private_icon
                            ? `${process.env.REACT_APP_BASE_URL}/merchant/category/image?width=200&height=200&file=${storeName.private_icon}&format=png`
                            : `${process.env.REACT_APP_USER_URL}/category/view/img?img=${storeName.category_image}&width=400&height=400`
                        }
                        style={{
                          width: "85%",
                          margin: "5px auto",
                          padding: "5px",
                        }}
                        preview={false}
                        imageName={storeName.category_image}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      borderBottom: "solid 1px #b5b5b5",
                      display: "flex",
                      alignItems: "center",
                      padding: "5px",
                    }}
                  >
                    {storeName && (
                      <Image
                        url={
                          storeName.private_icon
                            ? `${process.env.REACT_APP_BASE_URL}/merchant/category/image?width=200&height=200&file=${storeName.private_icon}&format=png`
                            : `${process.env.REACT_APP_USER_URL}/category/view/img?img=${storeName.category_image}&width=400&height=400`
                        }
                        style={{
                          width: "30%",
                          margin: "5px 2px",
                        }}
                        preview={false}
                        imageName={storeName.category_image}
                      />
                    )}
                    <h3
                      style={{
                        margin: 0,
                        lineHeight: "initial",
                        textAlign: "center",
                        padding: "0 10px",
                        width: "70%",
                      }}
                    >
                      {storeName?.display_name}
                    </h3>
                  </div>
                )}
                {/* <Menu.Item key="1" icon={<DashboardOutlined />}>
                  <Link to="/dashboard"> Dashboard </Link>
                </Menu.Item> */}
                <Menu.Item key="2" icon={<OrderedListOutlined />}>
                  <Link to={"/store/orders/" + storeId + "/" + categoryId}>
                    Orders
                  </Link>
                </Menu.Item>
                <Menu.Item key="3" icon={<ShoppingOutlined />}>
                  <Link to={"/store/inventory/" + storeId + "/" + categoryId}>
                    Inventory
                  </Link>
                </Menu.Item>
              </>
            )}
          </Menu>
        </Sider>

        <Header
          className="site-layout-background"
          style={{ padding: "0 20px", backgroundColor: "#e0e0e0" }}
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              className="header-menu"
              style={{ display: "flex", alignItems: "center" }}
            >
              {React.createElement(collapsed ? MenuOutlined : MenuOutlined, {
                className: "trigger",
                onClick: toggle,
              })}
              <img src="/assets/logo192.webp" className="menu-logo-Image" />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "80px",
                padding: "0 10px",
              }}
            >
              <ul className="header-menu-list">
                <li style={{ padding: "0 5px", lineHeight: "15px " }}>
                  <NavLink
                    activeStyle={{
                      color: "black",
                      borderBottom: "1px solid black",
                    }}
                    exact
                    to="/store"
                    style={{ color: "#3f51b5" }}
                    onClick={() => localStorage.setItem("storeName", null)}
                  >
                    Home
                  </NavLink>
                </li>
                <li style={{ padding: "0 2px", lineHeight: "15px " }}>|</li>
                <li style={{ padding: "0 5px", lineHeight: "15px " }}>
                  <NavLink
                    activeStyle={{
                      color: "black",
                      borderBottom: "1px solid black",
                    }}
                    to="/dashboard"
                    style={{ color: "#3f51b5" }}
                    onClick={() => localStorage.setItem("storeName", null)}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li style={{ padding: "0 2px", lineHeight: "15px " }}>|</li>
                <li style={{ padding: "0 5px", lineHeight: "15px " }}>
                  <NavLink
                    activeStyle={{
                      color: "black",
                      borderBottom: "1px solid black",
                    }}
                    to="/store/all-orders/"
                    style={{ color: "#3f51b5" }}
                    onClick={() => localStorage.setItem("storeName", null)}
                  >
                    View Orders
                  </NavLink>
                </li>
                {/* <li
                  style={{
                    padding: "0 5px",
                    borderLeft: "solid 2px #757575",
                    lineHeight: "15px ",
                  }}
                >
                  <Link to="/dashboard" style={{ color: "#3f51b5" }}>
                    Dashboard
                  </Link>
                </li>
                <li
                  style={{
                    padding: "0 5px",
                    borderLeft: "solid 2px #757575",
                    lineHeight: "15px ",
                  }}
                >
                  <Link to="/" style={{ color: "#3f51b5" }}>
                    View Orders
                  </Link>
                </li>
                <li
                  style={{
                    padding: "0 5px",
                    borderLeft: "solid 2px #757575",
                    lineHeight: "15px",
                  }}
                >
                  <Link to="/" style={{ color: "#3f51b5" }}>
                    Billing
                  </Link>
                </li>
                <li
                  style={{
                    padding: "0 5px",
                    borderLeft: "solid 2px #757575",
                    lineHeight: "15px ",
                  }}
                >
                  <Link to="/" style={{ color: "#3f51b5" }}>
                    Transaction History
                  </Link>
                </li> */}
              </ul>
            </div>
          </div>
          <div>
            <Button
              className="account-btn"
              type="default"
              size={22}
              onClick={props.logout}
              icon={<LogoutOutlined />}
            >
              Log Out
            </Button>
          </div>
        </Header>

        <Layout className="site-layout">
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              backgroundColor: "#f5f5f5",
            }}
          >
            {props.children}
            <Footer
              style={{
                textAlign: "center",
                padding: "5px",
                borderTop: "solid 1px #ccc",
                backgroundColor: "#fafafa",
                margin: " 10px -30px",
              }}
            >
              Copyright @ 2019, Powered by PickZy
            </Footer>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logout: (data) => {
      dispatch({
        type: "LOGOUT",
        payload: data,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainLayout);
