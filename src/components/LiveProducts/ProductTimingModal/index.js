import React, { useEffect, useState } from "react";
import "./ProductTimingModal.less";
import {
  InputNumber,
  Modal,
  Form,
  Button,
  Checkbox,
  Row,
  Col,
  message,
  TimePicker,
} from "antd";
import axios from "axios";
import moment from "moment";
import { MinusCircleFilled } from "@ant-design/icons";

function ProductTimingModal(props) {
  const [checked, setChecked] = useState(true);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [saleTime, setSaleTime] = useState([]);
  const [productId, setProductId] = useState();

  const { storeId, categoryId, checkedProduct } = props;

  let Ids;
  useEffect(() => {
    if (typeof checkedProduct[0] === "object") {
      Ids = checkedProduct.map((o) => {
        return o.products.id;
      });
      setProductId(Ids);
      setSaleTime(checkedProduct[0].products.stock_timing);
    } else {
      Ids = checkedProduct;
      setProductId(Ids);
    }
  }, [checkedProduct]);

  const AddTimeInArray = () => {
    if (startTime !== null && endTime !== null) {
      var startT = new Date(startTime).toISOString();
      var endT = new Date(endTime).toISOString();
      let _startTime = moment(startT).format('yyyy-MM-DD H:mm:00.000')
      let _endTime = moment(endT).format('yyyy-MM-DD H:mm:00.000')

      setSaleTime([
        ...saleTime,
        {
          start_time: _startTime,
          end_time: _endTime,
        },
      ]);
      setStartTime(null);
      setEndTime(null);
    } else {
      alert("start time and end time is not null");
    }
  };

  const onSave = () => {
    axios
      .post("/inv/time/update", {
        category_id: categoryId,
        store_id: storeId,
        products_id: productId,
        is_auto_stock_update: checked,
        stock_timing: saleTime.map((o) => {
          return {
            start_time: o.start_time,
            end_time: o.end_time,
          };
        }),
      })
      .then((response) => {
        console.log("product timing save", response);
        // props.onupdateStock();
        setSaleTime([]);
        setChecked(true);
        setStartTime(null);
        setEndTime(null);
        props.onClose();
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  return (
    <Modal
      className="product-timing-modal"
      title="Set Sale Time"
      style={{ top: 20 }}
      visible={props.TimingModal}
      onCancel={() => {
        setSaleTime([]);
        setChecked(true);
        setStartTime(null);
        setEndTime(null);
        props.onClose();
      }}
      footer={[
        <Button
          key="1"
          type="primary"
          onClick={() => {
            onSave();
          }}
        >
          Save
        </Button>,
      ]}
    >
      <div className="main-content">
        <TimePicker
          use12Hours
          placeholder="Select Start Time"
          format="h:mm a"
          value={startTime !== null ? moment(startTime) : null}
          onChange={(e) => setStartTime(e._d)}
          style={{ width: "100%" }}
        />
        <TimePicker
          use12Hours
          placeholder="Select End Time"
          format="h:mm a"
          value={endTime !== null ? moment(endTime) : null}
          onChange={(e) => setEndTime(e._d)}
          style={{ width: "100%", margin: "10px 0" }}
        />
        <div className="action-div">
          <Checkbox
            onChange={() => {
              setChecked((prev) => !prev);
            }}
            checked={checked}
          >
            Auto Stock Update
          </Checkbox>
          <Button type="primary" onClick={AddTimeInArray}>
            Add
          </Button>
        </div>
        {saleTime &&
          saleTime.length > 0 &&
          saleTime.map((item, index) => {
            let startAt = new Date(item.start_time).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            let endAt = new Date(item.end_time).toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
            return (
              <div className="date-timer" key={index}>
                Start at:&ensp; <span className="start-time">{startAt}</span>
                &ensp; End at:&ensp;
                <span className="end-time">{endAt}</span>&ensp;&ensp;
                <MinusCircleFilled
                  style={{ color: "#ff2d2d", fontSize: "20px" }}
                  onClick={() => {
                    let arr = [...saleTime];
                    arr.splice(index, 1);
                    setSaleTime(arr);
                  }}
                />
              </div>
            );
          })}
      </div>
    </Modal>
  );
}

export default ProductTimingModal;
