import axios from 'axios'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer } from 'react'
import {
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  TextField,
  CircularProgress,
} from '@material-ui/core'
import { getError } from '../../../utils/error'
import { Store } from '../../../utils/store'
import Layout from '../../../components/Layout'
import useStyles from '../../../utils/styles'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import DateFnsUtils from '@date-io/date-fns'
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers'

function reducer(state, action) {
  switch (action.type) {
    case 'COUPON_DETAILS_REQUEST':
      return { ...state, loading: true }
    case 'COUPON_DETAILS_SUCCESS':
      return { ...state, loading: false, coupon: action.payload }
    case 'COUPON_DETAILS_FAIL':
      return { ...state, loading: false, error: action.payload }

    case 'COUPON_UPDATE_REQUEST':
      return { ...state, loadingUpdate: true }
    case 'COUPON_UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, successUpdate: true }
    case 'COUPON_UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload }

    default:
      return state
  }
}

const AdminCouponEditPage = ({ params }) => {
  const couponId = params.id
  const { state } = useContext(Store)
  const { userInfo } = state
  const [{ loading, error, coupon, loadingUpdate }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      error: '',
    }
  )
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const classes = useStyles()

  useEffect(() => {
    const fetchCoupon = async () => {
      dispatch({ type: 'COUPON_DETAILS_REQUEST' })
      try {
        const { data } = await axios.get(`/api/admin/coupon/${couponId}`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })

        dispatch({ type: 'COUPON_DETAILS_SUCCESS', payload: data })
        setValue('name', data.name)
        setValue('expiry', data.expiry)
        setValue('discount', data.discount)
      } catch (err) {
        dispatch({
          type: 'COUPON_DETAILS_FAIL',
          payload: getError(err),
        })
      }
    }

    fetchCoupon()
  }, [userInfo, couponId, setValue])

  const submitHandler = async ({ name, expiry, discount }) => {
    dispatch({ type: 'COUPON_UPDATE_REQUEST' })
    try {
      const { data } = await axios.put(
        `/api/admin/coupon/${coupon._id}`,
        { name, discount, expiry },
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'COUPON_UPDATE_SUCCESS', payload: data })
      enqueueSnackbar('Coupon updated', { variant: 'success' })
      router.push('/admin/coupons')
    } catch (error) {
      dispatch({ type: 'COUPON_UPDATE_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title={`Admin Edit Coupon ${couponId}`}>
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
                <ListItem selected button component="a">
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
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit Coupon {couponId}
                </Typography>
                &nbsp;&nbsp;&nbsp;
                {loading && <CircularProgress />}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>

              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          minLength: 6,
                          maxLength: 12,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            // helperText={
                            //   errors.name.type === 'minLength'
                            //     ? 'Name must be at least 6 characters long'
                            //     : errors.name.type === 'maxLength'
                            //     ? 'Name must be maximum 12 characters long'
                            //     : 'Name is required'
                            // }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="discount"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="discount"
                            label="Discount"
                            error={Boolean(errors.discount)}
                            helperText={
                              errors.discount ? 'Discount is required' : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="expiry"
                        control={control}
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DatePicker
                              autoOk
                              label="Expiry"
                              format="dd-MM-yyyy"
                              inputVariant="outlined"
                              disablePast
                              id="expiry"
                              error={Boolean(errors.expiry)}
                              helperText={
                                errors.expiry ? 'Expiry is required' : ''
                              }
                              {...field}
                            />
                          </MuiPickersUtilsProvider>
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                        disabled={loadingUpdate}
                      >
                        Update
                        {loadingUpdate && (
                          <CircularProgress
                            size={25}
                            className={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                    <ListItem>
                      <NextLink href="/admin/coupons" passHref>
                        <Button variant="contained" fullWidth>
                          Cancel
                        </Button>
                      </NextLink>
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export function getServerSideProps({ req, params }) {
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
      props: { params },
    }
  }
}

export default dynamic(() => Promise.resolve(AdminCouponEditPage), {
  ssr: false,
})
