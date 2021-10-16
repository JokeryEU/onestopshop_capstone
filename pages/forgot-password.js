import {
  Button,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core'
import Layout from '../components/Layout'
import useStyles from '../utils/styles'
import axios from 'axios'
import { Controller, useForm } from 'react-hook-form'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'
import { useState } from 'react'

const ForgotPasswordPage = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar } = useSnackbar()
  const [success, setSuccess] = useState(false)

  const classes = useStyles()

  const submitHandler = async ({ email }) => {
    try {
      await axios.post('/api/users/forgot-password', { email })
      reset({
        email: '',
      })
      setSuccess(true)
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Forgot your password?">
      {success ? (
        <List className={classes.form}>
          <Typography component="h1" variant="h1">
            Reset password
          </Typography>
          <ListItem>
            <Typography variant="h2" align="justify">
              An email with password reset instructions was sent to your
              address. Click the link in the email to complete the process and
              setup a new password.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="h2" align="justify">
              If you don't see the email in your inbox, check other places it
              might be, like your junk, spam, or other folders.
            </Typography>
          </ListItem>
        </List>
      ) : (
        <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
          <Typography component="h1" variant="h1">
            Reset password
          </Typography>
          <List>
            <ListItem>
              <Typography variant="h2" align="justify">
                Enter your account email address and we will send you a password
                reset link.
              </Typography>
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
              <Button
                variant="contained"
                type="submit"
                fullWidth
                color="primary"
                disabled={success}
              >
                Send password reset email
              </Button>
            </ListItem>
          </List>
        </form>
      )}
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

export default ForgotPasswordPage
