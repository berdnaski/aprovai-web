import { cn } from "@/lib/utils"

export function ApprovalMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={cn("size-4", className)}
      aria-hidden
    >
      <path
        d="M3 8.6L6.4 12L13 3.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}
