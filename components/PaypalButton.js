import { CircularProgress, ListItem, Box } from '@mui/material'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { useEffect } from 'react'
import { getError } from '../utils/error'
import classes from '../utils/classes'

const PaypalButton = ({ userInfo, order, dispatch }) => {
  const { enqueueSnackbar } = useSnackbar()

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer()

  useEffect(() => {
    const loadPaypalScript = async () => {
      const { data: clientId } = await axios.get('/api/keys/paypal', {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      paypalDispatch({
        type: 'resetOptions',
        value: {
          'client-id': clientId,
          currency: 'EUR',
        },
      })
      paypalDispatch({ type: 'setLoadingStatus', value: 'pending' })
    }
    loadPaypalScript()
  }, [userInfo, paypalDispatch])

  async function createOrder() {
    const { data } = await axios.get(
      `/api/order/${order._id}/create-paypal-order`,
      {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      }
    )
    return data.id
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' })
        const { data } = await axios.put(
          `/api/order/${order._id}/paypal`,
          details,
          {
            headers: { authorization: `Bearer ${userInfo.accessToken}` },
          }
        )
        dispatch({ type: 'PAY_SUCCESS', payload: data })
        enqueueSnackbar('Order is paid', { variant: 'success' })
      } catch (error) {
        dispatch({ type: 'PAY_FAIL', payload: getError(error) })
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    })
  }
  function onError(error) {
    enqueueSnackbar(getError(error), { variant: 'error' })
  }

  return (
    <ListItem>
      {isPending ? (
        <CircularProgress size={25} sx={classes.buttonProgress} />
      ) : (
        <Box sx={classes.fullWidth}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
          />
        </Box>
      )}
    </ListItem>
  )
}

export default PaypalButton
