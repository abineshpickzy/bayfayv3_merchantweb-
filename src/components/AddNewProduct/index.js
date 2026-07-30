import React, { useEffect, useRef, useState } from "react";
import "./AddNewProduct.less";
import {
  Card,
  Col,
  Row,
  Form,
  Input,
  Select,
  InputNumber,
  Cascader,
  Upload,
  message,
  Spin,
  DatePicker,
  Button,
} from "antd";
import {
  CloseOutlined,
} from "@ant-design/icons";
import axios from "axios";
import Modal from "antd/lib/modal/Modal";
import SearchedProductList from "./SearchedProductList";
import SelectedProductModal from "./SelectedProductModal";
import ImgCrop from "antd-img-crop";

const { Option } = Select;
const { Search } = Input;

const dummyRequest = ({ onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 100);
};

function AddNewProduct(props) {
  const [upcOrSku, setUpcOrSku] = useState("upc");
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [keyword, setKeywords] = useState([]);
  const [openUnitsModal, setOpenUnitsModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [searchedUnit, setSearchedUnit] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState();
  const [searchedProduct, setSearchedProduct] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [submitType, setSubmitType] = useState();
  const [openAddSelectedProduct, setOpenAddSelectedProduct] = useState(false);
  const [imageKeys, setImageKeys] = useState([]);
  const [replayDiv, setReplayDiv] = useState(true);
  const [openReviewModal, setOpenReviewModal] = useState(false);
  const [feedback, setFeedback] = useState();
  const [previewSize, setPreviewSize] = useState({});
  const [confirmRemove, setConfirmRemove] = useState(false);

  const { categoryId, storeId, status, product, history } = props;
  const [form] = Form.useForm();

  const submitForReviewRef = useRef();

  useEffect(() => {
    history.location.state?.isNewProduct &&
      form.setFieldsValue({
        upc: history.location.state?.isNewProduct,
      });
  }, [props]);

  useEffect(() => {
    console.log("edit product item,", product);
    if (template && product) {
      form.setFieldsValue({
        ...product,
        category:product?.category ? product.category.slice(1).split("/") :"",
      });
    }
    if (product) {
      fetchProductImage();
    }
  }, [product]);

  let array = [];
  let array1 = [];

  const fetchProductImage = () => {
    product.images &&
      product.images.map((o, index) => {
        array1.push(o.keyid);

        if (product.images.length === array1.length) {
          setImageKeys(array1);
        }
        // let p_height = o.height < 500 ? 500: o.height ;
        // let p_width= o.width < 500 ? 500 : o.width;
        axios
          .get("/order/product/image?file=" + o.name + "&height=500", {
            responseType: "arraybuffer",
          })
          .then((response) => {
            const base64 = btoa(
              new Uint8Array(response.data).reduce(
                (data, byte) => data + String.fromCharCode(byte),
                ""
              )
            );
            const imageBase64 = "data:;base64," + base64;

            array.push({
              height: o.height,
              width: o.width,
              id: o.name,
              index: o.keyid,
              uid: index,
              name: "image.png",
              type: "image/jpeg",
              size: response.data.byteLength,
              url: imageBase64,
            });

            // let blob = new Blob([response.data]);
            // console.log("blob", blob);
            // console.log("size of arraybuffer", response.data.byteLength);

            // let file = new File([blob], "image.jpeg", {
            //   type: "image/jpeg",
            //   // url: imageBase64,
            // });
            // array.push(file);

            if (product.images.length === array.length) {
              setFileList(array);
            }
          });
      });
  };

  useEffect(() => {
    console.log("fileList", fileList);
  }, [fileList]);

  useEffect(() => {
    console.log("image keys", imageKeys);
  }, [imageKeys]);

  const getTemplate = () => {
    setLoading(true);
    axios
      .get("/inv/" + categoryId + "/tmp")
      .then((response) => {
        console.log("Add New Product get Template", response.data.template);
        setTemplate(response.data.template);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went Wrong");
      });
  };

  const getCategoryList = () => {
    setLoading(true);
    axios
      .get("/inv/" + categoryId + "/ctg")
      .then((response) => {
        console.log("Add New Product get Category list", response.data);
        setCategoryList(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went Wrong");
      });
  };
  const getKeyWord = () => {
    setLoading(true);
    axios
      .get("/inv/" + categoryId + "/ctg/kyw")
      .then((response) => {
        console.log("Add New Product keywords", response.data);
        setKeywords(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went Wrong");
      });
  };

  const getUnits = () => {
    setLoading(true);
    axios
      .get("/inv/" + categoryId + "/units")
      .then((response) => {
        console.log("Add New Product Unit List", response.data);
        setUnits(response.data.units);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.response?.data?.message || "Something went Wrong");
      });
  };

  useEffect(() => {
    getTemplate();
    getCategoryList();
    getKeyWord();
    getUnits();
  }, []);

  const handleChange = ({ file: newFile, fileList: newFileList }) => {
    if (newFile.type === "image/jpeg" || newFile.type === "image/png") {
      if (newFile.status === "removed") {
        setConfirmRemove(newFile);
        return false;
      }
      setFileList(newFileList);
    } else {
      alert("'You can only upload JPG/PNG file!'");
      return;
    }
  };

  const removeImage = (file) => {
    let array = [];
    if (!file.originFileObj) {
      array = fileList.filter((o) => o.id !== file.id);
      setFileList(array);
      DeleteProductImage(file.id, file.index);
    } else {
      array = fileList.filter((o) => o.uid !== file.uid);
      setFileList(array);
    }
  };

  const DeleteProductImage = (id, index) => {
    let arr = [...imageKeys];
    arr = arr.filter((o) => o !== index);
    setImageKeys(arr);

    axios
      .delete(
        "/inventory/" +
          categoryId +
          "/" +
          product._id +
          "/dl?key=" +
          index +
          "&value=" +
          id
      )
      .then((response) => {
        message.success(response?.data?.message);
      });
  };

  const getBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    if (file.url) {
      setPreviewSize({
        height: file.height,
        width: file.width,
      });
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const searchProduct = (e) => {
    if (e !== "" || e !== null || e !== undefined) {
      axios
        .post("/inv/search", {
          category_id: categoryId,
          store_id: storeId,
          keyword: e,
        })
        .then((response) => {
          console.log("searched product", response.data);
          if (response.data.products) {
            setSearchedProduct(response.data.products);
            setIsSearch(true);
          } else {
            setSearchedProduct([]);
            setIsSearch(true);
          }
        })
        .catch((error) => {
          message.error(
            error?.response?.data?.message || "Something went Wrong"
          );
        });
    } else {
      setSearchedProduct([]);
      message.alert("Product name is Empty!");
      return;
    }
  };

  const saveInDraft = (values) => {
    if (upcOrSku === "upc") {
      Object.keys(values).forEach(
        (key) =>
          (values[key] === undefined ||
            values[key] === null ||
            key === "false" ||
            key === "select-upc" ||
            key === "sku") &&
          delete values[key]
      );
    } else {
      Object.keys(values).forEach(
        (key) =>
          (values[key] === undefined ||
            values[key] === null ||
            key === "false" ||
            key === "select-upc" ||
            key === "upc") &&
          delete values[key]
      );
    }

    if (
      values[upcOrSku] === null ||
      values[upcOrSku] === "" ||
      values[upcOrSku] === undefined
    ) {
      alert(upcOrSku + " is require for save product ");
      return;
    }
    if (
      values.product_name === null ||
      values.product_name === "" ||
      values.product_name === undefined
    ) {
      alert("Product name is require for save product ");
      return;
    }

    var obj;
    if (values.category) {
      obj = {
        ...values,
        category: "/" + values.category.join("/"),
      };
    } else {
      obj = {
        ...values,
      };
    }

    console.log("OBJ -->", obj);

    let body = new FormData();
    body.append("inputs", JSON.stringify(obj));

    let ArrayKey = ["image1", "image2", "image3", "image4", "image5", "image6"];

    ArrayKey = ArrayKey.filter((x) => !imageKeys.includes(x));

    let files = fileList.filter((o) => o.originFileObj);

    files &&
      files.map((o, index) => {
        body.append(ArrayKey[index], o.originFileObj);
      });

    for (var pair of body.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    // if (files.length < 1) {
    //   message.error("Please add minimum two images");
    //   return;
    // }

    setLoading(true);
    axios
      .post("/inv/" + categoryId + "/" + storeId + "/sku/ad/dft", body, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          message.success(response.data.message);
          form.resetFields();
          setFileList([]);
          let newurl = window.location.pathname + "?refreshCount=true";
          props.history.push(newurl);
          setUpcOrSku("upc");
          setLoading(false);
        } else {
          message.error(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong!"
        );
      });
  };

  const SubmitForReview = (values) => {
    Object.keys(values).forEach(
      (key) =>
        (values[key] === undefined || key === "false" || key === "select-upc") &&
        delete values[key]
    );
    let obj = {
      ...values,
      category: "/" + values.category.join("/"),
    };

    let body = new FormData();
    body.append("inputs", JSON.stringify(obj));

    let ArrayKey = ["image1", "image2", "image3", "image4", "image5", "image6"];

    ArrayKey = ArrayKey.filter((x) => !imageKeys.includes(x));

    let files = fileList.filter((o) => o.originFileObj);

    files &&
      files.map((o, index) => {
        body.append(ArrayKey[index], o.originFileObj);
      });

    if (files.length < 1) {
      message.error("Please add minimum two images");
      return;
    }

    setLoading(true);
    axios
      .post("/inv/" + categoryId + "/" + storeId + "/sku/ad/mtr", body, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        if (response.data.success) {
          message.success(response.data.message);
          form.resetFields();
          setFileList([]);
          let newurl = window.location.pathname + "?refreshCount=true";
          props.history.push(newurl);
          setUpcOrSku("upc");
          setLoading(false);
        } else {
          message.error(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong!"
        );
      });
  };

  //edit product save as draft
  const EditProductSaveAsDraft = (values) => {
    Object.keys(values).forEach(
      (key) =>
        (values[key] === undefined || key === "false" || key === "select-upc") &&
        delete values[key]
    );
    let obj = {
      ...values,
      category: "/" + values.category.join("/"),
    };

    let body = new FormData();
    body.append("inputs", JSON.stringify(obj));

    feedback && body.append("feedback", feedback);

    let ArrayKey = ["image1", "image2", "image3", "image4", "image5", "image6"];

    ArrayKey = ArrayKey.filter((x) => !imageKeys.includes(x));

    let files = fileList.filter((o) => o.originFileObj);

    files &&
      files.map((o, index) => {
        body.append(ArrayKey[index], o.originFileObj);
      });

    // if (fileList.length < 1) {
    //   message.error("Please add minimum two images");
    //   return;
    // }

    setLoading(true);
    axios
      .patch(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/sku/" +
          product._id +
          "/ed/dft",
        body,
        {
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          message.success(response.data.message);
          form.resetFields();
          setFileList([]);
          setLoading(false);
          props.goBack();
        } else {
          message.error(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong!"
        );
      });
  };

  //edit product submit for review
  const EditProductSubmitForReview = (values) => {
    Object.keys(values).forEach(
      (key) =>
        (values[key] === undefined || key === "false" || key === "select-upc") &&
        delete values[key]
    );

    let obj = {
      ...values,
      category: "/" + values.category.join("/"),
    };

    let body = new FormData();
    body.append("inputs", JSON.stringify(obj));

    feedback && body.append("feedback", feedback);

    let ArrayKey = ["image1", "image2", "image3", "image4", "image5", "image6"];

    ArrayKey = ArrayKey.filter((x) => !imageKeys.includes(x));

    let files = fileList.filter((o) => o.originFileObj);

    files &&
      files.map((o, index) => {
        body.append(ArrayKey[index], o.originFileObj);
      });

    if (fileList.length < 1) {
      message.error("Please add minimum two images");
      return;
    }

    setLoading(true);
    axios
      .patch(
        "/inv/" +
          categoryId +
          "/" +
          storeId +
          "/sku/" +
          product._id +
          "/ed/mtr",
        body,
        {
          headers: {
            "content-type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        if (response.data.success) {
          message.success(response.data.message);
          form.resetFields();
          setFileList([]);
          setLoading(false);
          props.goBack();
        } else {
          message.error(response.data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        message.error(
          error?.response?.data?.message || "Something went wrong!"
        );
      });
  };

  const setSelectedProduct = (item) => {
    setOpenAddSelectedProduct(item);
    setSearchedProduct([]);
  };

  const categories = [];
  if (categoryList) {
    categoryList.forEach((c) => {
      const cats = c.split("/");
      c = categories;
      let parent = "";
      for (let i = 0; i < cats.length; i++) {
        if (i > 0 && cats[i - 1].length > 0) {
          parent += `/${cats[i - 1]}`;
        }
        if (cats[i].length === 0) continue;
        let temp = c.find((t) => t.name === cats[i]);
        if (!temp) {
          temp = { parent, name: cats[i], children: [] };
          c.push(temp);
        }
        c = temp.children;
      }
    });
  }

  let skuValue = parseInt(
    Math.random(1111111111111, 9999999999999) + new Date().valueOf()
  ).toString();

  return (
    <div id="AddNewProduct">
      <p style={{ margin: "1em 0" }}>
        <span
          onClick={() => {
            props.goBack();
            history.location.state?.isNewProduct && history.goBack();
          }}
          style={{ fontWeight: "900", color: "#0275d8", cursor: "pointer" }}
        >
          {status}&ensp;/
        </span>
        &ensp;
        {product ? (
          <span>{product.product_name}</span>
        ) : (
          <span>Add New Products</span>
        )}
      </p>
      <Card>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "75vh",
            }}
          >
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            autoComplete="off"
            onFinish={
              product
                ? submitType === "save-draft"
                  ? EditProductSaveAsDraft
                  : EditProductSubmitForReview
                : submitType !== "save-draft" && SubmitForReview
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={12} style={{ marginRight: "auto" }}>
                {!product ? (
                  <>
                    <Form.Item
                      label={"Select UPC/EAN/SKU"}
                      name={"select-upc"}
                      initialValue={"upc"}
                    >
                      <Select
                        onChange={(e) => setUpcOrSku(e)}
                        defaultValue="upc"
                      >
                        <Option value="upc">UPC/EAN</Option>
                        <Option value="sku">SKU</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label={upcOrSku === "upc" ? "UPC/EAN" : "SKU"}
                      name={upcOrSku}
                      rules={[
                        {
                          required: true,
                          message: "Please Enter" + upcOrSku,
                        },
                      ]}
                      initialValue={upcOrSku === "sku" ? skuValue : null}
                    >
                      <Input
                        maxLength={upcOrSku && 13}
                        disabled={upcOrSku === "sku" ? true : false}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Product Name"
                      name="product_name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter product name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </>
                ) : (               <>
                    <Form.Item
                      label={product?.upc ? "UPC/EAN" : "SKU"}
                      name={product?.upc ? "upc" : "sku"}
                      rules={[
                        {
                          required: true,
                          message: product?.upc
                            ? "Please Enter upc"
                            : "Please Enter sku",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="Product Name"
                      name="product_name"
                      rules={[
                        {
                          required: true,
                          message: "Please enter product name",
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </>
                )}

                {template &&
                  template.slice(1).map((item, index) => {
                    return (
                      <Form.Item
                        key={index}
                        label={item.display_name}
                        name={item.key_name}
                        initialValue={item?.default}
                        rules={[
                          {
                            required: item.required,
                            message:
                              "Please enter product " + item.display_name + "!",
                          },
                        ]}
                      >
                        {item.format === 1 ? (
                          item.key_name === "unit" ? (
                            <Row gutter={8} style={{ margin: "0" }}>
                              <Col span={12}>
                                <Form.Item
                                  className="inner-form-item"
                                  style={{ margin: 0 }}
                                  name={item.key_name}
                                  initialValue={item?.default}
                                >
                                  <Input id="unit" />
                                </Form.Item>
                              </Col>
                              <Col span={12}>
                                <Button
                                  style={{
                                    width: "100%",
                                    background: "#bdbdbd",
                                    border: "solid 1px #bdbdbd",
                                  }}
                                  onClick={() =>
                                    form.getFieldValue("unit") !== "" &&
                                    form.getFieldValue("unit") !== null &&
                                    form.getFieldValue("unit") !== undefined
                                      ? setOpenUnitsModal(true)
                                      : alert("Unit is Empty!")
                                  }
                                >
                                  Select Unit (eg, kg)
                                </Button>
                              </Col>
                            </Row>
                          ) : // </span>
                          item.key_name === "product_name" ? (
                            product ? (
                              <Input />
                            ) : (
                              <div style={{ position: "relative" }}>
                                <Search onSearch={searchProduct} />
                                {searchedProduct &&
                                isSearch &&
                                searchedProduct.length > 0 ? (
                                  <div className="searched-product-div">
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        margin: "-5px -5px 0",
                                      }}
                                    >
                                      <span>Products</span>
                                      <CloseOutlined
                                        onClick={() => {
                                          setIsSearch(false);
                                          setSearchedProduct([]);
                                        }}
                                      />
                                    </div>
                                    {searchedProduct.map((item, index) => (
                                      <SearchedProductList
                                        item={item}
                                        key={index}
                                        setSelectedProduct={() =>
                                          setSelectedProduct(item)
                                        }
                                      />
                                    ))}
                                  </div>
                                ) : (
                                  isSearch && (
                                    <div className="searched-product-div">
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          margin: "-5px -5px 0",
                                        }}
                                      >
                                        <p
                                          style={{
                                            margin: "0px",
                                            color: "red",
                                          }}
                                        >
                                          Matching products not found !
                                        </p>
                                        <CloseOutlined
                                          onClick={() => {
                                            setIsSearch(false);
                                            setSearchedProduct([]);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )
                          ) : (
                            <Input />
                          )
                        ) : item.format === 2 ? (
                          <InputNumber
                            type="number"
                            step="1"
                            style={{ width: "100%" }}
                          />
                        ) : item.format === 3 ? (
                          <InputNumber
                            type="number"
                            step="any"
                            style={{ width: "100%" }}
                          />
                        ) : item.format === 4 ? (
                          <DatePicker showTime style={{ width: "100%" }} />
                        ) : item.format === 5 ? (
                          <Select
                            mode="tags"
                            style={{ width: "100%" }}
                            className="select-keyword"
                          >
                            {/* arry of keywords */}
                            {item.key_name === "keywords" ? (
                              keyword &&
                              keyword.map((o) => (
                                <Option key={o} value={o}>
                                  {o}
                                </Option>
                              ))
                            ) : (
                              <Option value="1">1</Option>
                            )}
                          </Select>
                        ) : item.format === 6 ? (
                          <Input.TextArea />
                        ) : (
                          item.format === 7 && (
                            <Cascader
                              changeOnSelect
                              options={categories}
                              fieldNames={{
                                label: "name",
                                value: "name",
                                children: "children",
                              }}
                              expandTrigger="hover"
                              placeholder={false}
                            />
                          )
                        )}
                      </Form.Item>
                    );
                  })}
              </Col>
              <Col span={11} style={{ marginLeft: "auto" }}>
                <Row gutter={[16, 16]}>
                  <ImgCrop
                    quality={1}
                    rotate
                    grid
                    zoom
                    minZoom={0.2}
                    maxZoom={5}
                    aspect={1 / 1}
                  >
                    <Upload
                      name="avatar"
                      listType="picture-card"
                      className="avatar-uploader"
                      customRequest={dummyRequest}
                      fileList={fileList}
                      onPreview={handlePreview}
                      onChange={handleChange}
                    >
                      {fileList.length < 6 &&
                        "Drag and Drop Here or Click here"}
                    </Upload>
                  </ImgCrop>
                </Row>
              </Col>
            </Row>

            {product && replayDiv && product.status === 3 && (
              <div
                style={{
                  width: "350px",
                  position: " sticky",
                  bottom: "10px",
                  marginLeft: "auto",
                  marginTop: "-110px",
                }}
              >
                <div
                  style={{
                    background: "#f4e2e2",
                    border: "solid 1px #fa5b5b",
                    padding: "15px",
                    // width: "350px",
                    position: "relative",
                  }}
                >
                  <CloseOutlined
                    style={{ position: "absolute", right: "15px" }}
                    onClick={() => setReplayDiv(false)}
                  />
                  <p style={{ margin: "10px" }}>
                    {product.feedback && product.feedback[0]?.message}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "end",
                      marginRight: "35px",
                    }}
                  >
                    <Button
                      style={{ padding: "5px 30px", borderRadius: "5px" }}
                      onClick={() => setOpenReviewModal(true)}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="form-submit-div">
              <Button
                type="primary"
                style={{
                  background: "#2a94f3",
                  border: "solid 1px  #2a94f3",
                  width: "200px",
                }}
                size="large"
                htmlType={product ? "submit" : "button"}
                disabled={product && product.status === 1 ? true : false}
                onClick={() => {
                  product
                    ? setSubmitType("save-draft")
                    : saveInDraft(form.getFieldsValue(true));
                }}
              >
                Save Draft
              </Button>
              <Button
                type="primary"
                style={{
                  background: "#5ea807",
                  border: "solid 1px #5ea807",
                  width: "200px",
                }}
                size="large"
                htmlType="submit"
                ref={submitForReviewRef}
                onClick={() => setSubmitType("submit-for-review")}
              >
                Submit For Review
              </Button>
            </div>
          </Form>
        )}
      </Card>

      {/* Unit modal */}
      <Modal
        className="select-unit-modal"
        title="Select Unit Type"
        visible={openUnitsModal}
        onCancel={() => setOpenUnitsModal(false)}
      >
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Input
              size="large"
              value={searchedUnit}
              placeholder="Enter unit name"
              onChange={(e) => setSearchedUnit(e.target.value)}
            />
          </Col>
          <Col span={6}>
            <Button
              size="large"
              type="primary"
              style={{ background: "#017fec", width: "100%" }}
              onClick={() => {
                let oldfield = form.getFieldValue("unit");
                let oldUnit = units.filter((v) => oldfield.includes(v));

                console.log("oldUnit", oldUnit);
                if (oldUnit.length > 0) {
                  let index = oldfield.indexOf(oldUnit[oldUnit.length - 1]);
                  let newField = oldfield.slice(0, index - 1);
                  console.log("index", index);

                  form.setFieldsValue({
                    unit: newField + " " + searchedUnit,
                  });
                } else {
                  form.setFieldsValue({
                    unit: oldfield + " " + searchedUnit,
                  });
                }

                setOpenUnitsModal(false);
              }}
            >
              Okay
            </Button>
          </Col>
          {units &&
            units.map((o) => {
              return (
                <Col span={6} key={o}>
                  <div
                    style={{
                      width: "100%",
                      textAlign: "center",
                      border: "solid 1px #ccc",
                    }}
                    onClick={() => setSearchedUnit(o)}
                  >
                    {o}
                  </div>
                </Col>
              );
            })}
        </Row>
      </Modal>

      {/* Image preview modal */}
      <Modal
        className="image-preview"
        visible={previewVisible}
        centered
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        {previewImage && (
          <img
            alt="example"
            src={previewImage}
            style={{
              width: previewSize ? previewSize.width : "100%",
              height: "auto",
              margin: "10px",
              maxWidth: "1024px",
              // maxHeight: "1024px",
            }}
          />
        )}
      </Modal>

      {/* rejected Replay modal */}
      <Modal
        title="Merchant Resolution"
        className="rejected-replay-modal"
        centered
        visible={openReviewModal}
        onCancel={() => setOpenReviewModal(false)}
        closable={false}
        footer={[
          <Button
            type="primary"
            key="1"
            onClick={() => setOpenReviewModal(false)}
            style={{ background: "#fe2727", border: "solid 1px #fe2727" }}
          >
            Cancel
          </Button>,
          <Button
            type="primary"
            key="2"
            style={{ background: "#03b531", border: "solid 1px #03b531" }}
            // htmlType="submit"
            onClick={() => {
              setSubmitType("submit-for-review");
              setOpenReviewModal(false);
              form.submit();
            }}
          >
            Submit for Review
          </Button>,
        ]}
      >
        <div style={{ height: "120px", width: "300px" }}>
          <Input.TextArea
            style={{ height: "100%" }}
            onChange={(e) => {
              console.log("rejected replay", e.target.value);
              setFeedback(e.target.value);
            }}
          />
        </div>
      </Modal>

      {/* confirm remove */}
      <Modal
        title="Info"
        visible={confirmRemove}
        onCancel={() => setConfirmRemove(false)}
        centered
        closable={false}
        className="shop-open-close-modal"
        footer={[
          <Button key="1" type="link" onClick={() => setConfirmRemove(false)}>
            No
          </Button>,
          <Button
            key="2"
            type="link"
            onClick={() => {
              removeImage(confirmRemove);
              setConfirmRemove(false);
            }}
          >
            Yes
          </Button>,
        ]}
      >
        <div> Are you sure you want to delete the image?</div>
      </Modal>

      {/* openAddSelectedProduct */}
      <SelectedProductModal
        item={openAddSelectedProduct}
        categoryId={categoryId}
        storeId={storeId}
        openAddSelectedProduct={openAddSelectedProduct}
        onClose={() => setOpenAddSelectedProduct(false)}
      />
    </div>
  );
}

export default AddNewProduct;
