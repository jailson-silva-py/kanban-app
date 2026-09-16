"use client";
export default function FormConfirmCodeSkeleton() {
  return (
    <div className="w-ful h-full flex flex-col gap-4 justify-center items-center">
      <p className="inline-block w-67.25 h-5 bg-shadow opacity-20 animate-pulse rounded-sm"></p>
      <label className="mt-4 flex flex-col gap-4 group">
        <span className="inline-block font-medium text-sm w-40 h-5 bg-shadow opacity-20 animate-pulse rounded-sm"></span>
        <div className="relative w-max h-max">
        <div className="flex gap-2 w-full h-full">
            <span className={`w-12 h-12  bg-shadow animate-pulse opacity-20 rounded-sm`}></span>
            <span className={`w-12 h-12  bg-shadow animate-pulse opacity-20 rounded-sm`}></span>
            <span className={`w-12 h-12  bg-shadow animate-pulse opacity-20 rounded-sm`}></span>
            <span className={`w-12 h-12  bg-shadow animate-pulse opacity-20 rounded-sm`}></span>
            <span className={`w-12 h-12  bg-shadow animate-pulse opacity-20 rounded-sm`}></span>
        </div>
        </div>
        <div className="mt-4 bg-shadow rounded-sm w-20 h-5 p-1 r ml-auto animate-pulse opacity-20">
        </div>
      </label>


      <button type="submit" className="btn-sm w-32 bg-shadow opacity-20 animate-pulse">
      </button>
    </div>
  )
}
