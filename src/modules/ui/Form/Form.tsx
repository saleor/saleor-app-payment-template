import React, { FC } from "react";
import { form as formStyles } from "./Form.css";

interface FormProps {
  method: "get" | "post";
}

export const Form: FC<FormProps & React.HTMLProps<HTMLFormElement>> = (props) => {
  // this rule is checked by TS types
  // eslint-disable-next-line require-form-method/require-form-method
  return <form className={formStyles} {...props} />;
};
