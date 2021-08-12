import { useContext } from 'react'
import dynamic from 'next/dynamic'
import NextLink from 'next/link'
import { Store } from '../utils/store'
import {
  TableContainer,
  Table,
  TableHead,
  TableCell,
  Button,
  Typography,
  TableRow,
  TableBody,
  Grid,
  Link,
} from '@material-ui/core'
import AddCircleOutlineSharpIcon from '@material-ui/icons/AddCircleOutlineSharp'
import Layout from '../components/Layout'
import Router from 'next/router'
import Cookies from 'js-cookie'

const WishListPage = () => {
  const { state, dispatch } = useContext(Store)
  const { wishItems } = state.wish

  const removeFromWishHandler = (wishItem) => {
    dispatch({
      type: WISH_REMOVE_ITEM,
      payload: wishItem,
    })
  }

  const clearWishHandler = () => {
    dispatch({
      type: WISH_CLEAR,
    })
    Cookies.remove('wishItems')
  }

  const addToCartHandler = (wishItem) => {
    dispatch({
      type: CART_ADD_ITEM,
      payload: {
        slug: wishItem.slug,
        name: wishItem.name,
        image: wishItem.image,
        price: wishItem.price,
        countInStock: wishItem.countInStock,
      },
    })

    Router.push('/cart')
    clearWishHandler()
  }

  return (
    <Layout title="WishList">
      <Typography variant="h1" component="h1">
        Wish List
      </Typography>

      {wishItems.length === 0 ? (
        <div>
          Wish list is empty.{' '}
          <NextLink href="/" passHref>
            <Link>Go shopping</Link>
          </NextLink>
        </div>
      ) : (
        <Grid container>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wishItems.map((wishItem) => (
                  <TableRow key={wishItem.name}>
                    <TableCell component="th" scope="row">
                      <img
                        height="150"
                        alt={wishItem.name}
                        src={wishItem.image[0]}
                      ></img>
                    </TableCell>
                    <TableCell>{wishItem.name}</TableCell>

                    <TableCell>${wishItem.price}</TableCell>

                    <TableCell>
                      <Button
                        onClick={() => removeFromWishHandler(wishItem)}
                        variant="contained"
                        color="secondary"
                        style={{ marginRight: '1rem' }}
                      >
                        x
                      </Button>
                      <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        onClick={() => addToCartHandler(wishItem)}
                      >
                        <AddCircleOutlineSharpIcon />
                        Cart
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}
    </Layout>
  )
}

export default dynamic(() => Promise.resolve(WishListPage), {
  ssr: false,
})
