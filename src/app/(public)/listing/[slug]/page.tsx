import type { Metadata } from 'next'
import ListingDetails from './ListingDetails'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  await params
  return {
    title: 'The Green Leaf Kitchen — Restaurant in Dhanmondi, Dhaka | directory.',
    description: 'The Green Leaf Kitchen in Dhanmondi, Dhaka. View services, opening hours, reviews, contact details, location, and reservation information.',
    keywords: ['The Green Leaf Kitchen', 'restaurant in Dhanmondi', 'restaurants in Dhaka', 'Dhanmondi restaurants'],
    alternates: { canonical: '/listing/the-green-leaf-kitchen-dhanmondi' },
    openGraph: {
      title: 'The Green Leaf Kitchen — Restaurant in Dhanmondi, Dhaka',
      description: 'Discover menu services, hours, reviews, contact details, and more.',
      type: 'website',
    },
  }
}

export default function Page() {
  return <ListingDetails />
}
