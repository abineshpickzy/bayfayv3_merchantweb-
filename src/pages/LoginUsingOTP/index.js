import React, {  useState, } from "react";
import { Form, Input, Button, message } from "antd";
import "./LoginUsingOTP.less";
import axios from "axios";
import { connect } from "react-redux";

const LoginUsingOTP = (props) => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    // setLoading(true);
    // axios
    //   .post("/auth/email", values)
    //   .then((response) => {
    //     console.log(response.data.data);
    //     props.login(response.data.data);
    //     props.history.push("/");
    //   })
    //   .catch((e) => {
    //     console.error(e.response?.data);
    //     message.error(e.response?.data?.message || "Something went wrong.");
    //     setLoading(false);
    //   });
  };

  return (
    <div id="Login">
      <div style={{ display: "contents" }}>
        <img src="/assets/logo.png" style={{ height: "80px" }} />
        <h2 style={{ fontWeight: "bold" }}>Store Admin</h2>
      </div>

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: false }}
        onFinish={onFinish}
      >
        <Form.Item
          name="email"
          rules={[
            {
              required: true,
              message: "Please input Mobile Number or Email Id",
            },
          ]}
        >
          <Input type="text" placeholder="Mobile Number or Email Id" />
        </Form.Item>
        <Form.Item
          name="otp"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input type="text" placeholder="OTP" />
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            loading={loading}
            htmlType="submit"
            className="login-form-button"
          >
            Login Using OTP
          </Button>
        </div>
      </Form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (data) => {
      dispatch({
        type: "LOGIN",
        payload: data,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginUsingOTP);
