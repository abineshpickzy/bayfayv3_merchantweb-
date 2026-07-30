import React, { useEffect, useState } from "react";
import s from "./Dashboard.module.less";
import { MainLayout } from "../../components";
import { Button, Col, DatePicker, Form, Radio, Row, Select, Modal } from "antd";
import Card from "./Card";
import { message } from "antd";
import { getDashboardInfo } from "./utils";
import { getCategories, getLocations, getStores } from "../AllOrders/utils";
import BarChart from "./BarChart";
import axios from "axios";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const date = new Date();
const initFrom =
  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
const newDate = new Date(date);

newDate.setDate(date.getDate() + 1);

const initTo =
  newDate.getFullYear() +
  "-" +
  (newDate.getMonth() + 1) +
  "-" +
  newDate.getDate();

const makePercent = (int1, int2) => {
  return ((int1 / int2) * 100).toFixed(1);
};

const options = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "week" },
  { label: "Last 30 Days", value: "month" },
];

const initBody = {
  category_id: "All",
  location_name: "All",
  store_id: undefined,
  filter_date: { to: initTo, from: initFrom },
};

function Dashboard(props) {
  const [body, setBody] = useState(initBody);

  const [dataSource, setDataSource] = useState({});
  const [loading, setLoading] = useState(true);
  const [radioValue, setRadioValue] = useState("today");
  const [chartData, setChartData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);

  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");
  const [shop, setShop] = useState(undefined);
  const [date, setDate] = useState(undefined);

  const [agencyReportLoading, setAgencyReportLoading] = useState(false);
  const [shopReportLoading, setShopReportLoading] = useState(false);

  const { confirm } = Modal;

  const downloadShopReport = () => {
    confirm({
      title: "Do you want to download shop report?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      onOk() {
        setShopReportLoading(true);
        axios
          .post("/reports/send/orders", body)
          .then((response) => {
            message.success(response.data.message);
          })
          .catch((e) => message.error(e.message))
          .finally(() => setShopReportLoading(false));
      },
    });
  };

  const downloadAgencyReport = () => {
    confirm({
      title: "Do you want to download agency report?",
      icon: <ExclamationCircleOutlined />,
      okText: "Yes",
      onOk() {
        setAgencyReportLoading(true);
        axios
          .post("/reports/send/agency", body)
          .then((response) => {
            message.success(response.data.message);
          })
          .catch((e) => message.error(e.message))
          .finally(() => setAgencyReportLoading(false));
      },
    });
  };

  const onRefreshClick = () => {
    setBody(initBody);
    setRadioValue("today");
    getDashboardInfo(initBody, setDataSource, setLoading);
    setCategory("All");
    setLocation("All");
    setShop(undefined);
    setDate(undefined);
  };

  useEffect(() => {
    if (!dataSource?.dashboard) return;
    // console.log(dataSource);

    setChartData(
      dataSource?.dashboard
        .map((item, index) => ({
          ["Total Orders"]: item.delivered,
          index,
          ["Date"]: `${new Date(item.from_date)
            .toISOString()
            .slice(0, 10)} - ${new Date(item.to_date)
            .toISOString()
            .slice(0, 10)}`,
          ["Total Payment"]: item.total_amount,
        }))
        .slice(0, 12)
    );
  }, [dataSource]);

  useEffect(() => {
    getDashboardInfo(body, setDataSource, setLoading);

    getCategories().then((categories) => {
      setCategoryOptions([
        ...[{ value: "All", label: "All" }],
        ...categories.map(({ _id, display_name }) => ({
          value: _id,
          label: display_name,
        })),
      ]);
    });

    getLocations().then((locations) => {
      setLocationOptions([
        ...[{ value: "All", label: "All" }],
        ...[...new Set(locations)].map((name) => ({
          value: name,
          label: name,
        })),
      ]);
    });

    getStores().then((stores) => {
      setStoreOptions([
        ...[{ value: "All", label: "All" }],
        ...[
          ...stores.map(({ display_name, _id }) => ({
            value: _id,
            label: display_name,
          })),
        ],
      ]);
    });
  }, []);

  const onCascaderChange = (e, field) => {
    let newBody;

    if (e) {
      newBody = {
        ...body,
        [field]: e.value,
      };
    }

    if (!e) {
      newBody = {
        ...body,
        [field]: undefined,
      };
    }

    if (e && field === "store_id" && e.value === "All") {
      newBody = {
        ...body,
        [field]: undefined,
      };
    }

    setBody(newBody);
    getDashboardInfo(newBody, setDataSource, setLoading);
  };

  const onCalendarChange = (moments, dates) => {
    setDate(moments);
    if ((dates[0] && !dates[1]) || (!dates[0] && dates[1])) return;

    let toDate = new Date();
    let fromDate = new Date();

    if (moments) {
      toDate = new Date(moments[1]);
      fromDate = new Date(moments[0]);
    }

    const to =
      toDate.getFullYear() +
      "-" +
      (toDate.getMonth() + 1) +
      "-" +
      (toDate.getDate());

    const from =
      fromDate.getFullYear() +
      "-" +
      (fromDate.getMonth() + 1) +
      "-" +
      fromDate.getDate();

    setRadioValue(null);

    const newBody = {
      ...body,
      filter_date:
        !dates[0] && !dates[1]
          ? {
              from: initFrom,
              to: initTo,
            }
          : {
              from: from,
              to: to,
            },
    };

    setBody(newBody);
    getDashboardInfo(newBody, setDataSource, setLoading);
  };

  const onRadioGroupChange = (e) => {
    const { value } = e.target;
    setRadioValue(value);
    setDate(undefined);
    const date = new Date();
    const to =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      (date.getDate());
    const newDate = new Date(date);

    if (value === "today") newDate.setDate(date.getDate());
    if (value === "week") newDate.setDate(date.getDate() - 7);
    if (value === "month") newDate.setDate(date.getDate() - 30);

    const from =
      newDate.getFullYear() +
      "-" +
      (newDate.getMonth() + 1) +
      "-" +
      newDate.getDate();
    const newBody = {
      ...body,
      filter_date: {
        from,
        to,
      },
    };

    setBody(newBody);
    getDashboardInfo(newBody, setDataSource, setLoading);
  };

  return (
    <MainLayout history={props.history}>
      <div className={s.container}>
        <div className="form">
          <Row gutter={[20, 12]}>
            <Col md={9} sm={24}>
              <Form.Item className="w-lg" label="Select Category">
                <Select
                  dropdownClassName="menu"
                  value={category}
                  options={categoryOptions}
                  allowClear={false}
                  onChange={(_, e) => {
                    setCategory(_);
                    onCascaderChange(e, "category_id");
                  }}
                />
              </Form.Item>
            </Col>
            <Col className="group" md={11} sm={24}>
              <Form.Item className="item" label="Location">
                <Select
                  onChange={(_, e) => {
                    setLocation(_);
                    onCascaderChange(e, "location_name");
                  }}
                  options={locationOptions}
                  value={location}
                  allowClear={false}
                />
              </Form.Item>
              <Form.Item className="item" label="Shop Name">
                <Select
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="Shop name"
                  onChange={(_, e) => {
                    setShop(_);
                    onCascaderChange(e, "store_id");
                  }}
                  options={storeOptions}
                  value={shop}
                />
              </Form.Item>
            </Col>
            <Col md={4} sm={24}>
              <Form.Item className="download-button-container">
                <Button
                  loading={shopReportLoading}
                  onClick={downloadShopReport}
                  className="download-button"
                  type="link"
                >
                  Download shop report
                </Button>
              </Form.Item>
            </Col>
            <Col md={9} sm={24}>
              <Form.Item
                className="w-lg"
                label={
                  <div className="refresh-icon">
                    <img
                      onClick={onRefreshClick}
                      src="/assets/sync-flat.svg"
                      alt="refresh icon"
                    />
                  </div>
                }
              >
                <Radio.Group
                  value={radioValue}
                  onChange={onRadioGroupChange}
                  style={{ display: "flex" }}
                >
                  <Radio.Button
                    className={`radio-button ${
                      radioValue === "today" ? "active" : ""
                    }`}
                    value="today"
                    buttonStyle="solid"
                  >
                    Today
                  </Radio.Button>
                  <Radio.Button
                    className={`radio-button ${
                      radioValue === "week" ? "active" : ""
                    }`}
                    value="week"
                    buttonStyle="solid"
                  >
                    Last 7 days
                  </Radio.Button>
                  <Radio.Button
                    className={`radio-button ${
                      radioValue === "month" ? "active" : ""
                    }`}
                    value="month"
                    buttonStyle="solid"
                  >
                    Last 30 days
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col md={11} sm={24}>
              <Form.Item>
                <DatePicker.RangePicker
                  value={date}
                  format="DD-MM-YYYY"
                  onCalendarChange={onCalendarChange}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col md={4} sm={24}>
              <Form.Item className="download-button-container">
                <Button
                  loading={agencyReportLoading}
                  type="link"
                  onClick={downloadAgencyReport}
                  className="download-button"
                >
                  Download agency report
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </div>

        <h3>User traction</h3>
        <div className="cards-container">
          <Card
            loading={loading}
            title="User Visited"
            amount={dataSource?.unique_visit}
          />
          <Card
            loading={loading}
            title="Users Till Cart"
            amount={dataSource?.users_till_cart}
          />
          <Card
            loading={loading}
            amount={dataSource?.impression}
            title="Impression"
          />
          <Card
            loading={loading}
            amount={dataSource?.customers}
            title="Num of Customers"
          />
        </div>

        <h3>Order Status</h3>
        <div className="cards-container">
          <Card loading={loading} style={{ opacity: 0 }} />
          <Card
            loading={loading}
            title="Delivered Orders"
            amount={dataSource?.orderStatus?.delivered}
            className="blue-percent"
            percent={
              dataSource?.cancelledInfo?.order_count +
                dataSource?.orderStatus?.delivered || 0
                ? makePercent(
                    dataSource?.orderStatus?.delivered || 0,
                    dataSource?.cancelledInfo?.order_count +
                      dataSource?.orderStatus?.delivered || 0
                  )
                : 0
            }
          />
          <Card loading={loading} style={{ opacity: 0 }} />
          <Card
            loading={loading}
            title="Orders Cancelled"
            amount={dataSource?.cancelledInfo?.order_count}
            className="red-percent"
            percent={
              dataSource?.cancelledInfo?.order_count +
                dataSource?.orderStatus?.delivered || 0
                ? makePercent(
                    dataSource?.cancelledInfo?.order_count || 0,
                    dataSource?.cancelledInfo?.order_count +
                      dataSource?.orderStatus?.delivered || 0
                  )
                : 0
            }
          />
          <Card
            loading={loading}
            title="Escalated Orders"
            amount={dataSource?.escalationInfo?.order_count}
          />
        </div>
        <div className="cards-container">
          <Card
            loading={loading}
            title="COD Amount"
            currency
            amount={dataSource?.orderStatus?.cod_payment.toFixed(2)}
            percent={
              dataSource?.orderStatus?.total_amount
                ? makePercent(
                    dataSource?.orderStatus?.cod_payment || 0,
                    dataSource?.orderStatus?.total_amount
                  )
                : 0
            }
            className="blue-percent"
          />
          <Card
            loading={loading}
            title="Online Amount"
            currency
            amount={dataSource?.orderStatus?.online_payment.toFixed(2)}
            percent={
              dataSource?.orderStatus?.total_amount
                ? makePercent(
                    dataSource?.orderStatus?.online_payment || 0,
                    dataSource?.orderStatus?.total_amount
                  )
                : 0
            }
            className="blue-percent"
          />
          <Card
            loading={loading}
            title="Total Amount"
            currency
            amount={dataSource?.orderStatus?.total_amount.toFixed(2)}
          />
          <Card
            loading={loading}
            title="Cancelled Amount"
            currency
            amount={dataSource?.cancelledInfo?.cancelled_amount.toFixed(2)}
          />
          <Card
            loading={loading}
            title="Escalated Amount"
            currency
            amount={dataSource?.escalationInfo?.escalated_amount.toFixed(2)}
          />
        </div>
        <div className="cards-container">
          <Card
            loading={loading}
            title="External Delivery Fee"
            amount={dataSource?.orderStatus?.total_delivery_fee.toFixed(2)}
            currency
          />
          <Card
            loading={loading}
            title="Packing Fee"
            amount={dataSource?.orderStatus?.packaging_fee.toFixed(2)}
            currency
          />
          <Card
            loading={loading}
            title="Total Refund"
            amount={dataSource?.refundedInfo?.refunded_amount.toFixed(2)}
            currency
          />
          <Card loading={loading} title="Product Replaced" currency />
        </div>
        <h3>Agency Status</h3>
        <div className="cards-container">
          <Card
            loading={loading}
            title="Agency Commission"
            amount={dataSource?.orderStatus?.agency_commission.toFixed(2)}
            currency
          />
          <Card
            loading={loading}
            title="Delivery Fee"
            amount={dataSource?.orderStatus?.agency_delivery_fee.toFixed(2)}
            currency
          />
          <Card
            loading={loading}
            title="Tip Amount"
            amount={dataSource?.orderStatus?.tip_amount.toFixed(2)}
            currency
          />
          <Card
            loading={loading}
            title="Total Amount"
            amount={dataSource?.orderStatus?.total_agency_amount.toFixed(2)}
            currency
          />
        </div>
        <h3>Customer Status</h3>
        <div className="cards-container">
          <Card
            loading={loading}
            title="New Customers"
            amount={dataSource?.customerStatus?.new_customers}
            percent={
              dataSource?.customerStatus?.total_customers
                ? makePercent(
                    dataSource?.customerStatus?.new_customers,
                    dataSource?.customerStatus?.total_customers
                  )
                : 0
            }
            className="blue-percent"
          />
          <Card
            loading={loading}
            title="Repeated Customers"
            amount={dataSource?.customerStatus?.repeated_users}
            percent={
              dataSource?.customerStatus?.total_customers
                ? makePercent(
                    dataSource?.customerStatus?.repeated_users,
                    dataSource?.customerStatus?.total_customers
                  )
                : 0
            }
            className="blue-percent green-amount"
          />
          <Card
            loading={loading}
            title="High Value Orders"
            amount={dataSource?.customerStatus?.high_value_orders}
            footer="Above ₹500"
            className="green-amount"
          />
          <Card
            loading={loading}
            title="Total Customers"
            amount={dataSource?.customerStatus?.total_customers}
          />
        </div>
        <div className="cards-container">
          <Card
            loading={loading}
            title="Happy Customers"
            amount={dataSource?.customerStatus?.happy_customers}
            className="blue-percent"
            percent={
              dataSource?.customerStatus?.happy_customers +
                dataSource?.customerStatus?.satisfied_customers +
                dataSource?.customerStatus?.disappointed_customers || 0
                ? makePercent(
                    dataSource?.customerStatus?.happy_customers || 0,
                    dataSource?.customerStatus?.happy_customers +
                      dataSource?.customerStatus?.satisfied_customers +
                      dataSource?.customerStatus?.disappointed_customers || 0
                  )
                : 0
            }
          />

          <Card
            loading={loading}
            title="Satisfied"
            amount={dataSource?.customerStatus?.satisfied_customers}
            className="blue-percent"
            percent={
              dataSource?.customerStatus?.happy_customers +
                dataSource?.customerStatus?.satisfied_customers +
                dataSource?.customerStatus?.disappointed_customers || 0
                ? makePercent(
                    dataSource?.customerStatus?.satisfied_customers || 0,
                    dataSource?.customerStatus?.happy_customers +
                      dataSource?.customerStatus?.satisfied_customers +
                      dataSource?.customerStatus?.disappointed_customers || 0
                  )
                : 0
            }
          />
          <Card
            loading={loading}
            title="Disappointed"
            className="red-percent"
            amount={dataSource?.customerStatus?.disappointed_customers}
            percent={
              dataSource?.customerStatus?.happy_customers +
                dataSource?.customerStatus?.satisfied_customers +
                dataSource?.customerStatus?.disappointed_customers || 0
                ? makePercent(
                    dataSource?.customerStatus?.disappointed_customers || 0,
                    dataSource?.customerStatus?.happy_customers +
                      dataSource?.customerStatus?.satisfied_customers +
                      dataSource?.customerStatus?.disappointed_customers || 0
                  )
                : 0
            }
          />
        </div>

        <h3>Orders</h3>
        <div className="bar-chart">
          <BarChart data={chartData} />
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;
