import {
  Button,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import { useContext, useEffect } from 'react'
import { Store } from '../utils/store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Controller, useForm } from 'react-hook-form'
import CheckoutWizard from '../components/CheckoutWizard'

const ShippingPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)

  const {
    cart: { shippingAddress },
  } = state
  const { location } = shippingAddress
  useEffect(() => {
    setValue('fullName', shippingAddress.fullName)
    setValue('address', shippingAddress.address)
    setValue('city', shippingAddress.city)
    setValue('country', shippingAddress.country)
    setValue('postalCode', shippingAddress.postalCode)
    setValue('phoneNumber', shippingAddress.phoneNumber)
  }, [setValue, shippingAddress])

  const classes = useStyles()

  const submitHandler = ({
    fullName,
    address,
    city,
    country,
    postalCode,
    phoneNumber,
  }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        country,
        postalCode,
        phoneNumber,
        location,
      },
    })
    Cookies.set(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        country,
        postalCode,
        phoneNumber,
        location,
      }),
      { sameSite: 'lax' }
    )
    router.push('/payment')
  }

  const chooseLocationHandler = () => {
    const fullName = getValues('fullName')
    const address = getValues('address')
    const city = getValues('city')
    const postalCode = getValues('postalCode')
    const country = getValues('country')
    const phoneNumber = getValues('phoneNumber')
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        postalCode,
        country,
        phoneNumber,
        location,
      },
    })
    Cookies.set(
      'shippingAddress',
      JSON.stringify({
        fullName,
        address,
        city,
        postalCode,
        country,
        phoneNumber,
        location,
      }),
      { sameSite: 'lax' }
    )
    router.push('/map')
  }

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography component="h1" variant="h1">
          Shipping Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullName"
                  label="Full Name*"
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === 'minLength'
                        ? 'Full Name must be at least 3 characters long'
                        : 'Full Name is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="Address*"
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === 'minLength'
                        ? 'Address must be at least 3 characters long'
                        : 'Address is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="City*"
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === 'minLength'
                        ? 'City be at least 3 characters long'
                        : 'City is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="country"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="country"
                  label="Country*"
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country
                      ? errors.country.type === 'minLength'
                        ? 'Country must be at least 3 characters long'
                        : 'Country is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="postalCode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 3,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="postalCode"
                  label="Postal Code*"
                  error={Boolean(errors.postalCode)}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === 'minLength'
                        ? 'Postal Code must be at least 3 characters long'
                        : 'Postal Code is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="phoneNumber"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 6,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number*"
                  error={Boolean(errors.phoneNumber)}
                  helperText={
                    errors.phoneNumber
                      ? errors.phoneNumber.type === 'minLength'
                        ? 'Phone Number must be at least 6 characters long'
                        : 'Phone Number is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button
              variant="contained"
              type="button"
              onClick={chooseLocationHandler}
            >
              Choose on map
            </Button>
            <Typography>
              {location?.lat && `${location.lat}, ${location.lng}`}
            </Typography>
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Continue
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  )
}

export function getServerSideProps({ req }) {
  if (!req.headers.cookie) {
    return {
      redirect: {
        destination: '/login?redirect=/shipping',
        permanent: false,
      },
    }
  }
  const user = req.headers.cookie.includes('accessToken')

  if (!user) {
    return {
      redirect: {
        destination: '/login?redirect=/shipping',
        permanent: false,
      },
    }
  } else {
    return {
      props: {},
    }
  }
}

export default ShippingPage
