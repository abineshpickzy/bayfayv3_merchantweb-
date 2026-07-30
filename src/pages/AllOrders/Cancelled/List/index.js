import React, { useEffect, useState } from "react";
import {
  Cascader,
  Col,
  DatePicker,
  Form,
  Radio,
  Row,
  Select,
  Table,
} from "antd";
import {
  getCategories,
  getLocations,
  cancelledOrdersDataMapper,
  handleGetOrders,
  getStores,
  getElapsedTime,
} from "../../utils";
import {
  filterOptions,
  orderOptions,
  cancelledOrdersColumns,
} from "../../fields";
import Search from "../../search";
import Pagination from "../../Pagination";
import { useHistory } from "react-router-dom";

const date = new Date();
const from =
  date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
const newDate = new Date(date);

newDate.setDate(date.getDate() + 1);

const to =
  newDate.getFullYear() +
  "-" +
  (newDate.getMonth() + 1) +
  "-" +
  newDate.getDate();

function List(props) {
  const history = useHistory();

  const [body, setBody] = useState({
    category_id: "All",
    location_name: "All",
    store_id: undefined,
    search_key: undefined,
    order_type: "All",
    filter: "All",
    filter_date: { to, from },
  });
  const [response, setResponse] = useState(null);
  const [search, setSearch] = useState({ search_key: "", store_id: "" });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);
  const [total, setTotal] = useState(null);
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(history.location.search);
    const queryPage = params.get("page");

    if (queryPage) return Number(queryPage);

    return 1;
  });
  const [radioValue, setRadioValue] = useState("today");
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    if (total === null) return;
    props.onCountChange(6, total);
  }, [total]);

  useEffect(() => {
    if (!dataSource.length) return;

    const interval = setInterval(() => {
      setTime(Date.now());
      setDataSource((prevState) => {
        return prevState.map((data) => ({
          ...data,
          elapsed_time: getElapsedTime(time, new Date(data.orderedTime)),
        }));
      });
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [dataSource]);

  const handlePageChange = (value) => {
    handleGetOrders(
      body,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse,
      value,
      numEachPage
    );
    setCurrentPage(value);
    setMinValue(value * numEachPage - numEachPage);
    setMaxValue(value * numEachPage);
    history.push({
      search: `?page=${value}`,
    });
  };

  const handlePageCountChange = (value) => {
    handleGetOrders(
      body,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse,
      1,
      value
    );
    setCurrentPage(1);
    setNumEachPage(value);
    if (maxValue - minValue !== value) {
      setMaxValue(minValue + value);
    }
  };

  function filter(inputValue, path) {
    return path.some(
      (option) =>
        option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
    );
  }

  const onCascaderChange = (e, field) => {
    let newBody;

    if (!e) {
      newBody = {
        ...body,
        [field]: undefined,
      };
    } else {
      newBody = {
        ...body,
        [field]: e.value === "all" ? undefined : e.value,
      };
    }

    setBody(newBody);
    handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse
    );
  };

  const onSearchChange = (value, field) => {
    if (search[field] === value) return;
    setSearch({ ...search, [field]: value });
    if (!value) value = undefined;

    const newBody = { ...body, [field]: value };
    setBody(newBody);
    handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse
    );
  };

  const onCalendarChange = (moments, dates) => {
    if ((dates[0] && !dates[1]) || (!dates[0] && dates[1])) return;

    const toDate = new Date(moments[1]);
    const fromDate = new Date(moments[0]);

    const to =
      toDate.getFullYear() +
      "-" +
      (toDate.getMonth() + 1) +
      "-" +
      (toDate.getDate() + 1);

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
          ? undefined
          : {
              from: from,
              to: to,
            },
    };

    setBody(newBody);
    return handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse
    );
  };

  const onRadioGroupChange = (e) => {
    const { value } = e.target;
    setRadioValue(value);
    const date = new Date();
    const to =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      (date.getDate() + 1);
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
    return handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      cancelledOrdersDataMapper,
      7,
      setTotal,
      setResponse
    );
  };

  useEffect(() => {
    if (currentPage !== 1) {
      handleGetOrders(
        body,
        setDataSource,
        setLoading,
        cancelledOrdersDataMapper,
        7,
        setTotal,
        setResponse,
        currentPage,
        numEachPage
      );
    } else {
      handleGetOrders(
        body,
        setDataSource,
        setLoading,
        cancelledOrdersDataMapper,
        7,
        setTotal,
        setResponse
      );
    }

    getCategories().then((categories) => {
      setCategoryOptions([
        ...[{ value: "all", label: "All" }],
        ...categories.map(({ _id, display_name }) => ({
          value: _id,
          label: display_name,
        })),
      ]);
    });

    getLocations().then((locations) => {
      setLocationOptions([
        ...[{ value: "all", label: "All" }],
        ...[...new Set(locations)].map((name) => ({
          value: name,
          label: name,
        })),
      ]);
    });

    getStores().then((stores) => {
      setStoreOptions([
        ...[{ value: "all", label: "All" }],
        ...[
          ...stores.map(({ display_name, _id }) => ({
            value: _id,
            label: display_name,
          })),
        ],
      ]);
    });
  }, []);

  return (
    <div>
      <Form className="form">
        <Row gutter={[20, 12]}>
          <Col lg={6} md={8} sm={12}>
            <Form.Item className="w-lg" label="Select Category">
              <Select
                dropdownClassName="menu"
                defaultValue={["All"]}
                onChange={(_, e) => onCascaderChange(e, "category_id")}
                options={categoryOptions}
                allowClear={false}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Location">
              <Select
                defaultValue={["All"]}
                onChange={(_, e) => onCascaderChange(e, "location_name")}
                options={locationOptions}
                allowClear={false}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Shop Name">
              <Select
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                placeholder="Shop name"
                onChange={(_, e) => onCascaderChange(e, "store_id")}
                options={storeOptions}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item className="w-md" label="Order Type">
              <Select
                dropdownClassName="menu"
                onChange={(_, e) => onCascaderChange(e, "order_type")}
                allowClear={false}
                defaultValue={["All"]}
                options={orderOptions}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item className="w-lg" label="Search">
              <Search
                placeholder="Order id, Customer name"
                field="search_key"
                onSearch={onSearchChange}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item>
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
          <Col lg={6} md={8} sm={12}>
            <Form.Item>
              <DatePicker.RangePicker
                format="DD-MM-YYYY"
                onCalendarChange={onCalendarChange}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item className="w-md" label="Filter">
              <Select
                dropdownClassName="menu"
                onChange={(_, e) => onCascaderChange(e, "filter")}
                allowClear={false}
                defaultValue={["All"]}
                options={filterOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        onRow={(record) => {
          return {
            onClick: () => {
              props.history.push({
                search: `?page=${currentPage}&id=${record.order_id}`,
              });

              const currentOrder = response.find(
                ({ order_id }) => order_id === record.order_id
              );
              props.clickViewOrder(
                currentOrder,
                categoryOptions.find(({ label }) => label === record.category)
                  .value,
                storeOptions.find(
                  ({ label }) => label === currentOrder.store.display_name
                ).value
              );
            },
          };
        }}
        className="table"
        dataSource={dataSource}
        loading={loading}
        columns={cancelledOrdersColumns}
        pagination={false}
      />
      {!loading && (
        <Pagination
          minValue={minValue}
          handlePageChange={handlePageChange}
          handlePageCountChange={handlePageCountChange}
          maxValue={maxValue}
          numEachPage={numEachPage}
          total={total}
          currentPage={currentPage}
        />
      )}
    </div>
  );
}

export default List;
