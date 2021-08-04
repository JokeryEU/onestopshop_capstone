import { useRouter } from 'next/router'
import { useContext } from 'react'
import { Store } from '../utils/store'

const ShippingPage = () => {
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  if (!userInfo) {
    router.push('/login?redirect=/shipping')
  }
  return <div>Shipping</div>
}

export default ShippingPage
