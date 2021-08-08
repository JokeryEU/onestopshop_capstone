import axios from 'axios'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer } from 'react'
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@material-ui/core'
import { getError } from '../../utils/error'
import { Store } from '../../utils/store'
import Layout from '../../components/Layout'
import useStyles from '../../utils/styles'
import { useSnackbar } from 'notistack'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_PRODUCTS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_PRODUCTS_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' }
    case 'FETCH_PRODUCTS_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'CREATE_PRODUCT_REQUEST':
      return { ...state, loadingCreate: true }
    case 'CREATE_PRODUCT_SUCCESS':
      return { ...state, loadingCreate: false }
    case 'CREATE_PRODUCT_FAIL':
      return { ...state, loadingCreate: false }
    case 'DELETE_PRODUCT_REQUEST':
      return { ...state, loadingDelete: true }
    case 'DELETE_PRODUCT_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true }
    case 'DELETE_PRODUCT_FAIL':
      return { ...state, loadingDelete: false }
    case 'DELETE_PRODUCT_RESET':
      return { ...state, loadingDelete: false, successDelete: false }
    default:
      state
  }
}

const AdminProductsPage = () => {
  const { state } = useContext(Store)
  const router = useRouter()
  const classes = useStyles()
  const { userInfo } = state

  const [
    { loading, error, products, loadingCreate, successDelete, loadingDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    products: [],
    error: '',
  })

  useEffect(() => {
    if (!userInfo) return router.push('/login')

    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_PRODUCTS_REQUEST' })
        const { data } = await axios.get(`/api/admin/products`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: data })
      } catch (error) {
        dispatch({ type: 'FETCH_PRODUCTS_FAIL', payload: getError(error) })
      }
    }
    if (successDelete) {
      dispatch({ type: 'DELETE_PRODUCT_RESET' })
    } else {
      fetchData()
    }
  }, [successDelete])

  const { enqueueSnackbar } = useSnackbar()

  const createHandler = async () => {
    if (!window.confirm('Are you sure?')) {
      return
    }
    try {
      dispatch({ type: 'CREATE_PRODUCT_REQUEST' })
      const { data } = await axios.post(
        '/api/admin/product',
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      dispatch({ type: 'CREATE_PRODUCT_SUCCESS' })
      console.log(data)
      enqueueSnackbar('Product created successfully', { variant: 'success' })
      router.push(`/admin/product/${data._id}`)
    } catch (error) {
      dispatch({ type: 'CREATE_PRODUCT_FAIL' })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  const deleteHandler = async (productId) => {
    if (!window.confirm('Are you sure?')) {
      return
    }
    try {
      dispatch({ type: 'DELETE_PRODUCT_REQUEST' })
      await axios.delete(`/api/admin/product/${productId}`, {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      dispatch({ type: 'DELETE_PRODUCT_SUCCESS' })
      enqueueSnackbar('Product deleted', { variant: 'success' })
    } catch (error) {
      dispatch({ type: 'DELETE_PRODUCT_FAIL' })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title="Admin Products">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Products"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Grid container alignItems="center">
                  <Grid item xs={6}>
                    <Typography component="h1" variant="h1">
                      Products
                    </Typography>
                    {loadingDelete && <CircularProgress />}
                  </Grid>
                  <Grid align="right" item xs={6}>
                    <Button
                      onClick={createHandler}
                      color="primary"
                      variant="contained"
                    >
                      Create Product
                    </Button>
                    {loadingCreate && <CircularProgress />}
                  </Grid>
                </Grid>
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
                          <TableCell>PRICE</TableCell>
                          <TableCell>CATEGORY</TableCell>
                          <TableCell>COUNT</TableCell>
                          <TableCell>RATING</TableCell>
                          <TableCell>ACTIONS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              {product._id.substring(16, 24)}
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>€{product.price}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>{product.countInStock}</TableCell>
                            <TableCell>{product.rating}</TableCell>
                            <TableCell>
                              <NextLink
                                href={`/admin/product/${product._id}`}
                                passHref
                              >
                                <Button size="small" variant="contained">
                                  Edit
                                </Button>
                              </NextLink>{' '}
                              <Button
                                onClick={() => deleteHandler(product._id)}
                                size="small"
                                variant="contained"
                              >
                                Delete
                              </Button>
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

export default dynamic(() => Promise.resolve(AdminProductsPage), { ssr: false })
