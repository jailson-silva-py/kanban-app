export function FormSendCodeSkeleton() {

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <div className="h-5 w-32 bg-shadow opacity-20 rounded animate-pulse" />
        <div className="h-7 w-full bg-shadow opacity-20 rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 w-full bg-shadow opacity-20 rounded animate-pulse" />
        <div className="h-2.5 w-4/5 bg-shadow opacity-20 rounded animate-pulse" />
      </div>
      <div className="h-8 w-40 bg-shadow opacity-20 rounded animate-pulse" />
    </div>
  );
}
