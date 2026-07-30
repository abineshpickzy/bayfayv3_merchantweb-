import React, { useState } from "react";
import { Pagination } from "antd";
import { StepForwardOutlined, StepBackwardOutlined } from "@ant-design/icons";

function CustomPagination(props) {
  const {
    currentPage = 1,
    numEachPage,
    total,
    handlePageChange,
    handlePageCountChange,
  } = props;

  return (
    <div
      style={{
        margin: "10px 0",
        display: "flex",
        justifyContent: "space-between",
        color: "#dadada",
        background: "#424242",
        padding: "0 10px",
        position: "sticky",
        bottom: "5px",
        borderRadius: "5px",
      }}
    >
      <div>
        <p style={{ padding: "6px 0", margin: 0 }}>
          Rows per Page:&ensp;&ensp;
          <button
            style={
              numEachPage === 25
                ? { backgroundColor: "black" }
                : { backgroundColor: "#424242", border: "none" }
            }
            value={25}
            onClick={() => {
              handlePageCountChange(25);
            }}
          >
            25
          </button>
          &ensp;&ensp;
          <button
            style={
              numEachPage === 50
                ? { backgroundColor: "black" }
                : { backgroundColor: "#424242", border: "none" }
            }
            value={50}
            onClick={() => {
              handlePageCountChange(50);
            }}
          >
            50
          </button>
          &ensp;&ensp;
          <button
            style={
              numEachPage === 75
                ? { backgroundColor: "black" }
                : { backgroundColor: "#424242", border: "none" }
            }
            value={75}
            onClick={() => {
              handlePageCountChange(75);
            }}
          >
            75
          </button>
          &ensp;&ensp;
          <button
            style={
              numEachPage === 100
                ? { backgroundColor: "black" }
                : { backgroundColor: "#424242", border: "none" }
            }
            onClick={() => {
              handlePageCountChange(100);
            }}
          >
            100
          </button>
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <StepBackwardOutlined
          style={{ fontSize: "18px" }}
          onClick={() => {
            handlePageChange(1);
          }}
        />
        <Pagination
          className="custom-pagination"
          current={currentPage}
          defaultCurrent={1}
          defaultPageSize={numEachPage}
          pageSize={numEachPage}
          onChange={(e) => {
            handlePageChange(e);
          }}
          total={total}
          showSizeChanger={false}
        />
        <StepForwardOutlined
          style={{ fontSize: "18px" }}
          onClick={() => {
            handlePageChange(Math.ceil(total / numEachPage));
          }}
        />
      </div>
    </div>
  );
}

export default CustomPagination;
