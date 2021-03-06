import axios from 'axios'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer, useState } from 'react'
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
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { getError } from '../../../utils/error'
import { Store } from '../../../utils/store'
import Layout from '../../../components/Layout'
import classes from '../../../utils/classes'
import { Controller, useForm } from 'react-hook-form'
import Form from '../../../components/Form'
import { useSnackbar } from 'notistack'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' }
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' }
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload }
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' }
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      }
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload }

    default:
      return state
  }
}

const AdminUserEditPage = ({ params }) => {
  const userId = params.id
  const { state } = useContext(Store)
  const { userInfo } = state
  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const [role, setRole] = useState('')
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/admin/users/${userId}`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })

        dispatch({ type: 'FETCH_SUCCESS' })
        setValue('firstName', data.firstName)
        setValue('lastName', data.lastName)
        setValue('email', data.email)
        setRole(data.role)
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
      }
    }
    fetchData()
  }, [userInfo, userId, setValue])

  const submitHandler = async ({ firstName, lastName, email }) => {
    closeSnackbar()
    try {
      dispatch({ type: 'UPDATE_REQUEST' })
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          firstName,
          lastName,
          email,
          role,
        },
        { headers: { authorization: `Bearer ${userInfo.accessToken}` } }
      )
      dispatch({ type: 'UPDATE_SUCCESS' })
      enqueueSnackbar('User updated successfully', { variant: 'success' })
      router.push('/admin/users')
    } catch (error) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title={`Admin Edit User ${userId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card sx={classes.section}>
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
                  <ListItemText primary="Coupons" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Users" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card sx={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit User {userId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress></CircularProgress>}
                {error && <Typography sx={classes.error}>{error}</Typography>}
              </ListItem>
              <ListItem>
                <Form onSubmit={handleSubmit(submitHandler)}>
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
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Make Admin"
                        control={
                          <Checkbox
                            onChange={(e) =>
                              e.target.checked
                                ? setRole('Admin')
                                : setRole('User')
                            }
                            checked={role === 'Admin'}
                            name="role"
                          />
                        }
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
                            sx={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                    <ListItem>
                      <NextLink href="/admin/users" passHref>
                        <Button variant="contained" fullWidth>
                          Cancel
                        </Button>
                      </NextLink>
                    </ListItem>
                  </List>
                </Form>
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

export default dynamic(() => Promise.resolve(AdminUserEditPage), { ssr: false })
