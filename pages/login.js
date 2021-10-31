import {
  Button,
  Grid,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material'
import Layout from '../components/Layout'
import NextLink from 'next/link'
import axios from 'axios'
import { useContext } from 'react'
import { Store } from '../utils/store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'
import Form from '../components/Form'

const LoginPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { redirect } = router.query
  const { dispatch } = useContext(Store)

  const submitHandler = async ({ email, password }) => {
    closeSnackbar()
    try {
      const { data } = await axios.post('/api/users/login', {
        email,
        password,
      })

      dispatch({ type: 'USER_LOGIN', payload: data })
      Cookies.set('userInfo', JSON.stringify(data), { sameSite: 'lax' })
      dispatch({ type: 'WISH_ADD_ITEM', payload: data.wishlist })

      router.push(redirect || '/')
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  return (
    <Layout title="Login">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Typography component="h1" variant="h1">
          Login
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                // eslint-disable-next-line no-useless-escape
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
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
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 8,
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
                      ? errors.password.type === 'minLength'
                        ? 'Password must be at least 8 characters long'
                        : 'Password is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Login
            </Button>
          </ListItem>
          <ListItem>
            <Grid container>
              <Grid item xs={6}>
                Don&apos;t have an account? &nbsp;
                <NextLink
                  href={`/register?redirect=${redirect || '/'}`}
                  passHref
                >
                  <Link>Register</Link>
                </NextLink>
              </Grid>
              <Grid item xs={6} align="right">
                Forgot Password? &nbsp;
                <NextLink href={`/forgot-password`} passHref>
                  <Link>Click here</Link>
                </NextLink>
              </Grid>
            </Grid>
          </ListItem>
        </List>
      </Form>
    </Layout>
  )
}

export function getServerSideProps({ req }) {
  if (!req.headers.cookie) {
    return {
      props: {},
    }
  }
  const user = req.headers.cookie.includes('accessToken')

  if (!user) {
    return {
      props: {},
    }
  } else {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
}

export default LoginPage
