import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import App from "./pages";
import * as serviceWorker from "./serviceWorker";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import axios from "axios";
import logger from "redux-logger";

axios.defaults.baseURL = process.env.REACT_APP_BASE_URL;
// axios.defaults.headers.common['Authorization'] = 'AUTH TOKEN';
// axios.defaults.headers.post['Content-Type'] = 'application/json';

const authReducer = function (
  state = { locale: "en", user: JSON.parse(localStorage.getItem("auth")) },
  action
) {
  switch (action.type) {
    case "LOGIN":
      // console.log(action.payload);
      localStorage.setItem("auth", JSON.stringify(action.payload));
      axios.defaults.headers.common["Authorization"] =
        "Bearer " + action.payload.auth_token.access.token;
      return { ...state, user: action.payload };
    case "UPDATE_LOCALE":
      localStorage.setItem("locale", action.payload);
      return { ...state, locale: action.payload };
    case "LOGOUT":
      localStorage.setItem("auth", null);
      delete axios.defaults.headers.common["Authorization"];
      return { locale: "en", user: null };
    default:
      return state;
  }
};

let store = createStore(authReducer, applyMiddleware(logger));
// console.log(store.getState());
if (store?.getState().user && store?.getState().user.auth_token.access.token) {
  // console.log(store?.getState().user.auth_token.access.token);
  axios.defaults.headers.common["Authorization"] =
    "Bearer " + store?.getState().user.auth_token.access.token;
}

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // 401 means user is not authenticated, set user to empty object({})
    if (
      error.response &&
      error.response.status === 500 &&
      error.response.data.token === "expired"
    ) {
      store.dispatch({
        type: "LOGOUT",
        payload: {},
      });
    }
    return Promise.reject(error);
  }
);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
