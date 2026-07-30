import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import "./ForgotPassword.less";
import { BrowserRouter as Router, Redirect } from "react-router-dom";
import axios from "axios";
import { connect } from "react-redux";
import md5 from "md5";

const ForgotPassword = (props) => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [mobile, setMobile] = useState();
  const [resetPassword, setResetPassword] = useState(false);
  const [redirect, setRedirect] = useState(null);

  const getOtp = ({ mobile }) => {
    console.log("forgot password", mobile);
    setMobile(mobile);
    setLoading(true);
    axios
      .post("/auth/forgotpassword/verify", {
        mobile: {
          dialing_code: 91,
          number: mobile,
        },
      })
      .then((response) => {
        console.log(response.data.data);
        setLoading(false);
        setResetPassword(true);
      })
      .catch((e) => {
        console.error(e.response?.data);
        message.error(e.response?.data?.message || "Something went wrong.");
        setLoading(false);
      });
  };

  const resetYourPassword = ({ otp, password }) => {
    setLoading(true);
    axios
      .post("/auth/resetpassword", {
        mobile: {
          dialing_code: 91,
          number: mobile,
        },
        otp: otp,
        password: md5(password),
      })
      .then((response) => {
        console.log(response.data.data);
        setLoading(false);
        setRedirect("/login");
      })
      .catch((e) => {
        console.error(e.response?.data);
        message.error(e.response?.data?.message || "Something went wrong.");
        setLoading(false);
      });
  };

  if (redirect !== null) {
    return <Redirect to={redirect} />;
  }

  return (
    <div id="ForgotPassword">
      <div style={{ display: "contents" }}>
        <img src="/assets/logo.png" style={{ height: "80px" }} />
        <h2 style={{ fontWeight: "bold" }}>Store Admin</h2>
      </div>

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: false }}
        onFinish={resetPassword ? resetYourPassword : getOtp}
      >
        {!resetPassword ? (
          <>
            <div>
              <h2 style={{ textAlign: "center" }}>Forgot Password</h2>
              <p className="text-gray">
                Please enter your login mobile number to get OTP
              </p>
            </div>

            <Form.Item
              name="mobile"
              rules={[
                {
                  required: true,
                  message: "Please input Mobile Number",
                },
              ]}
            >
              <Input type="text" placeholder="Mobile Number" />
            </Form.Item>
            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                loading={loading}
                htmlType="submit"
                className="login-form-button"
                style={{ width: "120px" }}
              >
                Verify
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 style={{ textAlign: "center" }}>Reset Password</h2>
              <p className="text-gray">
                Please enter right OTP and set new Password
              </p>
            </div>
            <Form.Item
              name="otp"
              rules={[
                {
                  required: true,
                  message: "Please input Mobile Number",
                },
              ]}
            >
              <Input type="text" placeholder="OTP" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input type="password" placeholder="Reset Password" />
            </Form.Item>

            <div style={{ textAlign: "center" }}>
              <Button
                type="primary"
                loading={loading}
                htmlType="submit"
                className="login-form-button"
                style={{ width: "120px" }}
              >
                Reset Password
              </Button>
            </div>
          </>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);
