import React, { useEffect, useState } from "react";
import "./ProductInfo.less";
import { Card, Spin, Row, Col, message, Button, Rate } from "antd";
import axios from "axios";
import Image from "../Image";
import Barcode from "react-barcode";

function ProductInfoPage(props) {
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState(null);

  const { item, status, storeId, categoryId, productItem } = props;

  let type = productItem.upc ? "upc" : "sku";

  const getProductDetail = () => {
    setLoading(true);
    axios
      .get(
        "/inventory/" +
          categoryId +
          "/" +
          storeId +
          "/" +
          productItem.id +
          "/" +
          type +
          "/vw"
      )
      .then((response) => {
        console.log("product Details", response.data.data);
        setProductDetails(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  };

  useEffect(() => {
    getProductDetail();
  }, []);

  return (
    <div id="ProductInfo">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          {status}&ensp;/ &ensp;
        </span>

        {status !== "Live" && (
          <span
            style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
            onClick={props.goBack}
          >
            {item.order_id}&ensp;/&ensp;
          </span>
        )}
        <span>{productItem.product_name}</span>
      </p>

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
          <Card className="product-image-card">
            <div style={{ display: "flex" }}>
              {productDetails.product?.images &&
                productDetails.product?.images.map((o) => {
                  return (
                    <Image
                      url={`${process.env.REACT_APP_BASE_URL}/order/product/image?file=${o.name}&width=1000&height=1000`}
                      style={{ height: 150, width: 150, margin: "10px" }}
                    />
                  );
                })}
            </div>
          </Card>
          <Card className="product-details-card">
            <div style={{ fontSize: "15px" }}>
              <Row gutter={16}>
                <Col span={5} className="details" style={{ color: "#616161" }}>
                  Product Name:
                </Col>
                <Col style={{ fontWeight: "bold", width: "50%" }}>
                  {productDetails.product.product_name}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={5} className="details" style={{ color: "#616161" }}>
                  Market Price:
                </Col>
                <Col style={{ width: "50%" }}>
                  {productDetails.product.selling_price
                    ? productDetails.product.selling_price
                    : 0}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={5} className="details" style={{ color: "#616161" }}>
                  Total Sold:
                </Col>
                <Col style={{ width: "50%" }}>
                  {productDetails.product.stock
                    ? productDetails.product.stock
                    : 0}
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={5} className="details" style={{ color: "#616161" }}>
                  {productDetails.column[0].display_name}:
                </Col>
                <Col style={{ width: "50%" }}>
                  {productDetails.product.sku
                    ? productDetails.product.sku
                    : productDetails.product.upc}{" "}
                </Col>
              </Row>
              {productDetails.product.manufacturer && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    Manufacturer:
                  </Col>
                  <Col style={{ width: "50%" }}>
                    {productDetails.product.manufacturer}
                  </Col>
                </Row>
              )}
              {productDetails.product.category && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    Category:
                  </Col>
                  <Col style={{ width: "50%" }}>
                    {productDetails.product.category}
                  </Col>
                </Row>
              )}
              {productDetails.product.mrp && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    MRP:
                  </Col>
                  <Col style={{ width: "50%" }}>
                    {productDetails.product.mrp}
                  </Col>
                </Row>
              )}
              {productDetails.product.height && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    Height:
                  </Col>
                  <Col style={{ width: "50%" }}>
                    {productDetails.product.height}
                  </Col>
                </Row>
              )}
              {productDetails.product.width && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    Width:
                  </Col>
                  <Col style={{ width: "50%" }}>
                    {productDetails.product.width}
                  </Col>
                </Row>
              )}
              {productDetails.product.description && (
                <Row gutter={16}>
                  <Col
                    span={5}
                    className="details"
                    style={{ color: "#616161" }}
                  >
                    Discription:
                  </Col>
                  <Col style={{ width: "75%" }}>
                    {productDetails.product.description}
                  </Col>
                </Row>
              )}
            </div>
            <div
              style={{
                position: "absolute",
                right: "40px",
                top: "30px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {productDetails.product.rating && (
                <>
                  <Rate disabled allowHalf defaultValue={2.5} />
                  <p>Rating :{productDetails.product.rating}</p>
                </>
              )}
              <Barcode
                value={
                  productDetails.product.upc
                    ? productDetails.product.upc
                    : productDetails.product.sku
                }
                height={40}
                width={1.5}
                format="CODE128"
              />
              <Button style={{ marginTop: "15px" }}> Print Barcode </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default ProductInfoPage;
