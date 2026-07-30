import React, { useEffect, useState, useRef } from "react";
import "./SKU_ManageStockModal.less";
import { Modal, Button, message } from "antd";
import axios from "axios";
import { CSVLink, CSVDownload } from "react-csv";

function SKUUploadModal(props) {
  const [inventorySKU, setInventorySKU] = useState(null);
  const [loading, setLoading] = useState(false);

  const { categoryId, storeId, status } = props;
  const inputFile = useRef(null);

  useEffect(() => {
    setLoading(true);
    let link;
    if (status === "unApprove") {
      link = "/inv/" + categoryId + "/sku/blk/dwl";
    } else {
      link = "/inv/" + categoryId + "/" + storeId + "/sku/blk/stk/dwl";
    }
    axios
      .get(link)
      .then((response) => {
        setInventorySKU(response.data);
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  }, []);

  const uploadFile = (e) => {
    var body = new FormData();
    body.append("template", e);
    let link;
    if (status === "unApprove") {
      link = "/inv/" + categoryId + "/" + storeId + "/sku/blk/upl";
    } else {
      link = "/inv/" + categoryId + "/" + storeId + "/sku/blk/stk/upl";
    }
    axios
      .post(link, body, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response);
        message.success("Successfully Uploaded");
        props.onClose();
      })
      .catch((error) => {
        message.error(error?.response?.data?.message || "Something went wrong");
      });
  };

  return (
    <Modal
      className="sku-upload-modal"
      title="Manage SKU Stocks"
      visible={props.openSkuUpload}
      onCancel={props.onClose}
      footer={[
        <CSVLink key="1" data={inventorySKU} filename={"inventorySku.csv"}>
          <Button type="primary">Download</Button>
        </CSVLink>,
        <Button
          key="2"
          type="primary"
          onClick={() => {
            inputFile.current.click();
          }}
        >
          Upload
        </Button>,
      ]}
    >
      <div className="main-div">
        <input
          type="file"
          id="file"
          accept=".csv"
          ref={inputFile}
          onChange={(e) => {
            uploadFile(e.target.files[0]);
            props.onClose();
          }}
          style={{ display: "none" }}
        />
        <p className="header-div">
          <b>
            Edit and update your stocks, selling price of the live product
            through Excel(.csv)
          </b>
        </p>

        <p className="m-0">Follow these steps:</p>
        <ol className="step-list">
          <li>
            Click Download Live Stock Status button to download your current
            stocks status file.
          </li>
          <li>
            Update the Selling Price/Stocks/Tax/Offer in the sheet without
            changing the column structure.
          </li>
          <li>Save the file and click the Upload button to upload the file</li>
        </ol>
        <p className="m-0">
          <span>Note: </span> Please don't make any changes(Move/Delete/Add) in
          the column order and the title text. It may cause an error while
          uploading the file. If you don't have enough data for a particular
          product leave the column as empty.
        </p>
      </div>
    </Modal>
  );
}

export default SKUUploadModal;
