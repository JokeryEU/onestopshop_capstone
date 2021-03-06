import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { format, parseISO } from 'date-fns'
import { useContext, useEffect, useReducer } from 'react'
import Layout from '../../components/Layout'
import { Store } from '../../utils/store'
import NextLink from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import classes from '../../utils/classes'
import { getError } from '../../utils/error'
import PaypalButton from '../../components/PaypalButton'
import StripeContainer from '../../components/StripeContainer'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_ORDER_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_ORDER_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' }
    case 'FETCH_ORDER_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true }
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true }
    case 'PAY_FAIL':
      return { ...state, loadingPay: false, errorPay: action.payload }
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false, errorPay: '' }
    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true }
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true }
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false, errorDeliver: action.payload }
    case 'DELIVER_RESET':
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
        errorDeliver: '',
      }
    case 'ORDER_CANCEL_REQUEST':
      return { ...state, loadingCancel: true }
    case 'ORDER_CANCEL_SUCCESS':
      return { ...state, loadingCancel: false, successCancel: true }
    case 'ORDER_CANCEL_FAIL':
      return { ...state, loadingCancel: false, errorCancel: action.payload }
    case 'ORDER_CANCEL_RESET':
      return {
        ...state,
        loadingCancel: false,
        successCancel: false,
        errorCancel: '',
      }
    case 'ORDER_REFUND_REQUEST':
      return { ...state, loadingRefund: true }
    case 'ORDER_REFUND_SUCCESS':
      return { ...state, loadingRefund: false, successRefund: true }
    case 'ORDER_REFUND_FAIL':
      return { ...state, loadingRefund: false, errorRefund: action.payload }
    case 'ORDER_REFUND_RESET':
      return {
        ...state,
        loadingRefund: false,
        successRefund: false,
        errorRefund: '',
      }
    default:
      return state
  }
}

