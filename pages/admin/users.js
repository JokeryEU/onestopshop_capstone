import axios from 'axios'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer } from 'react'
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from '@material-ui/core'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import EditIcon from '@material-ui/icons/Edit'
import { getError } from '../../utils/error'
import { Store } from '../../utils/store'
import Layout from '../../components/Layout'
import useStyles from '../../utils/styles'
import { useSnackbar } from 'notistack'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_USERS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_USERS_SUCCESS':
      return { ...state, loading: false, users: action.payload, error: '' }
    case 'FETCH_USERS_FAIL':
      return { ...state, loading: false, error: action.payload }

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true }
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false }
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false }
    default:
      state
  }
}

const AdminUsersPage = () => {
  const { state } = useContext(Store)

  const classes = useStyles()
  const { userInfo } = state

  const [{ loading, error, users, successDelete, loadingDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      users: [],
      error: '',
    })

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_USERS_REQUEST' })
        const { data } = await axios.get(`/api/admin/users`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_USERS_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_USERS_FAIL', payload: getError(error) })
      }
    }
    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' })
    } else {
      fetchData()
    }
  }, [successDelete, userInfo])

  const { enqueueSnackbar } = useSnackbar()

  const deleteHandler = async (userId) => {
    if (!window.confirm('Are you sure to delete?')) {
      return
    }
    try {
      dispatch({ type: 'DELETE_REQUEST' })
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      dispatch({ type: 'DELETE_SUCCESS' })
      enqueueSnackbar('User deleted successfully', { variant: 'success' })
    } catch (error) {
      dispatch({ type: 'DELETE_FAIL' })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Admin Users">
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
              <NextLink href="/admin/users" passHref>
                <ListItem selected button component="a">
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
                  Users
                </Typography>
                {loadingDelete && <CircularProgress />}
              </ListItem>

              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>NAME</TableCell>
                          <TableCell>EMAIL</TableCell>
                          <TableCell>ROLE</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell>{user._id.substring(16, 24)}</TableCell>
                            <TableCell>
                              {user.firstName + ' ' + user.lastName}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role}</TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/user/${user._id}`}
                                passHref
                              >
                                <IconButton aria-label="edit">
                                  <EditIcon color="action" />
                                </IconButton>
                              </NextLink>{' '}
                              <IconButton
                                aria-label="delete"
                                onClick={() => deleteHandler(user._id)}
                              >
                                <DeleteForeverIcon color="error" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
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
      props: {},
    }
  }
}

export default dynamic(() => Promise.resolve(AdminUsersPage), { ssr: false })
