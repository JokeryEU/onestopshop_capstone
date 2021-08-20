import {
  Button,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core'
import axios from 'axios'
import NextLink from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useContext, useEffect, useReducer } from 'react'
import Layout from '../components/Layout'
import { getError } from '../utils/error'
import { Store } from '../utils/store'
import useStyles from '../utils/styles'
import { format, parseISO } from 'date-fns'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_ORDERS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_ORDERS_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' }
    case 'FETCH_ORDERS_FAIL':
      return { ...state, loading: false, error: action.payload }

    default:
      return state
  }
}

const OrderHistoryPage = () => {
  const router = useRouter()
  const { state } = useContext(Store)
  const { userInfo } = state
  const classes = useStyles()

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    errors: '',
    order: [],
  })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_ORDERS_REQUEST' })
        const { data } = await axios.get('/api/order/history', {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_ORDERS_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_ORDERS_FAIL', payload: getError(error) })
      }
    }
    fetchOrders()
  }, [])

  return (
    <Layout title={'Order History'}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/profile" passHref>
                <ListItem button component="a">
                  <ListItemText primary="User Profile" />
                </ListItem>
              </NextLink>
              <NextLink href="/order-history" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Order History" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="1">
                  Order History
                </Typography>
              </ListItem>
              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
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
                            <TableCell>{order._id}</TableCell>
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

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default dynamic(() => Promise.resolve(OrderHistoryPage), { ssr: false })
