import axios from 'axios'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useContext, useEffect, useReducer } from 'react'
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  CardContent,
  CardActions,
} from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { getError } from '../../utils/error'
import Layout from '../../components/Layout'
import classes from '../../utils/classes'
import { Store } from '../../utils/store'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUMMARY_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_SUMMARY_SUCCESS':
      return { ...state, loading: false, summary: action.payload, error: '' }
    case 'FETCH_SUMMARY_FAIL':
      return { ...state, loading: false, error: action.payload }
    default:
      state
  }
}

const AdminDashboardPage = () => {
  const { state } = useContext(Store)
  const { userInfo } = state

  const [{ loading, error, summary }, dispatch] = useReducer(reducer, {
    loading: true,
    summary: { salesData: [] },
    error: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_SUMMARY_REQUEST' })
        const { data } = await axios.get(`/api/admin/summary`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_SUMMARY_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_SUMMARY_FAIL', payload: getError(error) })
      }
    }
    fetchData()
  }, [userInfo])

  return (
    <Layout title="Admin Dashboard">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card sx={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
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
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography sx={classes.error}>{error}</Typography>
                ) : (
                  <Grid container spacing={5}>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1">
                            ???{summary.ordersPrice}
                          </Typography>
                          <Typography>Sales</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/orders" passHref>
                            <Button size="small" color="primary">
                              View sales
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1">
                            {summary.ordersCount}
                          </Typography>
                          <Typography>Orders</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/orders" passHref>
                            <Button size="small" color="primary">
                              View orders
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1">
                            {summary.productsCount}
                          </Typography>
                          <Typography>Products</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/products" passHref>
                            <Button size="small" color="primary">
                              View products
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                    <Grid item md={3}>
                      <Card raised>
                        <CardContent>
                          <Typography variant="h1">
                            {summary.usersCount}
                          </Typography>
                          <Typography>Users</Typography>
                        </CardContent>
                        <CardActions>
                          <NextLink href="/admin/users" passHref>
                            <Button size="small" color="primary">
                              View users
                            </Button>
                          </NextLink>
                        </CardActions>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </ListItem>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Sales Chart
                </Typography>
              </ListItem>
              <ListItem>
                <Bar
                  data={{
                    labels: summary.salesData.map((x) => x._id),
                    datasets: [
                      {
                        label: 'Sales',
                        backgroundColor: 'rgba(162, 222, 208, 1)',
                        data: summary.salesData.map((x) => x.totalSales),
                      },
                    ],
                  }}
                  options={{
                    legend: { display: true, position: 'right' },
                  }}
                />
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

export default dynamic(() => Promise.resolve(AdminDashboardPage), {
  ssr: false,
})
