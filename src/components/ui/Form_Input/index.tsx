import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import type { UseFormRegisterReturn } from "react-hook-form";

export interface InputProps {
  label: string;
  name: string;
  icon?: React.ElementType;
  type?: string;
  required?: boolean;
  error?: string;
  showErrorText?: boolean; // default true
  hideErrorText?: boolean; // default false

  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  register?: UseFormRegisterReturn;
  autoComplete?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const baseInput =
  "peer w-full border border-2 rounded-lg text-sm transition-all duration-200 " +
  "bg-white text-slate-800 placeholder-transparent " +
  "outline-none focus:outline-none focus-visible:outline-none focus-visible:outline-offset-0 " +
  "shadow-none focus:shadow-none focus-visible:shadow-none";

const okState =
  "border-slate-200 hover:border-slate-300 " +
  "focus:border-emerald-700 focus:ring-1 focus:ring-emerald-200/40 focus:ring-offset-0 " +
  "focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-200/40 focus-visible:ring-offset-0";

const errState =
  "border-red-400 hover:border-red-400 " +
  "focus:border-red-500 focus:ring-1 focus:ring-red-200/40 focus:ring-offset-0 " +
  "focus-visible:border-red-500 focus-visible:ring-1 focus-visible:ring-red-200/40 focus-visible:ring-offset-0";

const labelBase =
  "absolute pointer-events-none transition-all px-1 " +
  "top-1/2 -translate-y-1/2 text-sm text-slate-500 " +
  "peer-focus:top-0 peer-focus:-translate-y-2.5 peer-focus:text-xs peer-focus:text-emerald-700 " +
  "peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-2.5 peer-[&:not(:placeholder-shown)]:text-xs " +
  "bg-white peer-focus:bg-white peer-[&:not(:placeholder-shown)]:bg-white";

function shouldShowErrorText(
  error?: string,
  showErrorText?: boolean,
  hideErrorText?: boolean,
) {
  if (!error) return false;
  if (hideErrorText) return false;
  if (showErrorText === false) return false;
  return true;
}

export const CustomTextInput: React.FC<InputProps> = ({
  label,
  name,
  icon: Icon,
  type = "text",
  required = false,
  error,
  showErrorText = true,
  hideErrorText = false,
  value,
  onChange,
  register,
  autoComplete,
  inputProps,
}) => {
  const hasIcon = !!Icon;
  const showErr = shouldShowErrorText(error, showErrorText, hideErrorText);

  return (
    <div className="relative group">
      {hasIcon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}

      <input
        id={name}
        // @ts-ignore
        name={register ? register.name : name}
        type={type}
        required={required}
        placeholder=" "
        autoComplete={autoComplete}
        autoCapitalize="off"
        spellCheck={false}
        aria-invalid={!!error}
        //  Nếu có react-hook-form register => dùng register (uncontrolled)
        //  Nếu không => dùng value/onChange (controlled)
        {...(inputProps ?? {})}
        {...(register ?? {})}
        {...(!register ? { value, onChange } : {})}
        className={[
          baseInput,
          hasIcon ? "pl-10 pr-3 py-3" : "px-3 py-3",
          error ? errState : okState,
        ].join(" ")}
      />

      <label
        htmlFor={name}
        className={[
          labelBase,
          hasIcon ? "left-10" : "left-3",
          hasIcon
            ? "peer-focus:left-8 peer-[&:not(:placeholder-shown)]:left-8"
            : "peer-focus:left-2 peer-[&:not(:placeholder-shown)]:left-2",
          error ? "text-red-600 peer-focus:text-red-600" : "",
        ].join(" ")}
      >
        {label}
      </label>

      {showErr && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export const CustomPasswordInput: React.FC<InputProps> = ({
  label,
  name,
  icon: Icon,
  required = false,
  error,
  showErrorText = true,
  hideErrorText = false,
  value,
  onChange,
  register,
  autoComplete,
  inputProps,
}) => {
  const [show, setShow] = useState(false);
  const hasIcon = !!Icon;
  const showErr = shouldShowErrorText(error, showErrorText, hideErrorText);

  return (
    <div className="relative group">
      {hasIcon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
      )}

      <input
        id={name}
        // @ts-ignore
        name={register ? register.name : name}
        type={show ? "text" : "password"}
        required={required}
        placeholder=" "
        autoComplete={autoComplete}
        autoCapitalize="off"
        spellCheck={false}
        aria-invalid={!!error}
        {...(inputProps ?? {})}
        {...(register ?? {})}
        {...(!register ? { value, onChange } : {})}
        className={[
          baseInput,
          hasIcon ? "pl-10 pr-10 py-3" : "pl-3 pr-10 py-3",
          error ? errState : okState,
        ].join(" ")}
      />

      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        onMouseDown={(e) => e.preventDefault()}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 group-focus-within:text-emerald-600 transition-colors"
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        tabIndex={-1}
      >
        {show ? <FaEyeSlash /> : <FaEye />}
      </button>

      <label
        htmlFor={name}
        className={[
          labelBase,
          hasIcon ? "left-10" : "left-3",
          hasIcon
            ? "peer-focus:left-8 peer-[&:not(:placeholder-shown)]:left-8"
            : "peer-focus:left-2 peer-[&:not(:placeholder-shown)]:left-2",
          error ? "text-red-600 peer-focus:text-red-600" : "",
        ].join(" ")}
      >
        {label}
      </label>

      {showErr && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
};
