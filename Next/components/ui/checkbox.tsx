import * as React from "react"

import { cn } from "@/lib/utils"

export type CheckboxProps = React.ComponentProps<"input">

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-input bg-background text-primary accent-[var(--app-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
