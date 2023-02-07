import React from "react";
import { input, label as labelStyles, wrapper } from "./Input.css";

export const Input: React.FC<
  {
    label: string;
  } & React.HTMLProps<HTMLInputElement>
> = ({ label: labelText, ...props }) => {
  return (
    <label className={wrapper}>
      <span className={labelStyles}>{labelText}</span>
      <input className={input} {...props} />
    </label>
  );
};
