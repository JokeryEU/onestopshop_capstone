/* eslint-disable react-hooks/rules-of-hooks */
import { useContext, useEffect, useState } from 'react'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Carousel } from 'react-responsive-carousel'
import NextLink from 'next/link'
import {
  Button,
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
  Box,
} from '@mui/material'
import Rating from '@mui/material/Rating'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import Layout from '../../components/Layout'
import classes from '../../utils/classes'
import Product from '../../models/Product'
import db from '../../utils/db'
import Form from '../../components/Form'
import axios from 'axios'
import { Store } from '../../utils/store'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { getError } from '../../utils/error'
import { format, parseISO } from 'date-fns'

const ProductPage = ({ product }) => {
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state

  if (!product) return <Box>Product not found</Box>

  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewMode, setReviewMode] = useState('CREATE')

  const existItemInWishlist = state.wish.wishItems.find(
    (x) => x.name === product.name
  )

  const addOrRemoveWishHandler = async () => {
    if (existItemInWishlist) {
      try {
        await axios.delete(`/api/products/${product._id}/wishlist`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({
          type: 'WISH_REMOVE_ITEM',
          payload: existItemInWishlist,
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
            headers: { authorization: `Bearer ${userInfo.accessToken}` },
          }
        )
        dispatch({
          type: 'WISH_ADD_ITEM',

          payload: [
            {
              _id: product._id,
              slug: product.slug,
              name: product.name,
              image: product.image,
              price: product.price,
              countInStock: product.countInStock,
            },
          ],
        })

        enqueueSnackbar('Product added to wishlist', { variant: 'success' })

        router.push('/wishlist')
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )
      setLoading(false)
      enqueueSnackbar('Review submitted successfully', { variant: 'success' })

      fetchReviews()
    } catch (error) {
      setLoading(false)
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`)
      setReviews(data)
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  const fillUserReview = async () => {
    const { data } = await axios.get(`/api/products/${product._id}/myreview`, {
      headers: { authorization: `Bearer ${userInfo.accessToken}` },
    })

    if (data.review) {
      setComment(data.review.comment)
      setRating(data.review.rating)
      setReviewMode('UPDATE')
    }
  }

  useEffect(() => {
    fetchReviews()
    if (userInfo) {
      fillUserReview()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo])

  const addToCartHandler = async () => {
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
  return (
    <Layout title={product.name} description={product.description}>
      <Box sx={classes.section}>
        <NextLink href="/" passHref>
          <Link>
            <Typography component="h2" variant="h2">
              Back to products
            </Typography>
          </Link>
        </NextLink>
      </Box>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12} sx={classes.productCarousel}>
          <Carousel infiniteLoop showStatus={false} swipeable>
            {product.image.map((img, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={img} alt={product.name} />
            ))}
          </Carousel>
        </Grid>
        <Grid item md={4} xs={12}>
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
              <Rating value={product.rating} readOnly></Rating>
              <Link href="#reviews">
                <Typography>({product.numReviews} reviews)</Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={2} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>???{product.price}</Typography>
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
                  disabled={product.countInStock === 0}
                >
                  Add to cart
                </Button>
              </ListItem>
              <ListItem>
                {userInfo && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={addOrRemoveWishHandler}
                  >
                    {existItemInWishlist && <FavoriteIcon color="error" />}
                    {!existItemInWishlist && <FavoriteBorderIcon />}&nbsp;
                    {!existItemInWishlist ? 'Add Wish' : 'Remove Wish'}
                  </Button>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No reviews</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item sx={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>
                  {format(parseISO(review.createdAt), 'dd-MMM-yyyy')}
                </Typography>
              </Grid>
              <Grid item>
                <Rating value={review.rating} readOnly></Rating>
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <Form onSubmit={submitHandler}>
              <List>
                <ListItem>
                  <Typography variant="h2">
                    {reviewMode === 'CREATE'
                      ? 'Review this product'
                      : 'Update your review'}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label="Enter comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={loading}
                  >
                    {reviewMode === 'CREATE' ? 'Submit' : 'Update'}
                    {loading && (
                      <CircularProgress size={25} sx={classes.buttonProgress} />
                    )}
                  </Button>
                </ListItem>
              </List>
            </Form>
          ) : (
            <Typography variant="h2">
              Please{' '}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                login
              </Link>{' '}
              to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  )
}

export async function getStaticPaths() {
  await db.connect()
  const productPaths = await Product.find({}, '-reviews').lean()
  await db.disconnect()
  const paths = productPaths.map((path) => {
    return { params: { slug: path.slug } }
  })

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { slug } = params
  await db.connect()
  const product = await Product.findOne({ slug }, '-reviews').lean()
  await db.disconnect()
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  }
}

export default ProductPage
