
import Footer from '@/components/common/Footer'
import Header from '@/components/common/Header'

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="min-h-screen bg-[#f8faf9] text-[#17251f]">
      <div className="bg-[#133f35] px-4 py-2 text-center text-xs font-medium text-white/85">Bangladesh&apos;s trusted local business directory · List your business for free</div>
      <Header />

      {children}
      <Footer />

    </main>
  )
}

export default PublicLayout