import { Box, Text } from "@saleor/macaw-ui/next";
import React from "react";
import { FieldError } from "react-hook-form";
import { input, label as labelStyles, wrapper } from "./Input.css";

export const Input: React.FC<
  {
    label: string;
    error: FieldError | undefined;
  } & React.HTMLProps<HTMLInputElement>
> = ({ label: labelText, error, ...props }) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <label className={wrapper}>
        <span className={labelStyles}>{labelText}</span>
        <input className={input} {...props} />
      </label>
      {error && <Text color="iconCriticalDefault">{error.message}</Text>}
    </Box>
  );
};
