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

const forgotPasswordPage = () => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm()
  const { enqueueSnackbar } = useSnackbar()

  const classes = useStyles()

  const submitHandler = async ({ email }) => {
    try {
      const { data } = await axios.post('/api/users/forgot-password', { email })
      reset({
        email: '',
      })
      enqueueSnackbar(data.message, { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Forgot your password?">
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography component="h1" variant="h1">
          Reset password
        </Typography>
        <List>
          <ListItem>
            <Typography variant="h2">
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
            <Button variant="contained" type="submit" fullWidth color="primary">
              Send password reset email
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

export default forgotPasswordPage
