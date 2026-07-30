import React from "react";
import s from "./Card.module.less";
import { Spin } from "antd";

function Card({
  style = {},
  title,
  amount,
  percent,
  currency,
  loading = false,
  footer,
  className,
}) {
  return (
    <div style={style} className={`${s.card} ${className}`}>
      {loading ? (
        <Spin />
      ) : (
        <>
          <h4 className="title">{title || "title"}</h4>
          <p className="amount">
            {currency ? "₹ " : null}
            {amount || 0}
          </p>
          {percent !== undefined && !footer && (
            <span className="percent">{`(${percent}%)`}</span>
          )}
          {footer && <span className="percent">{footer}</span>}
        </>
      )}
    </div>
  );
}

export default Card;
