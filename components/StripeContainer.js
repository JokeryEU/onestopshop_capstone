import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import StripeButton from './StripeButton'

const StripeContainer = ({ order, userInfo, dispatch }) => {
  const loadScriptPromise = loadStripe(process.env.STRIPE_KEY)

  return (
    <Elements stripe={loadScriptPromise}>
      <StripeButton order={order} userInfo={userInfo} dispatch={dispatch} />
    </Elements>
  )
}

export default StripeContainer
