import * as React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function DateInput({ value, onChange }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          label="BirthDate"
          value={value}
          onChange={(newValue) =>
            onChange({ target: { name: "dob", value: newValue } })
          }
          name="dob"
          sx={{ width: "100%" }}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}