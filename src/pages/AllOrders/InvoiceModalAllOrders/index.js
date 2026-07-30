import React from "react";
import "./InvoiceModal.less";
import { Modal, Button, Row, Col, message, Spin } from "antd";
import ReactToPrint from "react-to-print";
import axios from "axios";

class ComponentToPrint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { item, productList, GSTIN } = this.props;
    const date = new Date(item.ordered.at);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let dt = date.getDate();

    let result = productList.reduce((a, v) => (a = a + v.net_price * v.qty), 0);

    var delivery_charges = function () {
      var total = 0;
      if (productList.length > 0 && productList[0]?.delivery) {
        total = productList[0]?.delivery;
      }
      return total;
    };

    var taxs_charges = function () {
      var total = 0;
      if (productList.length > 0 && productList[0]?.tax_price) {
        for (var i = 0; i < productList.length; i++) {
          total = total + productList[i]?.tax_price;
        }
      } else if (productList.length > 0 && productList[0]?.taxes) {
        total = productList[0]?.taxes;
      }
      return total;
    };

    var discountAmt = function () {
      var total = 0;
      if (productList.length > 0 && productList[0]?.product_offer_amount) {
        total = productList[0]?.product_offer_amount;
      }
      return total;
    };

    const total_bill = (result + delivery_charges() + taxs_charges()).toFixed(
      2
    );
    // let Amount_bill = total_bill - discountAmt();

    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          className="invoice-main-div"
          style={{
            width: "100%",
            padding: "10px",
            border: "solid 1px #e1e1e1",
          }}
        >
          <div style={{ display: "flex" }}>
            <img
              src="/assets/logo.png"
              style={{ height: "50px" }}
              className="shop-logo"
            />
            <div
              className="text-center"
              style={{
                margin: "auto",
                justifyContent: "center",
              }}
            >
              <h3
                className="m-0 invoice-header"
                style={{
                  fontWeight: "normal",
                  lineHeight: "40px",
                }}
              >
                {item?.store?.display_name.substring(0, 30)}
              </h3>
              <p
                className="m-0 shop-address"
                style={{ color: "#000000", maxWidth: "300px" }}
              >
                {item.store && item?.store?.address.street}
              </p>
              <p
                className="shop-gstin"
                style={{
                  color: "#757575",
                  fontSize: "normal",
                }}
              >
                GSTIN: {GSTIN ? GSTIN : "Not Yet Updated"}
              </p>
            </div>
          </div>
          <div
            className="customer-info"
            style={{
              display: "flex",
              justifyContent: "space-between",
              lineHeight: "10px",
              fontWeight: "small",
            }}
          >
            <div>
              <p className="line-0">Name : {item.customer.name}</p>
              <p className="line-0">ORD-No: #{item.order_id}</p>
              <p className="line-0">
                Delivery:{" "}
                {item.delivery_type == 1 || 2 ? "By Shop" : "Self Pickup"}
              </p>
            </div>
            <div>
              <p className="line-0">Date: {dt + "/" + month + "/" + year}</p>
              <p className="line-0">payment: {item.payment_mode}</p>
            </div>
          </div>
          <div>
            <Row
              className="mp-top mp-bottom line-0"
              style={{
                fontWeight: "normal",
                color: "#000000",
                borderBottom: "dashed 2px #000000",
                borderTop: "dashed 2px #000000",
                padding: "10px 0",
                margin: 0,
                marginBottom: "10px",
              }}
              gutter={20}
            >
              <Col className="customer-info" span={2}>
                #
              </Col>
              <Col className="customer-info" span={14}>
                Item Name
              </Col>
              <Col className="customer-info" span={5}>
                QTY
              </Col>
              {/*<Col span={6}>Price(₹)</Col> */}
            </Row>

            {productList.map((o, index) => {
              return (
                <Row
                  className="m-0 line-0"
                  style={{
                    fontWeight: "normal",
                    fontSize: "small",
                    color: "#000000",
                    margin: 0,
                  }}
                  gutter={20}
                >
                  <Col className="customer-info" span={2}>
                    {index + 1}
                  </Col>
                  <Col className="customer-info" span={14}>
                    {o.product_name.substring(0, 30) + ".. - " + o.unit}
                  </Col>
                  <Col className="customer-info" span={5}>
                    x{o?.escalated_qty ? o.escalated_qty : o.qty}
                  </Col>
                  {}
                </Row>
              );
            })}
            {}

            <Row
              className="shop-feedback-title mp-top"
              style={{
                justifyContent: "center",
                fontWeight: "normal",
                fontSize: "small",
                color: "#000000",
                lineHeight: "20px",
                borderTop: "dashed 2px #000000",
                paddingTop: "10px",
                margin: 0,
                marginTop: "10px",
              }}
            >
              Verify your products in the app and give feedback to the store.
            </Row>
            <Row style={{ justifyContent: "center" }}>
              <p
                className="m-0 shop-feedback-title "
                style={{
                  fontWeight: "normal",
                  fontSize: "small",
                  color: "#000000",
                  lineHeight: "20px",
                }}
              >
                Powered By BayFay
              </p>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}

class InvoiceModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isInvoice: false,
      GSTIN: "",
      storeDetail: {},
      downloadIn: "",
      loading: false,
    };
  }

  componentDidMount() {
    // let storeDetail = JSON.parse(localStorage.getItem("storeName"));
    //
    // if (!storeDetail) return;

    axios
      .post("/order/lic/info", {
        store_id: this.props.storeId,
      })
      .then((response) => {
        console.log("gstin", response.data.data);
        this.setState({
          GSTIN: response.data.data.gstin,
        });
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something Went wrong!"
        );
      });
  }

  isInvoiceClose = () => {
    this.props.isInvoiceClose();
    this.setState({
      isInvoice: false,
    });
  };

  sendInvoiceSeller = () => {
    this.setState({
      loading: true,
    });
    axios
      .post("/order/invoice/sent", {
        order_id: this.props.item._id,
        flag: 2,
      })
      .then((response) => {
        console.log("response send invoice", response);
        message.success(response?.data?.data);
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
        });
        message.error(
          error?.response?.data?.message || "Something Went wrong!"
        );
      });
  };

  downloadInvoice = () => {
    this.setState({
      loading: true,
    });
    axios
      .post("/order/invoice/sent", {
        order_id: this.props.item._id,
        flag: 1,
      })
      .then((response) => {
        console.log("response download invoice", response);
        this.setState({
          downloadIn: response.data.data,
          loading: false,
        });

        this.props.history.push({
          pathname: "/print-invoice",
          state: { invoice: response.data.data },
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
        });
        message.error(
          error?.response?.data?.message || "Something Went wrong!"
        );
      });
  };

  render() {
    const { item, productList } = this.props;
    const { downloadIn, loading } = this.state;
    return (
      <Modal
        className="invoice"
        centered
        visible={this.props.isInvoiceOpen}
        closable={false}
        onCancel={this.isInvoiceClose}
        footer={false}
      >
        {loading ? (
          <div
            style={{
              width: "300px",
              height: "350px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <div className="button-container">
            <Button size="large" onClick={() => this.downloadInvoice()}>
              Download Invoice
            </Button>
            <Button size="large" onClick={() => this.sendInvoiceSeller()}>
              Send To Seller/Customer
            </Button>
            <ReactToPrint
              key="print invoice"
              trigger={() => <Button size="large">Print Bill</Button>}
              content={() => this.componentRef}
              pageStyle="@page {
              size: auto;
            }

            @media all {

                .invoice-header {
                  font-size:60%;
                  color:#212121 !important ;
                  text-align: center !important;
                  line-height:initial !important ;
                }

                .text-center {
                  text-align: center !important;
                }

                .shop-address{
                  font-size:60%;
                  color:#212121 !important ;
                  text-align: center !important;
                  line-height:initial !important ;
                }

                .customer-info{
                  font-size:60%;
                  line-height:initial !important ;
                }

                .shop-gstin{
                  font-size:50% !important;
                  color:#212121 !important ;
                  text-align: center !important;
                  line-height:initial !important ;
                }

                .shop-feedback-title{
                  font-size:50% !important;
                  color:#212121 !important ;
                  text-align: center !important;
                  line-height:initial !important ;
                }

                .mp-top{
                  margin-top:3px !important;
                  padding-top:3px !important;
                  border-top: dashed 1px #a7a7a7 !important;
                }

                .mp-bottom{
                  margin-bottom:3px !important;
                  padding-bottom:3px !important;
                  border-bottom: dashed 1px #a7a7a7 !important;
                }

                .m-0{
                  margin:0 !important;
                  padding :1px 0 !important;
                  line-height:initial !important ;
                }

                .line-0 {
                  font-size:100% !important;
                  color:#000000 !important ;
                  line-height:initial !important ;
                }

                .line-1 {
                  font-size:100% !important;
                  color:#000000 !important ;
                  text-align: center !important;
                  line-height:initial !important;
                }

                .invoice-main-div{
                  margin:0px !important;
                }

                .shop-logo{
                  height:15px !important;
                  margin-right:auto;
                }

                .page-break {
                  display: none;
                }
            }

            @media print {
                html, body {
                  height: initial !important;
                  overflow: initial !important;
                  -webkit-print-color-adjust: exact;
                }
            }

            @media print {
                .page-break {
                  margin-top: 1rem;
                  display: block;
                  page-break-before: auto;
                }
            }
            "
            />
            <Button
              size="large"
              type="primary"
              danger
              onClick={this.isInvoiceClose}
            >
              Cancel
            </Button>
            <div style={{ display: "none" }}>
              <ComponentToPrint
                item={item}
                productList={productList}
                ref={(el) => (this.componentRef = el)}
                GSTIN={this.state.GSTIN}
              />
            </div>
          </div>
        )}
      </Modal>
    );
  }
}

export default InvoiceModal;
