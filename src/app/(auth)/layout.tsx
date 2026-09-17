
const AuthLayout = ({children}:{children:React.ReactNode}) => {
  return (
    <main className="min-h-svh bg-muted/30 px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-275 items-center justify-center sm:min-h-[calc(100svh-6rem)] lg:min-h-[calc(100svh-8rem)]">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-border bg-background shadow-2xl shadow-primary/10 lg:grid-cols-2">
         
          {children}
        </div>
      </div>
    </main>
  )
}

export default AuthLayout