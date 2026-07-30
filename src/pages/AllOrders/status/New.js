import React, { useEffect, useState } from "react";
import { Cascader, Col, Form, Row, Table } from "antd";
import {
  newOrdersDataMapper,
  getCategories,
  getLocations,
  handleGetOrders,
  getOrdersFn,
} from "../utils";
import {
  filterOptions,
  orderOptions,
  newOrdersColumns,
  initialBody,
} from "../fields";
import Search from "../search";

function New({ onOrderChange }) {
  const [body, setBody] = useState(initialBody);

  const [search, setSearch] = useState({ search_key: "", store_id: "" });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [response, setResponse] = useState(null);

  const onCascaderChange = (e, field) => {
    const newBody = { ...body, [field]: e[0] };
    setBody(newBody);
    handleGetOrders(newBody, setDataSource, setLoading, newOrdersDataMapper, 1);
  };

  const onSearchChange = (value, field) => {
    if (search[field] === value) return;
    setSearch({ ...search, [field]: value });
    if (!value) value = undefined;

    const newBody = { ...body, [field]: value };
    setBody(newBody);
    handleGetOrders(newBody, setDataSource, setLoading, newOrdersDataMapper, 1);
  };

  useEffect(() => {
    const getOrders = getOrdersFn(1);
    getOrders(initialBody).then((response) => {
      console.log(response.data.data);
      setResponse(response.data.data);
    });

    handleGetOrders(body, setDataSource, setLoading, newOrdersDataMapper, 1);

    getCategories().then((categories) => {
      setCategoryOptions(
        categories.map(({ _id, display_name }) => ({
          value: _id,
          label: display_name,
        }))
      );
    });

    getLocations().then((locations) => {
      setLocationOptions(
        [...new Set(locations)].map((name) => ({
          value: name,
          label: name,
        }))
      );
    });
  }, []);

  return (
    <div>
      <Form className="form">
        <Row gutter={[24, 12]}>
          <Col span={8}>
            <Form.Item label="Select Category">
              <Cascader
                onChange={(e) => onCascaderChange(e, "category_id")}
                options={categoryOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Location">
              <Cascader
                onChange={(e) => onCascaderChange(e, "location_name")}
                options={locationOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Search">
              <Search field="search_key" onSearch={onSearchChange} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Order Type">
              <Cascader
                onChange={(e) => onCascaderChange(e, "order_type")}
                allowClear={false}
                defaultValue={["All"]}
                options={orderOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Filter">
              <Cascader
                onChange={(e) => onCascaderChange(e, "filter")}
                allowClear={false}
                defaultValue={["All"]}
                options={filterOptions}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Shop Name">
              <Search field="store_id" onSearch={onSearchChange} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        onRow={(record) => {
          return {
            onClick: () =>
              onOrderChange({
                type: "new",
                value: response.find(
                  ({ order_id }) => order_id === record.order_id
                ),
              }),
          };
        }}
        className="table"
        dataSource={dataSource}
        loading={loading}
        columns={newOrdersColumns}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </div>
  );
}

export default New;
