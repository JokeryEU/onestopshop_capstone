import {
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
} from '@material-ui/core'
import { format, parseISO } from 'date-fns'
import { useContext, useEffect, useReducer } from 'react'
import Layout from '../../components/layout'
import { Store } from '../../utils/store'
import NextLink from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import useStyles from '../../utils/styles'
import { getError } from '../../utils/error'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'

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
    default:
      return state
  }
}

const OrderPage = ({ params }) => {
  const orderId = params.id
  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer()
  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { state } = useContext(Store)
  const { userInfo } = state

  const [{ loading, error, order, successPay }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
      order: {},
    }
  )
  const {
    shippingAddress,
    paymentMethod,
    orderItems,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isDelivered,
    deliveredAt,
    isPaid,
    paidAt,
  } = order

  useEffect(() => {
    if (!userInfo) return router.push('/login')

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

    if (!order._id || successPay || (order._id && order._id !== orderId)) {
      fetchOrder()
      if (successPay) {
        dispatch({ type: 'PAY_RESET' })
      }
    } else {
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
    }
  }, [order, successPay])

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
          { details },
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
    <Layout title={`Order ${orderId}`}>
      <Typography component="h1" variant="h1">
        Order {orderId}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography className={classes.error}>{error}</Typography>
      ) : (
        <Grid container spacing={1}>
          <Grid item md={9} xs={12}>
            <Card className={classes.section}>
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
            <Card className={classes.section}>
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
            <Card className={classes.section}>
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
                              <Typography>€{item.price}</Typography>
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
            <Card className={classes.section}>
              <List>
                <ListItem>
                  <Typography variant="h2">Order Summary</Typography>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Items:</Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">€{itemsPrice}</Typography>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Tax:</Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">€{taxPrice}</Typography>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>Shipping:</Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">€{shippingPrice}</Typography>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography>
                        <strong>Total:</strong>
                      </Typography>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">
                      <strong>€{totalPrice}</strong>
                    </Typography>
                  </Grid>
                </ListItem>
                {!isPaid && (
                  <ListItem>
                    {isPending ? (
                      <CircularProgress />
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
                )}
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Layout>
  )
}

export async function getServerSideProps({ params }) {
  return { props: { params } }
}

export default dynamic(() => Promise.resolve(OrderPage), { ssr: false })