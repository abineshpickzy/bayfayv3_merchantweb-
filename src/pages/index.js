import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Login from "./Login";
import Orders from "./Orders";
import StoreList from "./StoreList";
import Dashboard from "./Dashboard";
import ForgotPassword from "./ForgotPassword";
import LoginUsingOTP from "./LoginUsingOTP";
import Inventory from "./Inventory";
import PrintInvoice from "./PrintInvoice";
import AllOrders from "./AllOrders";

export default function Routes(props) {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={StoreList} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/forgot-password" component={ForgotPassword} />
        <Route exact path="/login-using-otp" component={LoginUsingOTP} />
        <Route path="/store/all-orders" component={AllOrders} />
        <Route path="/store/orders/:storeId/:categoryId" component={Orders} />
        <Route
          path="/store/inventory/:storeId/:categoryId"
          component={Inventory}
        />
        <Route exact path="/store" component={StoreList} />
        <Route exact path="/print-invoice" component={PrintInvoice} />
        <Route path="/dashboard" component={Dashboard} />
      </Switch>
    </Router>
  );
}
