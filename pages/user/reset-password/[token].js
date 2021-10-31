import { Button, List, ListItem, TextField, Typography } from '@mui/material'
import Layout from '../../../components/Layout'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { getError } from '../../../utils/error'
import { useRouter } from 'next/router'
import Form from '../../../components/Form'

const ResetPasswordPage = ({ params }) => {
  const token = params.token
  const router = useRouter()
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar } = useSnackbar()

  const submitHandler = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      return enqueueSnackbar("Passwords don't match!", { variant: 'error' })
    }
    try {
      const { data } = await axios.put('/api/users/forgot-password', {
        resetPasswordToken: token,
        newPassword: password,
      })

      enqueueSnackbar(data.message, { variant: 'success' })
      router.replace('/login')
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Change your password">
      <Form onSubmit={handleSubmit(submitHandler)}>
        <Typography component="h1" variant="h1">
          New password
        </Typography>
        <List>
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
              Change password
            </Button>
          </ListItem>
        </List>
      </Form>
    </Layout>
  )
}

export function getServerSideProps({ req, params }) {
  if (!req.headers.cookie) {
    return {
      props: { params },
    }
  }
  const user = req.headers.cookie.includes('accessToken')

  if (!user) {
    return {
      props: { params },
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

export default ResetPasswordPage
