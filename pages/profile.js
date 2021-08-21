import axios from 'axios'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import Cookies from 'js-cookie'
import { useContext, useEffect } from 'react'
import { Store } from '../utils/store'
import { useRouter } from 'next/router'
import useStyles from '../utils/styles'
import Layout from '../components/Layout'
import {
  Button,
  Card,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core'
import { getError } from '../utils/error'

const ProfilePage = () => {
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const router = useRouter()
  const classes = useStyles()

  useEffect(() => {
    setValue('firstName', userInfo.firstName)
    setValue('lastName', userInfo.lastName)
    setValue('email', userInfo.email)
    setValue('password', '')
    setValue('confirmPassword', '')
  }, [userInfo, setValue])
  const submitHandler = async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }) => {
    closeSnackbar()
    if (password !== confirmPassword) {
      return enqueueSnackbar("Passwords don't match", { variant: 'error' })
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          firstName,
          lastName,
          email,
          password,
        },
        { headers: { authorization: `Bearer ${userInfo.accessToken}` } }
      )
      if (!password) {
        dispatch({ type: 'USER_LOGIN', payload: data })
        Cookies.set('userInfo', JSON.stringify(data), { sameSite: 'lax' })
        enqueueSnackbar('Profile updated', { variant: 'success' })
      } else {
        dispatch({ type: 'USER_LOGOUT' })
        Cookies.remove('userInfo')
        Cookies.remove('shippingAddress')
        Cookies.remove('paymentMethod')
        router.push('/login')
        enqueueSnackbar('Password updated, please sign in again', {
          variant: 'success',
        })
      }
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Profile">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/profile" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="User Profile"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/order-history" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Order History"></ListItemText>
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
                  Profile
                </Typography>
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="firstName"
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
                            id="firstName"
                            label="First Name"
                            inputProps={{ type: 'text' }}
                            error={Boolean(errors.firstName)}
                            helperText={
                              errors.firstName
                                ? errors.firstName.type === 'minLength'
                                  ? 'First name must be at least 3 characters long'
                                  : 'First name is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="lastName"
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
                            id="lastName"
                            label="Last Name"
                            inputProps={{ type: 'text' }}
                            error={Boolean(errors.lastName)}
                            helperText={
                              errors.lastName
                                ? errors.lastName.type === 'minLength'
                                  ? 'Last name must be at least 3 characters long'
                                  : 'Last name is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          pattern:
                            // eslint-disable-next-line no-useless-escape
                            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="email"
                            label="Email"
                            inputProps={{ type: 'email' }}
                            error={Boolean(errors.email)}
                            helperText={
                              errors.email
                                ? errors.email.type === 'pattern'
                                  ? 'Email is not valid'
                                  : 'Email is required'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="password"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value === '' ||
                            value.length >= 8 ||
                            'Password must be at least 8 characters long',
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="password"
                            label="Password"
                            inputProps={{ type: 'password' }}
                            error={Boolean(errors.password)}
                            helperText={
                              errors.password
                                ? 'Password must be at least 8 characters long'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value === '' ||
                            value.length >= 8 ||
                            'Confirm Password must be at least 8 characters long',
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="confirmPassword"
                            label="Confirm Password"
                            inputProps={{ type: 'password' }}
                            error={Boolean(errors.confirmPassword)}
                            helperText={
                              errors.password
                                ? 'Confirm Password must be at least 8 characters long'
                                : ''
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
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

export default dynamic(() => Promise.resolve(ProfilePage), { ssr: false })
