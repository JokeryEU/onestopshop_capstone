import { CircularProgress, ListItem } from '@material-ui/core'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'
import useStyles from '../utils/styles'

const PaypalButton = ({
  userInfo,
  totalPrice,
  order,
  dispatch,
  isPending,
  PayPalButtons,
}) => {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: totalPrice },
          },
        ],
      })
      .then((orderID) => orderID)
  }
  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' })
        const { data } = await axios.put(
          `/api/order/${order._id}/pay`,
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
        <CircularProgress size={25} className={classes.buttonProgress} />
      ) : (
        <div className={classes.fullWidth}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
          />
        </div>
      )}
    </ListItem>
  )
}

export default PaypalButton
