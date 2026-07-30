import { Cascader, Col, Form, Row, Select, Table } from "antd";
import React, { useEffect, useState } from "react";
import Search from "../../search";
import {
  filterOptions,
  initialBody,
  orderOptions,
  replacementOrdersColumns,
} from "../../fields";
import {
  getCategories,
  getElapsedTime,
  getLocations,
  getStores,
  handleGetOrders,
  replacementOrdersDataMapper,
} from "../../utils";
import Pagination from "../../Pagination";
import { useHistory } from "react-router-dom";

const List = (props) => {
  const history = useHistory();

  const [body, setBody] = useState(initialBody);
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
  const [time, setTime] = useState(Date.now());

  useEffect(() => {
    if (total === null) return;

    props.onCountChange(7, total);
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
      replacementOrdersDataMapper,
      6,
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
      replacementOrdersDataMapper,
      6,
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
      replacementOrdersDataMapper,
      6,
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
      replacementOrdersDataMapper,
      6,
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
        replacementOrdersDataMapper,
        6,
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
        replacementOrdersDataMapper,
        6,
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
        <Row gutter={[24, 12]}>
          <Col span={8}>
            <Form.Item className="w-lg" label="Select Category">
              <Select
                defaultValue={["All"]}
                onChange={(_, e) => onCascaderChange(e, "category_id")}
                options={categoryOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item className="w-sm" label="Location">
              <Select
                defaultValue={["All"]}
                onChange={(_, e) => onCascaderChange(e, "location_name")}
                options={locationOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item className="w-md" label="Search">
              <Search
                placeholder="Order id, Customer name"
                field="search_key"
                onSearch={onSearchChange}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item className="w-lg" label="Order Type">
              <Select
                onChange={(_, e) => onCascaderChange(e, "order_type")}
                defaultValue={["All"]}
                options={orderOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item className="w-sm" label="Filter">
              <Select
                onChange={(_, e) => onCascaderChange(e, "filter")}
                defaultValue={["All"]}
                options={filterOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item className="w-md" label="Shop Name">
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
        columns={replacementOrdersColumns}
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
};
export default List;
