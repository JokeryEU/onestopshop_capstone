import {
  Button,
  CircularProgress,
  ListItem,
  Typography,
  Box,
} from '@mui/material'
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { getError } from '../utils/error'
import classes from '../utils/classes'

const StripeButton = ({ userInfo, order, dispatch }) => {
  const [loading, setLoading] = useState(false)
  const stripe = useStripe()
  const elements = useElements()
  const { enqueueSnackbar } = useSnackbar()

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
          { amount: (order.netPrice * 100).toFixed(2), id },
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
      <Box sx={classes.fullWidth}>
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
            sx={classes.buttonMargin}
          >
            Pay with Stripe €{order.netPrice}
            {loading && (
              <CircularProgress size={25} sx={classes.buttonProgress} />
            )}
          </Button>
        </form>
      </Box>
    </ListItem>
  )
}

export default StripeButton
