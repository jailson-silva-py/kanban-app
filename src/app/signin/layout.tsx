export default function SignLayout({ children }: { children: React.ReactNode }) {
  return (
  <div className="flex justify-center items-center h-[calc(100vh-60px)] w-screen p-4 tracking-wider font-geist">
      <div className="p-8 flex items-center justify-center max-w-93.75 max-h-93.75 w-[90vw] shadow-default shadow-shadow rounded-sm">
        { children }
      </div>
  </div>
  )
}
