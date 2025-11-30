import { Button } from "@/components/ui/button";
import React from "react";

interface CustomButtonProps {
  type: "button" | "submit" | "reset";
  classes: string;
  state?: boolean;
  name: string;
  onClick?: () => void;
  disabled?: boolean; // ✅ new optional prop
  disabledColor?: string;
}

const CustomButton = ({
  type,
  classes,
  state,
  name,
  onClick,
  disabled = false, // default false
  disabledColor = "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300",
}: CustomButtonProps) => (
  <Button
    type={type}
    className={`
      hover:bg-primaryBG 
      ${classes}
      ${disabled || state ? disabledColor : ""}
    `}
    disabled={state || disabled} // ✅ Either loading or disabled manually
    onClick={onClick}
  >
    {state ? "Loading..." : name}
  </Button>
);

export default CustomButton;
