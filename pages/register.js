import {
  Button,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material'
import Layout from '../components/Layout'
import NextLink from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'
import Form from '../components/Form'

const RegisterPage = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { redirect } = router.query

  const submitHandler = async ({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  }) => {
    closeSnackbar()
    if (password !== confirmPassword) {
      return enqueueSnackbar("Passwords don't match!", { variant: 'error' })
    }
    try {
      const { data } = await axios.post('/api/users/register', {
        firstName,
        lastName,
        email,
        password,
      })
      enqueueSnackbar(data.message, { variant: 'success' })
      router.push(redirect || '/')
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Register">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Typography component="h1" variant="h1">
          Register
        </Typography>
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
                  label="First Name*"
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
                  label="Last Name*"
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
                // eslint-disable-next-line no-useless-escape
                pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="email"
                  label="Email*"
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
                  label="Password*"
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
            <Controller
              name="confirmPassword"
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
                  id="confirmPassword"
                  label="Confirm Password*"
                  inputProps={{ type: 'password' }}
                  error={Boolean(errors.confirmPassword)}
                  helperText={
                    errors.confirmPassword
                      ? errors.confirmPassword.type === 'minLength'
                        ? 'Confirm Password must be at least 8 characters long'
                        : 'Confirm Password is required'
                      : ''
                  }
                  {...field}
                />
              )}
            />
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Register
            </Button>
          </ListItem>
          <ListItem>
            Already have an account? &nbsp;
            <NextLink href={`/login?redirect=${redirect || '/'}`} passHref>
              <Link>Login</Link>
            </NextLink>
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

export default RegisterPage
