import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import BulkUploadLog from "../BulkUploadLog";
import AddNewProduct from "../AddNewProduct";

function UnApprovedProducts(props) {
  const { categoryId, storeId } = props.match.params;
  const [openBulkUploadLog, setOpenBulkUploadLog] = useState(false);
  const [openAddNewProduct, setOpenAddNewProduct] = useState(false);

  useEffect(() => {
    if (props.history.location.state?.isNewProduct) {
      setOpenAddNewProduct(true);
    }
  }, [props]);
  return (
    <div>
      {!openBulkUploadLog && !openAddNewProduct && (
        <ProductList
          history={props.history}
          categoryId={categoryId}
          storeId={storeId}
          // OpenBulkUploadLog={() => setOpenBulkUploadLog(true)}
          AddNewProductOpen={(item) => setOpenAddNewProduct(item)}
        />
      )}
      {/* {openBulkUploadLog && !openAddNewProduct && (
        <BulkUploadLog
          status="UnApproved"
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => {
            setOpenBulkUploadLog(false);
          }}
        />
      )} */}

      {openAddNewProduct && !openBulkUploadLog && (
        <AddNewProduct
          status="UnApproved"
          history={props.history}
          product={typeof openAddNewProduct === "object" && openAddNewProduct}
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => {
            setOpenAddNewProduct(false);
          }}
        />
      )}
    </div>
  );
}

export default UnApprovedProducts;
