import { useRouter } from 'next/router'

const ShippingPage = () => {
  const router = useRouter()
  router.push('/login')
  return <div></div>
}

export default ShippingPage
