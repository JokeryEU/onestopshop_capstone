import { useContext } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import {
  Button,
  Card,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from '@material-ui/core'
import Layout from '../../components/layout'
import useStyles from '../../utils/styles'
import Product from '../../models/Product'
import db from '../../utils/db'
import axios from 'axios'
import { Store } from '../../utils/store'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'

const ProductPage = (props) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { product } = props
  const classes = useStyles()

  if (!product) {
    return <div>Product not found</div>
  }

  const addToCartHandler = async () => {
    closeSnackbar()
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    )
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${product._id}`)

    if (data.countInStock < quantity) {
      return enqueueSnackbar('Sorry. Product is out of stock', {
        variant: 'error',
      })
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } })
    router.push('/cart')
  }
  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>
            <Typography>Back to products</Typography>
          </Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image
            src={product.image[0]}
            alt={product.name}
            width={640}
            height={640}
            layout="responsive"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Rating: {product.rating} stars ({product.numReviews} reviews)
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>€{product.price}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? 'In stock' : 'Out of stock'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  Add to cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const { params } = context
  const { slug } = params
  await db.connect()
  const product = await Product.findOne({ slug }).lean()
  await db.disconnect()
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  }
}

export default ProductPage
