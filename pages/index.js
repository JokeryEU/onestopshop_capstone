import { Grid, Link, Typography } from '@material-ui/core'
import NextLink from 'next/link'
import axios from 'axios'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { useContext } from 'react'
import Layout from '../components/Layout'
import Product from '../models/Product'
import db from '../utils/db'
import { Store } from '../utils/store'
import ProductItem from '../components/ProductItem'
import Carousel from 'react-material-ui-carousel'
import useStyles from '../utils/styles'
import { getError } from '../utils/error'

const HomePage = (props) => {
  const classes = useStyles()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { topRatedProducts, featuredProducts } = props

  const existItemInWishlist = (product) =>
    state.wish.wishItems.find((x) => x.name === product.name)

  const addToCartHandler = async (product) => {
    closeSnackbar()
    const existItem = state.cart.cartItems.find(
      (item) => item._id === product._id
    )
    const quantity = existItem ? existItem.quantity + 1 : 1
    const { data } = await axios.get(`/api/products/${product._id}`)
    if (data.countInStock < quantity) {
      return enqueueSnackbar('Sorry, Product is out of stock', {
        variant: 'error',
      })
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } })
    router.push('/cart')
  }

  const addOrRemoveWishHandler = async (product) => {
    const existInWishlist = state.wish.wishItems.find(
      (x) => x.name === product.name
    )
    if (existInWishlist) {
      try {
        await axios.delete(`/api/products/${product._id}/wishlist`, {
          headers: { authorization: `Bearer ${state.userInfo.accessToken}` },
        })
        dispatch({
          type: 'WISH_REMOVE_ITEM',
          payload: product,
        })
        enqueueSnackbar('Product removed from wishlist', {
          variant: 'success',
        })
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    } else {
      try {
        await axios.post(
          `/api/products/${product._id}/wishlist`,
          {},
          {
            headers: { authorization: `Bearer ${state.userInfo.accessToken}` },
          }
        )
        dispatch({
          type: 'WISH_ADD_ITEM',

          payload: [
            {
              slug: product.slug,
              name: product.name,
              image: product.image,
              price: product.price,
              countInStock: product.countInStock,
            },
          ],
        })

        enqueueSnackbar('Product added to wishlist', { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
  }

  return (
    <Layout>
      <Typography variant="h2">Featured Products</Typography>
      <Carousel
        className={classes.mt1}
        animation="slide"
        navButtonsAlwaysVisible
      >
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref
          >
            <Link className={classes.homeCarousel}>
              <Image
                src={product.image[0]}
                alt={product.name}
                width="400"
                height="500"
              />
            </Link>
          </NextLink>
        ))}
      </Carousel>
      <Typography variant="h2">Popular Products</Typography>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item md={3} key={product.slug} style={{ display: 'flex' }}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
              addOrRemoveWishHandler={addOrRemoveWishHandler}
              existItemInWishlist={existItemInWishlist(product)}
              userInfo={state.userInfo}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}

export async function getStaticProps() {
  await db.connect()
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3)
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6)
  await db.disconnect()
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
    },
    revalidate: 1800,
  }
}

export default HomePage
