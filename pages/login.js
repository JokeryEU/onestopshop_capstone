import {
  Button,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import NextLink from 'next/link'
import axios from 'axios'
import { useContext, useEffect } from 'react'
import { Store } from '../utils/store'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'

const LoginPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { redirect } = router.query
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  useEffect(() => {
    if (userInfo) return router.push('/')
  }, [])
  const classes = useStyles()

  const submitHandler = async ({ email, password }) => {
    closeSnackbar()
    try {
      const { data } = await axios.post('/api/users/login', { email, password })

      dispatch({ type: 'USER_LOGIN', payload: data })
      Cookies.set('userInfo', JSON.stringify(data), { sameSite: 'lax' })
      Cookies.set('wishItems', JSON.stringify(data.wishlist), {
        sameSite: 'lax',
      })
      router.push(redirect || '/')
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Login">
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
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
            Don't have an account? &nbsp;
            <NextLink href={`/register?redirect=${redirect || '/'}`} passHref>
              <Link>Register</Link>
            </NextLink>
          </ListItem>
        </List>
      </form>
    </Layout>
  )
}

export default LoginPage
