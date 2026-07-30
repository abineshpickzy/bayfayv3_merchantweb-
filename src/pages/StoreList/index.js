import React, { useEffect, useState } from "react";
import { Row, Col, Grid, Tabs, message, Spin } from "antd";
import { MainLayout, StoreListItem } from "../../components";
import axios from "axios";
import { useSelector } from "react-redux";

const { TabPane } = Tabs;

function StoreList(props) {
  const user = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [shopList, setShopList] = useState([]);
  const [internalShopList, setInternalShopList] = useState([]);
  const [wholesale, setWholesale] = useState([]);
  const [externalShopList, setExternalShopList] = useState([]);

  useEffect(() => {
    if (!user) return;
    axios
      .get("/merchant/shop/list")
      .then((response) => {
        console.log("storeList =", response.data.data);
        setInternalShopList(
          response.data.data.filter(
            (el) =>
              el.is_external === false || (!el.is_external && !el.is_wholesale)
          )
        );
        setWholesale(
          response.data.data.filter(
            (el) =>
              el.is_external === false || (!el.is_external && el.is_wholesale)
          )
        );
        setExternalShopList(
          response.data.data.filter((el) => el.is_external === true)
        );
        setLoading(false);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  }, []);

  // let wholesale, withoutWholesale;

  // if (internalShopList) {
  //   wholesale = internalShopList.filter((o) => o.is_wholesale);
  //   withoutWholesale = internalShopList.filter((o) => !o.is_wholesale);
  // }

  return (
    <MainLayout navigation={props.navigation} history={props.history}>
      <div className="store-list-root" style={{ minHeight: "100vh" }}>
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
        ) : (
          <>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <h2 style={{ margin: "0", color: " #616161" }}>
                  Internal Store
                </h2>
              </Col>
              {internalShopList.map((item, index) => {
                return (
                  <Col
                    style={{ maxWidth: "180px", minWidth: "180px" }}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    xl={4}
                    span={4}
                    key={index}
                  >
                    <StoreListItem history={props.history} item={item} />
                  </Col>
                );
              })}
            {wholesale.length > 0 && (
                 <Col span={24}>
                <h2
                  style={{ margin: "0", color: " #616161", fontSize: "18px" }}
                >
                  Wholesale Store
                </h2>
              </Col>
            )}
              {wholesale.map((item, index) => {
                return (
                  <Col
                    style={{ maxWidth: "180px", minWidth: "180px" }}
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    xl={4}
                    span={4}
                    key={index}
                  >
                    <StoreListItem history={props.history} item={item} />
                  </Col>
                );
              })}
            </Row>
            {externalShopList.length > 0 && (
              <>
                <Row gutter={[24, 24]}>
                  <Col span={24}>
                    <h2 style={{ margin: "20px 0 0 0", color: " #616161" }}>
                      External Store
                    </h2>
                  </Col>
                  {externalShopList.map((item, index) => {
                    return (
                      <Col
                        style={{ maxWidth: "180px", minWidth: "180px" }}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        xl={4}
                        span={4}
                        key={index}
                      >
                        <StoreListItem history={props.history} item={item} />
                      </Col>
                    );
                  })}
                </Row>
              </>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default StoreList;
