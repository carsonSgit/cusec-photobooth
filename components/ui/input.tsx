import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					"flex h-12 w-full rounded-xl border-2 border-cusec-shore/30 bg-white px-4 py-3 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-cusec-dark/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cusec-navy focus-visible:ring-offset-2 focus-visible:border-cusec-navy disabled:cursor-not-allowed disabled:opacity-50 transition-all",
					className,
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
