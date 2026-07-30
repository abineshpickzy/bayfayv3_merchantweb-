import React, { useEffect, useState } from "react";
import ProductList from "./ProductList";
import AddProducts from "./AddProduct";
import AddProductEdit from "./AddProductEdit";
import BulkUploadLog from "../BulkUploadLog";
import ProductInfoPage from "../ProductInfo";
import AddNewProduct from "../AddNewProduct";

function LiveProducts(props) {
  const { categoryId, storeId } = props.match.params;
  const [openAddProduct, setOpenAddProduct] = useState(false);
  const [openBulkUploadLog, setOpenBulkUploadLog] = useState(false);
  const [productEdit, setProductEdit] = useState([]);
  const [openAddNewProduct, setOpenAddNewProduct] = useState(false);
  const [productInfo, setProductInfo] = useState(false);

  useEffect(() => {
    if (props.history.location.state?.isNewProduct) {
      setOpenAddNewProduct(true);
    }
  }, [props]);

  return (
    <div className="live-products">
      {!openBulkUploadLog &&
        !openAddProduct &&
        productEdit.length === 0 &&
        !productInfo &&
        !openBulkUploadLog &&
        !openAddNewProduct && (
          <ProductList
            history={props.history}
            categoryId={categoryId}
            storeId={storeId}
            OpenAddProduct={(e) => setOpenAddProduct(e)}
            OpenBulkUploadLog={() => setOpenBulkUploadLog(true)}
            openProductInfo={(o) => {
              console.log("o ====", o);
              setProductInfo(o);
            }}
            AddNewProductOpen={() => setOpenAddNewProduct(true)}
          />
        )}
      {!openBulkUploadLog &&
        openAddProduct &&
        productEdit.length === 0 &&
        !productInfo &&
        !openBulkUploadLog &&
        !openAddNewProduct && (
          <AddProducts
            categoryId={categoryId}
            storeId={storeId}
            history={props.history}
            goBack={() => setOpenAddProduct(false)}
            openAddProductEdit={(checkedProduct) =>
              setProductEdit(checkedProduct)
            }
            AddNewProductOpen={() => setOpenAddNewProduct(true)}
          />
        )}

      {!openBulkUploadLog &&
        openAddProduct &&
        productEdit.length > 0 &&
        !productInfo &&
        !openBulkUploadLog &&
        !openAddNewProduct && (
          <AddProductEdit
            categoryId={categoryId}
            storeId={storeId}
            history={props.history}
            products={productEdit}
            goBack={() => setProductEdit([])}
          />
        )}

      {openBulkUploadLog && !productInfo && !openAddNewProduct && (
        <BulkUploadLog
          status="Live"
          categoryId={categoryId}
          storeId={storeId}
          goBack={() => {
            setOpenAddProduct(false);
            setOpenBulkUploadLog(false);
          }}
        />
      )}
      {productInfo && !openBulkUploadLog && !openAddNewProduct && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <ProductInfoPage
            status="Live"
            categoryId={categoryId}
            storeId={storeId}
            goBack={() => setProductInfo(false)}
            productItem={productInfo}
          />
        </div>
      )}
      {openAddNewProduct &&
        !openBulkUploadLog &&
        productEdit.length === 0 &&
        !productInfo &&
        !openBulkUploadLog && (
          <div
            style={{
              minHeight: "100vh",
            }}
          >
            <AddNewProduct
              status="Live"
              history={props.history}
              categoryId={categoryId}
              storeId={storeId}
              goBack={() => {
                setOpenAddNewProduct(false);
              }}
            />
          </div>
        )}
    </div>
  );
}

export default LiveProducts;
