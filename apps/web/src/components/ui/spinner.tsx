import { cn } from "@/lib/utils"
import { LoadingIcon } from "./loading-icon"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LoadingIcon role="status" aria-label="Loading" className={cn("", className)} {...props} />
  )
}

export { Spinner }
