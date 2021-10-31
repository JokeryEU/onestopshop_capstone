import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Typography,
  Pagination,
} from '@mui/material'
import Rating from '@mui/material/Rating'
import CancelIcon from '@mui/icons-material/Cancel'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import Layout from '../components/Layout'
import db from '../utils/db'
import Product from '../models/Product'
import classes from '../utils/classes'
import ProductItem from '../components/ProductItem'
import { Store } from '../utils/store'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'

const PAGE_SIZE = 5

const prices = [
  {
    name: '€1 to €50',
    value: '1-50',
  },
  {
    name: '€51 to €200',
    value: '51-200',
  },
  {
    name: '€201 to €1000',
    value: '201-1000',
  },
  {
    name: '€1001 to €3000',
    value: '1001-3000',
  },
]

const ratings = [1, 2, 3, 4, 5]

const SearchPage = (props) => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()

  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'featured',
  } = router.query
  const { products, countProducts, categories, brands, pages } = props

  const filterSearch = ({
    page,
    category,
    brand,
    sort,
    min,
    max,
    searchQuery,
    price,
    rating,
  }) => {
    const path = router.pathname
    const { query } = router
    if (page) query.page = page
    if (searchQuery) query.searchQuery = searchQuery
    if (sort) query.sort = sort
    if (category) query.category = category
    if (brand) query.brand = brand
    if (price) query.price = price
    if (rating) query.rating = rating
    if (min) query.min ? query.min : query.min === 0 ? 0 : min
    if (max) query.max ? query.max : query.max === 0 ? 0 : max

    router.push({
      pathname: path,
      query: query,
    })
  }
  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value })
  }
  const pageHandler = (e, page) => {
    filterSearch({ page })
  }
  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value })
  }
  const sortHandler = (e) => {
    filterSearch({ sort: e.target.value })
  }
  const priceHandler = (e) => {
    filterSearch({ price: e.target.value })
  }
  const ratingHandler = (e) => {
    filterSearch({ rating: e.target.value })
  }

  const { state, dispatch } = useContext(Store)

  const addToCartHandler = async (product) => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id)
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
  const existItemInWishlist = (product) =>
    state.wish.wishItems.find((x) => x.name === product.name)

  const addOrRemoveWishHandler = async (product) => {
    closeSnackbar()
    if (!state.userInfo) {
      return enqueueSnackbar('Please login to add to wishlist', {
        variant: 'error',
      })
    }
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
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
  }

  return (
    <Layout title="Search">
      <Grid sx={classes.section} container spacing={1}>
        <Grid item md={3}>
          <List>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Categories</Typography>
                <Select fullWidth value={category} onChange={categoryHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {categories &&
                    categories.map((category, i) => (
                      <MenuItem key={category + i} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Brands</Typography>
                <Select value={brand} onChange={brandHandler} fullWidth>
                  <MenuItem value="all">All</MenuItem>
                  {brands &&
                    brands.map((brand, i) => (
                      <MenuItem key={brand + i} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Prices</Typography>
                <Select value={price} onChange={priceHandler} fullWidth>
                  <MenuItem value="all">All</MenuItem>
                  {prices.map((price, i) => (
                    <MenuItem key={price.value + i} value={price.value}>
                      {price.name}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box sx={classes.fullWidth}>
                <Typography>Ratings</Typography>
                <Select value={rating} onChange={ratingHandler} fullWidth>
                  <MenuItem value="all">All</MenuItem>
                  {ratings.map((rating, i) => (
                    <MenuItem dispaly="flex" key={rating + i} value={rating}>
                      <Rating value={rating} readOnly />
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={9}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ' : ' + query}
              {category !== 'all' && ' : ' + category}
              {brand !== 'all' && ' : ' + brand}
              {price !== 'all' && ' : Price ' + price}
              {rating !== 'all' && ' : Rating ' + rating}
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              brand !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <Button onClick={() => router.push('/search')}>
                  <CancelIcon />
                </Button>
              ) : null}
            </Grid>
            <Grid item>
              <Typography component="span" sx={classes.sort}>
                Sort by
              </Typography>
              <Select value={sort} onChange={sortHandler}>
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="lowest">Price: Low to High</MenuItem>
                <MenuItem value="highest">Price: High to Low</MenuItem>
                <MenuItem value="toprated">Customer Reviews</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid sx={classes.section} container spacing={3}>
            {products.map((product, i) => (
              <Grid
                item
                md={3}
                key={product.name + i}
                style={{ display: 'flex' }}
              >
                <ProductItem
                  product={product}
                  addToCartHandler={addToCartHandler}
                  addOrRemoveWishHandler={addOrRemoveWishHandler}
                  existItemInWishlist={existItemInWishlist(product)}
                />
              </Grid>
            ))}
          </Grid>
          <Pagination
            sx={classes.section}
            defaultPage={parseInt(query.page || '1')}
            count={pages}
            onChange={pageHandler}
          ></Pagination>
        </Grid>
      </Grid>
    </Layout>
  )
}

export async function getServerSideProps({ query }) {
  await db.connect()
  const pageSize = query.pageSize || PAGE_SIZE
  const page = query.page || 1
  const category = query.category || ''
  const brand = query.brand || ''
  const price = query.price || ''
  const rating = query.rating || ''
  const sort = query.sort || ''
  const searchQuery = query.query || ''

  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          name: {
            $regex: searchQuery,
            $options: 'i',
          },
        }
      : {}
  const categoryFilter = category && category !== 'all' ? { category } : {}
  const brandFilter = brand && brand !== 'all' ? { brand } : {}
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          rating: {
            $gte: Number(rating),
          },
        }
      : {}

  const priceFilter =
    price && price !== 'all'
      ? {
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
        }
      : {}

  const order =
    sort === 'featured'
      ? { featured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 }

  const categories = await Product.find().distinct('category')
  const brands = await Product.find().distinct('brand')
  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    '-reviews'
  )
    .sort(order)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean()

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  })
  await db.disconnect()

  const products = productDocs.map(db.convertDocToObj)

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    },
  }
}

export default SearchPage
