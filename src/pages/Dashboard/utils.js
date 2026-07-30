import axios from "axios";
import { message } from "antd";

export const getDashboardInfo = async (body, setDataSource, setLoading) => {
  setLoading && setLoading(true);

  try {
    const endpoints = [
      "/order/v2/dashboard/traction",
      "/order/v2/dashboard/usersInCart",
      "/order/v2/dashboard/orderStatus",
      "/order/v2/dashboard/customer/status",
      "/order/v2/dashboard/esorders",
      "/order/v2/dashboard/graph",
    ];

    let response = await axios.all(
      endpoints.map((url) => axios.post(url, body))
    );

    response = response.map((item, index) => {
      if (index === 1) return item.data;

      return item.data.data;
    });

    const data = {
      ...response[0],
      ...response[1],
      orderStatus: response[2][0],
      customerStatus: response[3][0],
      ...response[4],
      dashboard: response[5],
    };

    data.cancelledInfo = data.cancelledInfo[0];
    data.escalationInfo = data.escalationInfo[0];
    data.refundedInfo = data.refundedInfo[0];

    setDataSource && setDataSource(data);
    setLoading && setLoading(false);

    return data;
  } catch (e) {
    message.warning("This is a warning message", e?.message);
  } finally {
    setLoading && setLoading(false);
  }
};
