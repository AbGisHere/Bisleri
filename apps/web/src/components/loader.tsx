import { LoadingIcon } from "./ui/loading-icon";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <LoadingIcon size={24} className="text-terracotta dark:text-foreground" />
    </div>
  );
}
