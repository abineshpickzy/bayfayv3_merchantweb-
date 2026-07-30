import React, { useEffect, useState } from "react";
import { Cascader, Col, DatePicker, Form, Radio, Row, Table } from "antd";
import {
  getCategories,
  getLocations,
  replacementOrdersDataMapper,
  handleGetOrders,
} from "../utils";
import {
  filterOptions,
  orderOptions,
  initialBody,
  replacementOrdersColumns,
} from "../fields";
import Search from "../search";

function Replacement() {
  const [body, setBody] = useState(initialBody);

  const [search, setSearch] = useState({ search_key: "", store_id: "" });
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const onCascaderChange = (e, field) => {
    const newBody = { ...body, [field]: e[0] };
    setBody(newBody);
    handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      replacementOrdersDataMapper,
      7
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
      7
    );
  };

  const onCalendarChange = (_, dates) => {
    if ((dates[0] && !dates[1]) || (!dates[0] && dates[1])) return;

    const newBody = {
      ...body,
      filter_date:
        !dates[0] && !dates[1]
          ? undefined
          : {
              from: dates[0],
              to: dates[1],
            },
    };

    setBody(newBody);
    return handleGetOrders(
      newBody,
      setDataSource,
      setLoading,
      replacementOrdersDataMapper,
      7
    );
  };

  const onRadioGroupChange = (e) => {
    const { value } = e.target;

    const date = new Date();
    const to =
      date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    const newDate = new Date(date);

    if (value === "today") newDate.setDate(date.getDate() - 1);
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
      replacementOrdersDataMapper,
      7
    );
  };

  useEffect(() => {
    handleGetOrders(
      body,
      setDataSource,
      setLoading,
      replacementOrdersDataMapper,
      7
    );

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
        <Row gutter={[20, 12]}>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Select Category">
              <Cascader
                onChange={(e) => onCascaderChange(e, "category_id")}
                options={categoryOptions}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Location">
              <Cascader
                options={locationOptions}
                onChange={(e) => onCascaderChange(e, "location_name")}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Shop Name">
              <Search field="store_id" onSearch={onSearchChange} />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Order Type">
              <Cascader
                onChange={(e) => onCascaderChange(e, "order_type")}
                allowClear={false}
                defaultValue={["All"]}
                options={orderOptions}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Search">
              <Search field="search_key" onSearch={onSearchChange} />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item>
              <Radio.Group
                onChange={onRadioGroupChange}
                style={{ display: "flex" }}
              >
                <Radio.Button
                  style={{ flex: 1, overflow: "hidden" }}
                  value="today"
                >
                  Today
                </Radio.Button>
                <Radio.Button
                  style={{ flex: 1, overflow: "hidden" }}
                  value="week"
                >
                  Last 7 days
                </Radio.Button>
                <Radio.Button
                  style={{ flex: 1, overflow: "hidden" }}
                  value="month"
                >
                  Last 30 days
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item>
              <DatePicker.RangePicker
                onCalendarChange={onCalendarChange}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col lg={6} md={8} sm={12}>
            <Form.Item label="Filter">
              <Cascader
                onChange={(e) => onCascaderChange(e, "filter")}
                allowClear={false}
                defaultValue={["All"]}
                options={filterOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Table
        className="table"
        dataSource={dataSource}
        loading={loading}
        columns={replacementOrdersColumns}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </div>
  );
}

export default Replacement;
