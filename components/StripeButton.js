import {
  Button,
  CircularProgress,
  ListItem,
  Typography,
} from '@material-ui/core'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getError } from '../utils/error'
import useStyles from '../utils/styles'

const StripeButton = ({ userInfo, order, dispatch }) => {
  const [loading, setLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    })
    if (!error) {
      const { id } = paymentMethod
      try {
        dispatch({ type: 'PAY_REQUEST' })
        const { data } = await axios.put(
          `/api/order/${order._id}/stripe`,
          { amount: order.totalPrice * 100, id },
          {
            headers: { authorization: `Bearer ${userInfo.accessToken}` },
          }
        )
        dispatch({ type: 'PAY_SUCCESS', payload: data })
        setLoading(false)
        enqueueSnackbar('Order is paid', { variant: 'success' })
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(error) })
        enqueueSnackbar(getError(err), { variant: 'error' })
      }
    } else {
      setLoading(false)
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const CARD_OPTIONS = {
    iconStyle: 'solid',
    style: {
      base: {
        iconColor: '#c4f0ff',
        color: '#4CAF50',
        fontWeight: 500,
        fontFamily: 'Roboto, Open Sans, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': { color: '#fce883' },
        '::placeholder': { color: '#87bbfd' },
      },
      invalid: {
        iconColor: '#ffc7ee',
        color: '#ffc7ee',
      },
    },
  }

  return (
    <ListItem>
      <div className={classes.fullWidth}>
        <Typography variant="h2" component="h2">
          Add your card info:
        </Typography>
        <form onSubmit={handleSubmit}>
          <CardElement options={CARD_OPTIONS} />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            disabled={loading}
            className={classes.buttonMargin}
          >
            Pay with Stripe €{order.totalPrice}
          </Button>
          {loading && (
            <CircularProgress size={25} className={classes.buttonProgress} />
          )}
        </form>
      </div>
    </ListItem>
  )
}

export default StripeButton
