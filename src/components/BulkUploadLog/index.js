import React, { useEffect, useRef, useState } from "react";
import "./BulkUploadLog.less";
import axios from "axios";
import { DownloadOutlined } from "@ant-design/icons";
import { message, Row, Col, Spin } from "antd";
import { CSVLink } from "react-csv";
import PagePagination from "../Pagination";

function BulkUploadLog(props) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [numEachPage, setNumEachPage] = useState(25);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(numEachPage);

  const { categoryId, storeId, status } = props;
  const csvLink = useRef();

  const handlePageChange = (value) => {
    setMinValue(value * numEachPage - numEachPage);
    setMaxValue(value * numEachPage);
  };

  const handlePageCountChange = (value) => {
    setNumEachPage(value);
    if (maxValue - minValue !== value) {
      setMaxValue(minValue + value);
    }
  };

  useEffect(() => {
    axios
      .get("/inv/" + categoryId + "/" + storeId + "/blk/upl/vw")
      .then((response) => {
        console.log("Bulk Upload Log :", response.data.data);
        setLogs(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  }, []);

  const fetchData = (id) => {
    console.log(" fetch api call ", id);
    axios
      .get("/inv/" + categoryId + "/" + storeId + "/" + id + "/blk/lg/dwl")
      .then((response) => {
        console.log("Download Bulk upload :", response.data);
        setCsvData(response.data);
        if (response.data === csvData) {
          setTimeout(() => {
            csvLink.current.link.click();
          });
        }
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  useEffect(() => {
    if (csvData !== null && csvData) {
      setTimeout(() => {
        csvLink.current.link.click();
      });
    }
  }, [csvData]);

  return (
    <div id="BulkUploadLog">
      <p style={{ margin: "1em 10px" }}>
        <span
          onClick={props.goBack}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          {status}&ensp;/
        </span>
        &ensp;
        <span>Download Log</span>
      </p>

      <div className="bulk-header">Bulk Upload Log</div>

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
      ) : logs.length === 0 ? (
        <div
          style={{
            height: "70vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: "35px",
              fontFamily: "Anton",
              color: "#9e9e9e",
            }}
          >
            No Logs Available
          </p>
        </div>
      ) : (
        <div>
          {logs &&
            logs.slice(minValue, maxValue).map((o, index) => {
              let date = new Date(o.created);
              let createdDate =
                ("0" + date.getDate()).slice(-2) +
                "/" +
                ("0" + (date.getMonth() + 1)).slice(-2) +
                "/" +
                date.getFullYear() +
                " - " +
                date.getHours() +
                ":" +
                date.getMinutes() +
                ":" +
                date.getSeconds() +
                ":" +
                (date.getMilliseconds() / 10).toFixed(0);

              return (
                <Row
                  gutter={16}
                  className="log-items"
                  style={{ padding: "8px 10px" }}
                  key={index}
                >
                  <Col span={1}>{index + 1}.</Col>
                  <Col span={9}>
                    <p className="m-0">[{o.filename}]</p>
                  </Col>
                  <Col span={12}>
                    <div style={{ width: "max-content" }}>
                      <div>
                        Uploaded Date: <span>{createdDate}</span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-evenly",
                        }}
                      >
                        <p className="m-0">
                          Valid:<span>{o.valid} </span>
                        </p>
                        <p className="m-0">
                          InValid:<span>{o.invalid} </span>
                        </p>
                      </div>
                    </div>
                  </Col>
                  <Col span={2}>
                    <DownloadOutlined
                      style={{ fontSize: "25px" }}
                      onMouseDown={() => fetchData(o._id)}
                    />
                    {csvData !== null ? (
                      <CSVLink
                        data={csvData}
                        filename={o.filename}
                        className="csv-hidden"
                        ref={csvLink}
                        target="_blank"
                      />
                    ) : null}
                  </Col>
                </Row>
              );
            })}
        </div>
      )}
      {logs.length > numEachPage && (
        <PagePagination
          minValue={minValue}
          handlePageChange={handlePageChange}
          handlePageCountChange={handlePageCountChange}
          maxValue={maxValue}
          numEachPage={numEachPage}
          orderList={logs}
        />
      )}
    </div>
  );
}

export default BulkUploadLog;
