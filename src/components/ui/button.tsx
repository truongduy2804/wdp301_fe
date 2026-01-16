import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variantStyles = {
      default: "bg-emerald-600 text-white hover:bg-emerald-700",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    }

    return <button className={`${baseStyles} ${variantStyles[variant]} ${className}`} ref={ref} {...props} />
  }
)

Button.displayName = "Button"

export { Button }
export type { ButtonProps }
