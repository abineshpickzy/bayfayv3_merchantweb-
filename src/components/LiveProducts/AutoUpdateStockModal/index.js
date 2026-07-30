import React, { useEffect, useState } from "react";
import "./AutoUpdateStockModal.less";
import {
  InputNumber,
  Modal,
  Form,
  Button,
  Checkbox,
  Row,
  Col,
  message,
} from "antd";
import axios from "axios";

function AutoUpdateStock(props) {
  const [lowStock, setLowStock] = useState(5);
  const [stockCount, setStockCount] = useState(10);
  const [checked, setChecked] = useState(true);
  const [productId, setProductId] = useState();

  const { storeId, categoryId, checkedProduct } = props;

  let Ids;
  useEffect(() => {
    if (!props.AutoUpdateModal) return; // Only run when modal is open
    
    if (typeof checkedProduct[0] === "object") {
      Ids = checkedProduct.map((o) => {
        return o.products.id;
      });
      setProductId(Ids);
    } else {
      Ids = checkedProduct;
      setProductId(Ids);
    }

    axios
      .post("/shop/view/basic", {
        category_id: categoryId,
        shop_id: storeId,
      })
      .then((res) => {
        console.log("inventory Auto update detail: ", res.data.data);
        const invConfig = res.data.data.inventory_config;
        if (invConfig) {
          setLowStock(invConfig.low_stock_limit ?? 5);
          setStockCount(invConfig.auto_update_count ?? 10);
        }
        // (res.data.data);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Something went wrong."
        );
      });
  }, [props.AutoUpdateModal, checkedProduct]);

  const onUpdate = () => {
    axios
      .post("/inv/autoStock", {
        category_id: categoryId,
        store_id: storeId,
        is_auto_stock_update: checked,
        low_stock_limit: parseInt(lowStock),
        auto_update_count: parseInt(stockCount),
        products_id: productId,
      })
      .then((response) => {
        console.log("Auto stock update", response);
        // props.onupdateStock();
        setLowStock(5);
        setStockCount(10);
        setChecked(true);
        props.onClose();
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  return (
    <Modal
      className="auto-update-stock"
      title="Auto Stock Update"
      style={{ top: 20 }}
      visible={props.AutoUpdateModal}
      onCancel={() => {
        setLowStock(5);
        setStockCount(10);
        setChecked(true);
        props.onClose();
      }}
      footer={[
        <Button
          key="1"
          type="primary"
          onClick={() => {
            onUpdate();
          }}
        >
          Update
        </Button>,
      ]}
    >
      <div className="main-content">
        <Row gutter={[16, 16]}>
          <Col span={12} className="input-label">
            <label>Low Stock Limit: </label>
          </Col>
          <Col span={12}>
            <InputNumber
              style={{ backgroundColor: "#f5f5f5" }}
              value={lowStock}
              onChange={(e) => setLowStock(e)}
            />
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12} className="input-label">
            <label>Auto Update Count: </label>
          </Col>
          <Col span={12}>
            <InputNumber
              style={{ backgroundColor: "#f5f5f5" }}
              value={stockCount}
              onChange={(e) => setStockCount(e)}
            />
          </Col>
        </Row>
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        >
          Auto Stock Update
        </Checkbox>
      </div>
    </Modal>
  );
}

export default AutoUpdateStock;
