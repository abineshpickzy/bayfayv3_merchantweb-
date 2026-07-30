import axios from "axios";

// "Order status" // 1 - New Order, 2 - Packaging, 3 - Dispatched, 4 - Shipping, 5 - Delivered, 7 - Replacement, 6 - Cancelled
const statusFields = [
  "ordered",
  "verified",
  "accepted",
  "shipping",
  "ready_to_ship",
  "delivered",
  "cancelled",
];

const getStatus = (...fields) => {
  const data = fields[0];
  let status = false;

  for (let i = 1; i < fields.length; i++) {
    if (
      (data[fields[i]] && "read_receipt" in data[fields[i]]) ||
      (data[fields[i]] && "merchant_read_receipt" in data[fields[i]])
    ) {
      status = true;
      return status;
    }
  }

  return status;
};

export const getCategories = async () => {
  const response1 = await axios.get("/order/v2/category/1");
  const response2 = await axios.get("/order/v2/category/2");
  return [...response1.data.categories, ...response2.data.categories];
};

export const getLocations = async () => {
  const response = await axios.get("/order/v2/locationList");
  return response.data.locations;
};

export const getStores = async () => {
  const response = await axios.post("/order/v2/storelist", {});
  return response.data.data;
};

export const handleGetOrders = (
  body,
  setDataSource,
  setLoading,
  mapper,
  status,
  setTotal,
  setResponse,
  page,
  numEachPage
) => {
  const getOrders = getOrdersFn(status, page, numEachPage);
  setLoading(true);

  const getData = async () => {
    // let tempStatus = status;
    // if (status === 6) tempStatus = 7;
    // if (status === 7) tempStatus = 6;

    const requestTotal = axios.post("/order/v2/orders/c", {
      status: status,
      category_id: body.category_id || "All",
      location_name: body.location_name || "All",
      store_id: body.store_id,
      search_key: body.search_key,
      order_type: body.order_type,
      filter: body.filter,
      filter_date: body.filter_date,
    });

    const data = await axios.all([getOrders(body), requestTotal]);

    console.log(data[0].data.data);
    setResponse(data[0].data.data);
    setDataSource(mapper(data[0].data.data, page, numEachPage));
    setTotal && setTotal(data[1].data.count);
    setLoading(false);
  };

  try {
    getData();
  } catch (e) {
    setDataSource([]);
    setResponse([]);
    setLoading(false);
  }
};

export const getOrdersCount = async () => {
  let fetchArray = [];
  for (let i = 1; i <= 7; i++) {
    const request = axios.post("/order/v2/orders/c", {
      status: i,
      category_id: "All",
      location_name: "All",
      order_type: "All",
      filter: "All",
    });

    fetchArray.push(request);
  }

  const responses = await axios.all(fetchArray);
  const arr = responses.map((response) => response.data);
  [arr[arr.length - 1], arr[arr.length - 2]] = [
    arr[arr.length - 2],
    arr[arr.length - 1],
  ];

  return arr;
};

export const getOrdersFn = (status = 1, page = 1, numEachPage = 25) => {
  return async function ({
    category_id = "All",
    location_name = "All",
    store_id,
    search_key,
    order_type = "All",
    filter = "All",
    filter_date,
  }) {
    return axios.post(
      `/order/v2/orders/list?skip=${
        (page - 1) * numEachPage
      }&limit=${numEachPage}`,
      {
        status,
        category_id,
        location_name,
        store_id,
        search_key,
        order_type,
        filter,
        filter_date,
      }
    );
  };
};

export const getElapsedTime = (date2, date1, expectedTime) => {
  const diffTime = Math.abs(date2 - date1);
  const diffSeconds = Math.ceil(diffTime / 1000);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (expectedTime) {
    if (diffMinutes <= 60) return `${diffMinutes} mins`;

    if (diffHours <= 24) return `${diffHours} hours`;

    return diffHours % 24 !== 0
      ? `${diffDays} days, ${diffHours % 24} hours`
      : `${diffDays} days`;
  }

  if (diffHours <= 24)
    return new Date(diffSeconds * 1000).toISOString().substr(11, 8);

  return diffHours % 24 !== 0
    ? `${diffDays} days, ${diffHours % 24} hours`
    : `${diffDays} days`;
};

export const newOrdersDataMapper = (data, page, perPage) =>
  data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
      },
      index
    ) => ({
      sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
      support: getStatus(data[index], "ordered"),
      elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
      order_id,
      category,
      customer: customer.name,
      shop_name: store.display_name,
      distance: distance || 0,
      total_amount: total_amount.toFixed(2),
      payment_mode,
      ordered: new Date(ordered?.at).toDateString(),
      orderedTime: new Date(ordered?.at),
    })
  );