const OrderPage = ({ params, query }) => {
  const orderId = params.id
  const queryResult = query.result

  const { enqueueSnackbar } = useSnackbar()
  const { state } = useContext(Store)
  const { userInfo } = state

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingCancel,
      successCancel,
      loadingDeliver,
      successDeliver,
      loadingRefund,
      successRefund,
    },
    dispatch,
  ] = useReducer(reducer, {
    successPay: false,
    loadingPay: false,
    loading: true,
    loadingDeliver: false,
    successDeliver: false,
    loadingCancel: false,
    successCancel: false,
    loadingRefund: false,
    successRefund: false,
    order: {},
    error: '',
  })
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    discountPrice,
    netPrice,
    isDelivered,
    deliveredAt,
    isPaid,
    paidAt,
  } = order

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_ORDER_REQUEST' })
        const { data } = await axios.get(`/api/order/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_ORDER_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_ORDER_FAIL', payload: getError(error) })
      }
    }

    const verifyStripePayment = async () => {
      try {
        dispatch({ type: 'PAY_REQUEST' })
        const { data } = await axios.put(
          `/api/order/${order._id}/stripe`,
          {},
          {
            headers: { authorization: `Bearer ${userInfo.accessToken}` },
          }
        )
        dispatch({ type: 'PAY_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'PAY_FAIL', payload: getError(error) })
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
    if (
      !order.isPaid &&
      paymentMethod === 'Stripe' &&
      queryResult === 'success'
    ) {
      verifyStripePayment()
    }

    if (
      !order._id ||
      successPay ||
      successCancel ||
      successDeliver ||
      successRefund ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder()

      if (successPay) dispatch({ type: 'PAY_RESET' })
      if (successDeliver) dispatch({ type: 'DELIVER_RESET' })
      if (successCancel) dispatch({ type: 'ORDER_CANCEL_RESET' })
      if (successRefund) dispatch({ type: 'ORDER_REFUND_RESET' })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    order,
    queryResult,
    successPay,
    successDeliver,
    successCancel,
    successRefund,
    userInfo,
    orderId,
  ])

  const handleCancelOrder = async () => {
    dispatch({ type: 'ORDER_CANCEL_REQUEST', payload: {} })
    try {
      const { data } = await axios.put(
        `/api/order/${order._id}/cancel`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'ORDER_CANCEL_SUCCESS', payload: data })
      enqueueSnackbar('Order cancelled', { variant: 'success' })
    } catch (error) {
      dispatch({
        type: 'ORDER_CANCEL_FAIL',
        payload: getError(error),
      })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const handleSuccessCashPayment = async () => {
    dispatch({ type: 'PAY_REQUEST' })
    try {
      const { data } = await axios.put(
        `/api/order/${order._id}/cashpay`,
        {
          id: '',
          status: 'Paid by Cash',
          update_time: '',
          email_address: `${userInfo.email}`,
        },
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'PAY_SUCCESS', payload: data })
      enqueueSnackbar('Order marked as paid', { variant: 'success' })
    } catch (error) {
      dispatch({ type: 'PAY_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const deliverOrderHandler = async () => {
    try {
      dispatch({ type: 'DELIVER_REQUEST' })
      const { data } = await axios.put(
        `/api/order/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'DELIVER_SUCCESS', payload: data })
      enqueueSnackbar('Order is delivered', { variant: 'success' })
    } catch (err) {
      dispatch({ type: 'DELIVER_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const refundOrderHandler = async (order) => {
    dispatch({ type: 'ORDER_REFUND_REQUEST', payload: {} })
    try {
      const { data } = await axios.put(
        `/api/order/${order._id}/refund`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'ORDER_REFUND_SUCCESS', payload: data })
      enqueueSnackbar('Order has been refunded', { variant: 'success' })
    } catch (error) {
      dispatch({
        type: 'ORDER_REFUND_FAIL',
        payload: getError(error),
      })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  return (
    <Layout title={`Order ${orderId}`}>
      <Typography component="h1" variant="h1">
        Order {orderId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography sx={classes.error}>{error}</Typography>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <Card sx={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Shipping Address
                  </Typography>
                </ListItem>
                <ListItem>
                  {shippingAddress.fullName}, {shippingAddress.address},{' '}
                  {shippingAddress.city}, {shippingAddress.postalCode},{' '}
                  {shippingAddress.country}, {shippingAddress.phoneNumber}
                  &nbsp;
                  {shippingAddress?.location && (
                    <Link
                      variant="button"
                      target="_new"
                      href={`https://maps.google.com?q=${shippingAddress.location.lat},${shippingAddress.location.lng}`}
                    >
                      Show On Map
                    </Link>
                  )}
                </ListItem>
                <ListItem>
                  <strong>
                    Status:{' '}
                    {isDelivered
                      ? `Delivered at ${format(
                          parseISO(deliveredAt),
                          'dd-MMM-yyyy | HH:mm'
                        )}`
                      : 'Not delivered'}
                  </strong>
                </ListItem>
              </List>
            </Card>
            <Card sx={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Payment Method
                  </Typography>
                </ListItem>
                <ListItem>{paymentMethod}</ListItem>
                <ListItem>
                  <strong>
                    Status:{' '}
                    {isPaid
                      ? `Paid at ${format(
                          parseISO(paidAt),
                          'dd-MMM-yyyy | HH:mm'
                        )}`
                      : 'Not paid'}
                  </strong>
                </ListItem>
              </List>
            </Card>
            <Card sx={classes.section}>
              <List>
                <ListItem>
                  <Typography component="h2" variant="h2">
                    Order Items
                  </Typography>
                </ListItem>
                <ListItem>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Image</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orderItems.map((item) => (
                          <TableRow key={item._id}>
                            <TableCell>
                              <NextLink href={`/product/${item.slug}`} passHref>
                                <Link>
                                  <Image
                                    src={item.image[0]}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                  />
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell>
                              <NextLink href={`/product/${item.slug}`} passHref>
                                <Link>
                                  <Typography>{item.name}</Typography>
                                </Link>
                              </NextLink>
                            </TableCell>
                            <TableCell align="right">
                              <Typography>{item.quantity}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography>???{item.price}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </ListItem>
              </List>
            </Card>
          </Grid>
          <Grid item md={3} xs={12}>
            <Card sx={classes.section}>
              <List>
                <ListItem>
                  <Typography variant="h2">Order Summary</Typography>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Items:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">???{itemsPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">???{taxPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Shipping:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">???{shippingPrice}</Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">
                        <strong>???{totalPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Discount:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">
                        <strong>???{discountPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Net Price:</strong>
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="right">
                        <strong>???{netPrice}</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                {!isPaid &&
                  paymentMethod === 'PayPal' &&
                  !order.isCancelled && (
                    <PaypalButton
                      userInfo={userInfo}
                      order={order}
                      dispatch={dispatch}
                    />
                  )}
                {!isPaid &&
                  paymentMethod === 'Stripe' &&
                  !order.isCancelled && (
                    <StripeContainer userInfo={userInfo} order={order} />
                  )}
                {userInfo.role === 'Admin' &&
                  !order.isPaid &&
                  order.paymentMethod === 'Cash' && (
                    <ListItem>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleSuccessCashPayment()}
                        disabled={loadingPay}
                      >
                        Confirm Payment
                        {loadingPay && (
                          <CircularProgress
                            size={25}
                            sx={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                  )}
                {!order.isPaid && order.paymentMethod === 'Cash' && (
                  <ListItem>
                    <Typography variant="h2">
                      Your Order is completed. Please wait until shipment and
                      provide cash at the delivery.
                    </Typography>
                  </ListItem>
                )}
                {!order.isDelivered && !order.isCancelled && (
                  <ListItem>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handleCancelOrder}
                      disabled={loadingCancel}
                    >
                      Cancel Order
                      {loadingCancel && (
                        <CircularProgress
                          size={25}
                          sx={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </ListItem>
                )}
                {userInfo.role === 'Admin' &&
                  !order.isRefunded &&
                  order.isPaid && (
                    <ListItem>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => refundOrderHandler(order)}
                        disabled={loadingRefund}
                      >
                        Refund Order
                        {loadingRefund && (
                          <CircularProgress
                            size={25}
                            sx={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                  )}
                {userInfo.role === 'Admin' &&
                  order.isPaid &&
                  !order.isCancelled &&
                  !order.isDelivered && (
                    <ListItem>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={deliverOrderHandler}
                        disabled={loadingDeliver}
                      >
                        Deliver Order
                        {loadingDeliver && (
                          <CircularProgress
                            size={25}
                            sx={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                  )}

                <ListItem>
                  <NextLink href="/" passHref>
                    <Button fullWidth variant="outlined" color="inherit">
                      Back to Products
                    </Button>
                  </NextLink>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  )
}

export function getServerSideProps({ req, params, query }) {
  if (!req.headers.cookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  const user = req.headers.cookie.includes('accessToken')

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else {
    return {
      props: { params, query },
    }
  }
}

export default dynamic(() => Promise.resolve(OrderPage), { ssr: false })
