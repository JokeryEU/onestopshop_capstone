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

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_PRODUCTS_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_PRODUCTS_SUCCESS':
      return { ...state, loading: false, products: action.payload, error: '' }
    case 'FETCH_PRODUCTS_FAIL':
      return { ...state, loading: false, error: action.payload }
    default:
      state
  }
}

const AdminProductsPage = () => {
  const { state } = useContext(Store)
  const router = useRouter()
  const classes = useStyles()
  const { userInfo } = state

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
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
    fetchData()
  }, [])
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
                <Typography component="h1" variant="h1">
                  Products
                </Typography>
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
                              <Button size="small" variant="contained">
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
