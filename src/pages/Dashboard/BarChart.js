import { Column } from "@ant-design/charts";
import React from "react";

export default function BarChart({ data }) {
  let maximum = 0;
  if (data.length) {
    for (let i = 0; i < data.length; i++) {
      if (data[i]["Total Orders"] > maximum) {
        maximum = data[i]["Total Orders"];
      }
    }
  }

  const config = {
    xField: "index",
    yField: "Total Orders",
    tooltip: {
      showTitle: false,
      fields: ["Total Orders", "Total Payment", "Date"],
    },
    label: {
      position: "top - 10px",
      style: {
        fill: "black",
        opacity: 0.6,
        zIndex: 100,
      },
    },
    yAxis: {
      max: maximum * 2,
    },
    xAxis: {
      label: {
        autoRotate: false,
        style: {
          opacity: 0,
        },
      },
    },
  };

  return data.length ? <Column data={data} {...config} /> : null;
}
