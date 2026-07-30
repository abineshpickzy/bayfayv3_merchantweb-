import React, { useEffect, useState } from "react";
import {
  getCategories,
  getLocations,
  handleGetOrders,
  newOrdersDataMapper,
  pdsOrdersDataMapper,
} from "../utils";
import { Cascader, Col, Form, Input, Row, Table } from "antd";
import {
  filterOptions,
  initialBody,
  orderOptions,
  pdsOrdersColumns,
} from "../fields";
import Search from "../search";

function Dispatched() {
  const [body, setBody] = useState(initialBody);

  const [search, setSearch] = useState({ search_key: "", store_id: "" });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const onCascaderChange = (e, field) => {
    const newBody = { ...body, [field]: e[0] };
    setBody(newBody);
    handleGetOrders(newBody, setDataSource, setLoading, pdsOrdersDataMapper, 3);
  };

  const onSearchChange = (value, field) => {
    if (search[field] === value) return;
    setSearch({ ...search, [field]: value });
    if (!value) value = undefined;

    const newBody = { ...body, [field]: value };
    setBody(newBody);
    handleGetOrders(newBody, setDataSource, setLoading, pdsOrdersDataMapper, 3);
  };

  useEffect(() => {
    handleGetOrders(body, setDataSource, setLoading, pdsOrdersDataMapper, 3);

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
        className="table"
        dataSource={dataSource}
        loading={loading}
        columns={pdsOrdersColumns}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </div>
  );
}

export default Dispatched;