export const packagingOrdersDataMapper = (data, page, perPage) =>
  data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
      },
      index
    ) => ({
      sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
      support: getStatus(data[index], "accepted"),
      elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
      order_id,
      delivery_time: getElapsedTime(
        new Date(preferences.expected_time?.at),
        new Date(ordered?.at),
        true
      ),
      category,
      customer: customer.name,
      shop_name: store.display_name,
      distance: distance || 0,
      total_amount: total_amount.toFixed(2),
      payment_mode,
      ordered: new Date(ordered?.at).toDateString(),
      orderedTime: new Date(ordered?.at),
      expected_time: preferences.expected_time?.at,
    })
  );

export const dispatchedOrdersDataMapper = (data, page, perPage) =>
  data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
      },
      index
    ) => ({
      sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
      support: getStatus(data[index], "ready_to_ship"),
      elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
      order_id,
      delivery_time: getElapsedTime(
        new Date(preferences.expected_time?.at),
        new Date(ordered?.at),
        true
      ),
      category,
      customer: customer.name,
      shop_name: store.display_name,
      distance: distance || 0,
      total_amount: total_amount.toFixed(2),
      payment_mode,
      ordered: new Date(ordered?.at).toDateString(),
      orderedTime: new Date(ordered?.at),
      expected_time: preferences.expected_time?.at,
    })
  );

export const shippingOrdersDataMapper = (data, page, perPage) =>
  data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
      },
      index
    ) => ({
      sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
      support: getStatus(data[index], "shipping"),
      elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
      order_id,
      delivery_time: getElapsedTime(
        new Date(preferences.expected_time?.at),
        new Date(ordered?.at),
        true
      ),
      category,
      customer: customer.name,
      shop_name: store.display_name,
      distance: distance || 0,
      total_amount: total_amount.toFixed(2),
      payment_mode,
      ordered: new Date(ordered?.at).toDateString(),
      orderedTime: new Date(ordered?.at),
      expected_time: preferences.expected_time?.at,
    })
  );

export const deliveredOrdersDataMapper = (data, page, perPage) =>
  data.map(
    (
      {
        delivered,
        ordered,
        accepted,
        cancelled,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
      },
      index
    ) => ({
      sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
      support: getStatus(data[index], "delivered"),
      elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
      order_id,
      delivered_within: getElapsedTime(
        new Date(delivered?.at),
        new Date(ordered?.at)
      ),
      category,
      customer: customer.name,
      shop_name: store.display_name,
      distance: distance || 0,
      total_amount: total_amount.toFixed(2),
      payment_mode,
      delivered: new Date(delivered?.at).toDateString(),
      orderedTime: new Date(ordered?.at),
    })
  );

export const cancelledOrdersDataMapper = (data, page, perPage) => {
  return data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
        order_source,
      },
      index
    ) => {
      // 1 = iOS, 2 = Android and 3 = Desktop
      let source = "Desktop";

      if (order_source == 1) source = "IOS";
      if (order_source == 2) source = "Android";
      if (order_source == 3) source = "Desktop";

      return {
        sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
        support: getStatus(data[index], "cancelled"),
        elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
        order_id,
        category,
        customer: customer.name,
        shop_name: store.display_name,
        distance: distance || 0,
        total_amount: total_amount.toFixed(2),
        payment_mode,
        requested: new Date(ordered?.at).toDateString(),
        orderedTime: new Date(ordered?.at),
        promo_amount: 0,
        source,
      };
    }
  );
};

export const replacementOrdersDataMapper = (data, page, perPage) => {
  return data.map(
    (
      {
        ordered,
        accepted,
        cancelled,
        delivered,
        verified,
        shipping,
        ready_to_ship,
        order_id,
        category,
        customer,
        store,
        distance,
        total_amount,
        payment_mode,
        preferences,
        order_source,
      },
      index
    ) => {
      // 1 = iOS, 2 = Android and 3 = Desktop
      let source = "Desktop";

      if (order_source == 1) source = "IOS";
      if (order_source == 2) source = "Android";
      if (order_source == 3) source = "Desktop";

      return {
        sno: page === 1 || !page ? index + 1 : index + 1 + (page - 1) * perPage,
        support: getStatus(data[index], "verified"),
        elapsed_time: getElapsedTime(new Date(), new Date(ordered?.at)),
        order_id,
        category,
        customer: customer.name,
        shop_name: store.display_name,
        distance: distance || 0,
        total_amount: total_amount.toFixed(2),
        payment_mode,
        requested: new Date(ordered?.at).toDateString(),
        orderedTime: new Date(ordered?.at),
        promo_amount: 0,
        source,
      };
    }
  );
};
