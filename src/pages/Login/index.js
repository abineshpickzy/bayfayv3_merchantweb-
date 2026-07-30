import React, { useState, useEffect } from "react";
import { Form, Input, Button, message, Checkbox } from "antd";
import { BrowserRouter as Router, Redirect } from "react-router-dom";
import "./Login.less";
import axios from "axios";
import { connect } from "react-redux";
import md5 from "md5";

const Login = (props) => {
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const [cordinates, setCordinates] = useState(null);
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    rememberPassword: false,
  });

  const { email, password, rememberPassword } = inputs;

  const handleChange = (e) => {
    const { name } = e.target;
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const onFinish = ({ email, password }) => {
    setLoading(true);
    const isMobile = email.includes("@") ? false : true;

    let body = {
      mobile: {
        dialing_code: 91,
        number: email,
      },
      password: md5(password),
      device_details: {
        type: 3,
        token: "eebe9d0aa28aa5e6",
      },
    };

    if (cordinates) {
      body = {
        ...body,
        current_location: {
          type: "Point",
          coordinates: [cordinates.longitude, cordinates.latitude],
        },
      };
    }
    axios
      .post(isMobile ? "/auth/mobile" : "/auth/email", body)
      .then((response) => {
        console.log("payload :",body);
        console.log("Login response:", response.data);
        props.login(response.data.data);
        setRedirect("/store");
      })
      .catch((e) => {
        console.error(e.response?.data);
        message.error(e.response?.data?.message || "Something went wrong.");
        setLoading(false);
      });
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      setCordinates(position.coords);
    });
  }, []);

  if (redirect !== null) {
    return <Redirect to={redirect} />;
  }

  return (
    <div id="Login">
      <div style={{ display: "contents" }}>
        <img src="/assets/logo.png" style={{ height: "80px" }} alt="logo" />
        <h2 style={{ fontWeight: "bold" }}>Store Admin</h2>
      </div>

      <Form
        name="normal_login"
        className="login-form"
        initialValues={{}}
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
          <Input
            type="text"
            name="email"
            value={inputs.email}
            onChange={(event) => handleChange(event)}
            placeholder="Mobile Number or Email Id"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Please input your Password!" }]}
        >
          <Input
            type="password"
            name="password"
            value={inputs.password}
            onChange={(event) => handleChange(event)}
            placeholder="Password"
          />
        </Form.Item>
        <Form.Item
          name="rememberPassword"
          valuePropName="checked"
          id="rememberPassword"
        >
          <Checkbox
            name="rememberPassword"
            checked={inputs.rememberPassword}
            onChange={(event) => {
              handleChange(event);
            }}
          >
            Remember me
          </Checkbox>
        </Form.Item>

        <Form.Item>
          <div className="otp-or-password">
            <a className="login-form-forgot" href="/login-using-otp">
              Login using OTP
            </a>

            <a className="login-form-forgot" href="/forgot-password">
              Forgot password
            </a>
          </div>
        </Form.Item>

        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            loading={loading}
            htmlType="submit"
            className="login-form-button"
            style={{ width: "120px" }}
          >
            Log in
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
      console.log("Dispatching LOGIN action with data:", data);
      dispatch({
        type: "LOGIN",
        payload: data,
      });
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
