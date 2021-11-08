import axios from 'axios'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import { getError } from '../../utils/error'
import Layout from '../../components/Layout'
import classes from '../../utils/classes'
import { format, parseISO } from 'date-fns'
import { useContext, useEffect, useReducer } from 'react'
import { Store } from '../../utils/store'
import { useSnackbar } from 'notistack'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_ORDERS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_ORDERS_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' }
    case 'FETCH_ORDERS_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'ORDER_DELETE_REQUEST':
      return { ...state, loadingDelete: true }
    case 'ORDER_DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'ORDER_DELETE_FAIL':
      return { ...state, loadingDelete: false, errorDelete: action.payload }
    case 'ORDER_DELETE_RESET':
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
        errorDelete: '',
      }
    default:
      state
  }
}

const AdminOrdersPage = () => {
  const { state } = useContext(Store)
  const { enqueueSnackbar } = useSnackbar()
  const { userInfo } = state

  const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      orders: [],
      error: '',
      loadingDelete: false,
      successDelete: false,
    })

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: 'ORDER_DELETE_RESET' })
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_ORDERS_REQUEST' })
        const { data } = await axios.get(`/api/admin/orders`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_ORDERS_FAIL', payload: getError(error) })
      }
    }
    fetchData()
  }, [successDelete, userInfo])

  const deleteOrderHandler = async (order) => {
    if (!window.confirm('Are you sure to delete?')) {
      return
    }
    dispatch({ type: 'ORDER_DELETE_REQUEST' })
    try {
      const { data } = await axios.delete(`/api/order/${order._id}`, {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      dispatch({ type: 'ORDER_DELETE_SUCCESS', payload: data })
    } catch (error) {
      dispatch({ type: 'ORDER_DELETE_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  return (
    <Layout title="Admin Order History">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card sx={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Orders" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Products" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/coupons" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Coupons" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Users" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card sx={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Orders
                </Typography>
              </ListItem>

              <ListItem>
                {loading ? (
                  <CircularProgress size={52} />
                ) : error ? (
                  <Typography sx={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>USER</TableCell>
                          <TableCell>DATE</TableCell>
                          <TableCell>TOTAL</TableCell>
                          <TableCell>PAID</TableCell>
                          <TableCell>DELIVERED</TableCell>
                          <TableCell>ACTION</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order._id.substring(16, 24)}</TableCell>
                            <TableCell>
                              {order.user
                                ? order.user.firstName +
                                  ' ' +
                                  order.user.lastName
                                : 'DELETED USER'}
                            </TableCell>
                            <TableCell>
                              {format(parseISO(order.createdAt), 'dd-MM-yyyy')}
                            </TableCell>
                            <TableCell>€{order.totalPrice}</TableCell>
                            <TableCell>
                              {order.isPaid
                                ? `Paid at ${format(
                                    parseISO(order.paidAt),
                                    'dd-MM-yyyy'
                                  )}`
                                : 'Not paid'}
                            </TableCell>
                            <TableCell>
                              {order.isDelivered
                                ? `Delivered at ${format(
                                    parseISO(order.deliveredAt),
                                    'dd-MM-yyyy'
                                  )}`
                                : 'Not delivered'}
                            </TableCell>
                            <TableCell>
                              <NextLink href={`/order/${order._id}`} passHref>
                                <Button variant="contained">Details</Button>
                              </NextLink>
                              <Button
                                onClick={() => deleteOrderHandler(order)}
                                disabled={loadingDelete || order.isPaid}
                              >
                                <DeleteForeverIcon
                                  color={order.isPaid ? 'disabled' : 'error'}
                                />
                                {loadingDelete && (
                                  <CircularProgress
                                    size={25}
                                    sx={classes.buttonProgress}
                                  />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export function getServerSideProps({ req }) {
  if (!req.headers.cookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  const user = req.headers.cookie.includes('accessToken')
  const role = req.headers.cookie.includes('Admin')

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else if (!role) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default dynamic(() => Promise.resolve(AdminOrdersPage), { ssr: false })
