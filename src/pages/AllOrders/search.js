import React, { useEffect, useState } from "react";
import { Input } from "antd";

const Search = ({ onSearch, placeholder = "", field }) => {
  const [term, setTerm] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => {
      onSearch(term, field);
    }, 600);

    return () => clearTimeout(timerId);
  }, [onSearch, term]);

  const handleOnChange = (e) => {
    setTerm(e.target.value);
  };

  return (
    <Input
      placeholder={placeholder}
      type="text"
      value={term}
      onChange={handleOnChange}
    />
  );
};

export default Search;
