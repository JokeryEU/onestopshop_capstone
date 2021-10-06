import axios from 'axios'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer } from 'react'
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  InputBase,
} from '@material-ui/core'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import HighlightOffIcon from '@material-ui/icons/HighlightOff'
import SearchIcon from '@material-ui/icons/Search'
import { getError } from '../../../utils/error'
import { Store } from '../../../utils/store'
import Layout from '../../../components/Layout'
import useStyles from '../../../utils/styles'
import { useSnackbar } from 'notistack'
import { useRouter } from 'next/router'
import { format, parseISO } from 'date-fns'

function reducer(state, action) {
  switch (action.type) {
    case 'COUPON_LIST_REQUEST':
      return { ...state, loading: true }
    case 'COUPON_LIST_SUCCESS':
      return {
        ...state,
        loading: false,
        coupons: action.payload.coupons,
      }
    case 'COUPON_LIST_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'COUPON_CREATE_REQUEST':
      return { ...state, loadingCreate: true }
    case 'COUPON_CREATE_SUCCESS':
      return { ...state, loadingCreate: false }
    case 'COUPON_CREATE_FAIL':
      return { ...state, loadingCreate: false }
    case 'COUPON_DELETE_REQUEST':
      return { ...state, loadingDelete: true }
    case 'COUPON_DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'COUPON_DELETE_FAIL':
      return { ...state, loadingDelete: false, errorDelete: action.payload }
    case 'COUPON_DELETE_RESET':
      return {
        ...state,
        loadingDelete: false,
        successDelete: false,
        errorDelete: '',
      }
    default:
      return state
  }
}

const AdminCouponsPage = () => {
  const classes = useStyles()

  const [
    { loading, error, coupons, successDelete, loadingCreate, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    loadingDelete: false,
    successDelete: false,
    coupons: [],
    error: '',
  })
  const { state } = useContext(Store)
  const { userInfo } = state
  const router = useRouter()
  const { query = 'all' } = router.query

  useEffect(() => {
    if (successDelete) {
      dispatch({ type: 'COUPON_DELETE_RESET' })
    }
    const fetchCoupons = async () => {
      dispatch({ type: 'COUPON_LIST_REQUEST', payload: { query: '' } })
      try {
        const { data } = await axios.get(`/api/admin/coupon?query=${query}`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'COUPON_LIST_SUCCESS', payload: data })
      } catch (err) {
        dispatch({
          type: 'COUPON_LIST_FAIL',
          payload: getError(err),
        })
      }
    }

    fetchCoupons()
  }, [successDelete, userInfo, query])

  const { enqueueSnackbar } = useSnackbar()

  const deleteCouponHandler = async (couponId) => {
    if (!window.confirm('Are you sure to delete?')) {
      return
    }
    dispatch({ type: 'COUPON_DELETE_REQUEST' })
    try {
      const { data } = await axios.delete(`/api/admin/coupon/${couponId}`, {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      dispatch({ type: 'COUPON_DELETE_SUCCESS', payload: data })
      enqueueSnackbar('Coupon deleted', { variant: 'success' })
    } catch (error) {
      dispatch({
        type: 'COUPON_DELETE_FAIL',
        payload: getError(error),
      })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const createCouponHandler = async () => {
    dispatch({ type: 'COUPON_CREATE_REQUEST' })
    try {
      const { data } = await axios.post(
        `/api/admin/coupon`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )

      dispatch({ type: 'COUPON_CREATE_SUCCESS', payload: data })
      router.push(`/admin/coupons/${data._id}`)
    } catch (error) {
      dispatch({
        type: 'COUPON_CREATE_FAIL',
        payload: getError(error),
      })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  return (
    <Layout title="Admin Coupons">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
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
                  <ListItemText selected primary="Coupons" />
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
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Grid container alignItems="center">
                  <Grid item>
                    <Typography component="h1" variant="h1">
                      Coupons &nbsp;&nbsp;&nbsp;
                      {loadingDelete && <CircularProgress />}
                    </Typography>
                  </Grid>
                  <Grid item>
                    {coupons.length === 0 ? 'No' : coupons.length} Results:{' '}
                    {query !== 'all' && query !== '' && ' : ' + query}
                    {query !== 'all' && query !== '' ? (
                      <Button onClick={() => router.push('/admin/coupons')}>
                        <HighlightOffIcon />
                      </Button>
                    ) : null}
                  </Grid>
                  <Grid item>
                    <form action="/admin/coupons">
                      <SearchIcon />
                      <InputBase
                        placeholder="Search for Coupons here…"
                        name="query"
                        inputProps={{ 'aria-label': 'search' }}
                      />
                    </form>
                  </Grid>
                  <Grid item>
                    <Button
                      onClick={createCouponHandler}
                      color="primary"
                      variant="contained"
                      disabled={loadingCreate}
                    >
                      Create Coupon
                      {loadingCreate && (
                        <CircularProgress
                          size={25}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </Grid>
                </Grid>
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
                          <TableCell>NAME</TableCell>
                          <TableCell>DISCOUNT</TableCell>
                          <TableCell>CREATED</TableCell>
                          <TableCell>EXPIRY</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon._id}>
                            <TableCell>{coupon._id}</TableCell>
                            <TableCell>{coupon.name}</TableCell>
                            <TableCell>{coupon.discount}</TableCell>
                            <TableCell>
                              {format(parseISO(coupon.createdAt), 'dd-MM-yyyy')}
                            </TableCell>
                            <TableCell>
                              {format(parseISO(coupon.expiry), 'dd-MM-yyyy')}
                            </TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/coupons/${coupon._id}`}
                                passHref
                              >
                                <IconButton aria-label="edit">
                                  <EditIcon color="action" />
                                </IconButton>
                              </NextLink>{' '}
                              <IconButton
                                aria-label="delete"
                                onClick={() => deleteCouponHandler(coupon._id)}
                              >
                                <DeleteForeverIcon color="error" />
                              </IconButton>
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

export default dynamic(() => Promise.resolve(AdminCouponsPage), { ssr: false })
