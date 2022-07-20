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
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Store } from '../utils/store'
import NextLink from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import classes from '../utils/classes'
import CheckoutWizard from '../components/CheckoutWizard'
import { getError } from '../utils/error'
import Cookies from 'js-cookie'

const PlaceOrderPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState('')
  const { state, dispatch } = useContext(Store)

  const {
    userInfo,
    cart: { cartItems, shippingAddress, paymentMethod },
    loadingCoupon,
    discount,
    couponName,
  } = state
  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100
  const itemsPrice = round2(
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  )
  const shippingPrice = itemsPrice >= 200 ? 0 : 15
  const taxPrice = round2(itemsPrice * 0.19)
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
  const discountPrice = round2((totalPrice * discount) / 100)
  const netPrice = round2(totalPrice - discountPrice)

  useEffect(() => {
    if (!paymentMethod) return router.push('/payment')
  }, [router, paymentMethod])

  const placeOrderHandler = async () => {
    closeSnackbar()
    try {
      setLoading(true)

      const { data } = await axios.post(
        '/api/order',
        {
          orderItems: cartItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          netPrice,
          discountPrice,
          usedCoupon: couponName,
        },
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'CART_CLEAR' })
      Cookies.remove('cartItems')
      setLoading(false)
      router.push(`/order/${data._id}`)
    } catch (error) {
      setLoading(false)
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  const applyCouponHandler = async () => {
    if (couponName === coupon.toUpperCase()) {
      return enqueueSnackbar('Coupon already applied', {
        variant: 'warning',
      })
    }
    if (couponName) {
      return enqueueSnackbar('Only 1 valid cupon per order is allowed', {
        variant: 'error',
      })
    }
    dispatch({ type: 'ORDER_APPLY_COUPON_REQUEST' })
    try {
      const { data } = await axios.get(
        '/api/order/coupon/' + coupon,

        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'ORDER_APPLY_COUPON_SUCCESS', payload: data })
      enqueueSnackbar(`Cupon ${coupon.toUpperCase()} applied successfully  `, {
        variant: 'success',
      })
    } catch (error) {
      dispatch({
        type: 'ORDER_APPLY_COUPON_FAIL',
        payload: getError(error),
      })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const removeCouponHandler = () => {
    dispatch({ type: 'ORDER_REMOVE_APPLIED_COUPON' })
  }

  return (
    <Layout title="Review Order">
      <CheckoutWizard activeStep={3} />
      <Typography component="h1" variant="h1">
        Review Order
      </Typography>
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
                {/* {shippingAddress?.location && (
                  <Link
                    variant="button"
                    target="_new"
                    href={`https://maps.google.com?q=${shippingAddress.location.lat},${shippingAddress.location.lng}`}
                  >
                    Show On Map
                  </Link>
                )} */}
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
                      {cartItems.map((item) => (
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
                    <Typography align="right">€{itemsPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Tax:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">€{taxPrice}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Shipping:</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography align="right">€{shippingPrice}</Typography>
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
                      <strong>€{totalPrice}</strong>
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
                      <strong>€{discountPrice}</strong>
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
                      <strong>€{netPrice}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <List>
                <ListItem>
                  <Typography>
                    {!couponName
                      ? 'Do you have coupon?'
                      : 'Want to use a different coupon?'}
                  </Typography>
                </ListItem>
                <ListItem>
                  {!couponName && (
                    <TextField
                      placeholder="Coupon Code"
                      id="coupon"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                    />
                  )}

                  <Button
                    variant="contained"
                    onClick={() =>
                      !couponName ? applyCouponHandler() : removeCouponHandler()
                    }
                    disabled={loadingCoupon}
                  >
                    {!couponName ? 'Apply' : 'Remove Coupon'}
                    {loadingCoupon && (
                      <CircularProgress size={25} sx={classes.buttonProgress} />
                    )}
                  </Button>
                </ListItem>
              </List>
              <ListItem>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={placeOrderHandler}
                  disabled={loading}
                >
                  Place Order
                  {loading && (
                    <CircularProgress size={25} sx={classes.buttonProgress} />
                  )}
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(PlaceOrderPage), { ssr: false })
