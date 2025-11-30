import { Input } from "@/components/ui/input"; // or your input path
import { Label } from "@/components/ui/label"; // or your label path
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface InvestmentFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  classes?: string;
}

export function InvestmentField({
  name,
  label,
  placeholder,
  type = "text",
  register,
  errors,
  classes = "",
}: InvestmentFieldProps) {
  const error = errors?.[name];

  return (
    <div className={`${classes}`}>
      <Label htmlFor={name}>{label}</Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        {...register(name)}
        className={`mt-1 ${error ? "border-red-500" : ""}`}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1">{(error as any).message}</p>
      )}
    </div>
  );
}
