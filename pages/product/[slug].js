import { useContext, useEffect, useState } from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
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
} from '@material-ui/core'
import Rating from '@material-ui/lab/Rating'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
import Layout from '../../components/Layout'
import useStyles from '../../utils/styles'
import Product from '../../models/Product'
import db from '../../utils/db'
import axios from 'axios'
import { Store } from '../../utils/store'
import { useRouter } from 'next/router'
import { useSnackbar } from 'notistack'
import { getError } from '../../utils/error'
import { format, parseISO } from 'date-fns'

const ProductPage = (props) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  const { product } = props
  const classes = useStyles()

  if (!product) return <div>Product not found</div>

  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviewMode, setReviewMode] = useState('CREATE')

  const existItemInWishlist = state.wish.wishItems.find(
    (x) => x.name === product.name
  )

  const addToWishHandler = async () => {
    dispatch({
      type: 'WISH_ADD_ITEM',

      payload: {
        slug: product.slug,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
      },
    })
    try {
      await axios.post(
        `/api/products/${product._id}/wishlist`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        }
      )

      enqueueSnackbar('Product added to the Wishlist', { variant: 'success' })

      fetchReviews()
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
    router.push('/wishlist')
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
  }, [userInfo])

  const addToCartHandler = async () => {
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
  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>
            <Typography component="h2" variant="h2">
              Back to products
            </Typography>
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
              <ListItem>
                {userInfo && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={addToWishHandler}
                  >
                    {existItemInWishlist && <FavoriteIcon color="error" />}
                    {!existItemInWishlist && <FavoriteBorderIcon />}
                    {!existItemInWishlist
                      ? 'Add to Wishlist'
                      : 'Remove from wishlist'}
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
              <Grid item className={classes.reviewItem}>
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
            <form onSubmit={submitHandler} className={classes.reviewForm}>
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
                  </Button>

                  {loading && (
                    <CircularProgress
                      size={25}
                      className={classes.buttonProgress}
                    />
                  )}
                </ListItem>
              </List>
            </form>
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

export async function getServerSideProps(context) {
  const { params } = context
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
