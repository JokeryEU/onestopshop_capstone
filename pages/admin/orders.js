import axios from 'axios'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
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
} from '@material-ui/core'
import { getError } from '../../utils/error'
import Layout from '../../components/Layout'
import useStyles from '../../utils/styles'
import { format, parseISO } from 'date-fns'
import { useContext, useEffect, useReducer } from 'react'
import { Store } from '../../utils/store'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_ORDERS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_ORDERS_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' }
    case 'FETCH_ORDERS_FAIL':
      return { ...state, loading: false, error: action.payload }
    default:
      state
  }
}

const AdminOrdersPage = () => {
  const { state } = useContext(Store)
  const router = useRouter()
  const classes = useStyles()
  const { userInfo } = state

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  })

  useEffect(() => {
    if (!userInfo) return router.push('/login')

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
  }, [])
  return (
    <Layout title="Admin Orders">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Orders
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
                            <TableCell>{order._id}</TableCell>
                            <TableCell>
                              {order.user ? order.user.name : 'DELETED USER'}
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

export default dynamic(() => Promise.resolve(AdminOrdersPage), { ssr: false })
