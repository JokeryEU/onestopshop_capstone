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
import { useRouter } from 'next/router'
// import Cookies from 'js-cookie'
import Image from 'next/image'
import { useSnackbar } from 'notistack'
import { getError } from '../utils/error'
import axios from 'axios'

const WishListPage = () => {
  const { state, dispatch } = useContext(Store)
  const { userInfo } = state
  const { wishItems } = state.wish
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const removeFromWishHandler = async (wishItem) => {
    try {
      await axios.delete(`/api/products/${wishItem._id}/wishlist`, {
        headers: { authorization: `Bearer ${userInfo.accessToken}` },
      })
      dispatch({
        type: 'WISH_REMOVE_ITEM',
        payload: wishItem,
      })
      enqueueSnackbar('Product removed from wishlist', {
        variant: 'success',
      })
    } catch (error) {
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }

  // const clearWishHandler = () => {
  //   dispatch({
  //     type: 'WISH_CLEAR',
  //   })
  //   Cookies.remove('wishItems')
  // }

  const addToCartHandler = (wishItem) => {
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: {
        slug: wishItem.slug,
        name: wishItem.name,
        image: wishItem.image,
        price: wishItem.price,
        countInStock: wishItem.countInStock,
        quantity: 1,
      },
    })

    router.push('/cart')
  }

  return (
    <Layout title="Wishlist">
      <Typography variant="h1" component="h1">
        Wishlist
      </Typography>

      {wishItems.length === 0 ? (
        <>
          {userInfo ? (
            <>
              Wishlist is empty.{' '}
              <NextLink href="/" passHref>
                <Link>Go shopping</Link>
              </NextLink>
            </>
          ) : (
            <>
              Login to see your wishlist.{' '}
              <NextLink href="/login" passHref>
                <Link>Go to login</Link>
              </NextLink>
            </>
          )}
        </>
      ) : (
        <Grid container>
          <TableContainer>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>

                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wishItems.map((wishItem) => (
                  <TableRow key={wishItem.name}>
                    <TableCell component="th" scope="row">
                      <NextLink href={`/product/${wishItem.slug}`} passHref>
                        <Link>
                          <Image
                            height="100"
                            width="100"
                            alt={wishItem.name}
                            src={wishItem.image[0]}
                            layout="responsive"
                          />
                        </Link>
                      </NextLink>
                    </TableCell>

                    <TableCell>
                      <NextLink href={`/product/${wishItem.slug}`} passHref>
                        <Link>{wishItem.name} </Link>
                      </NextLink>
                    </TableCell>

                    <TableCell>€{wishItem.price}</TableCell>

                    <TableCell>
                      <Button
                        onClick={() => removeFromWishHandler(wishItem)}
                        variant="contained"
                        color="secondary"
                        style={{ marginRight: '1rem' }}
                      >
                        X
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

export default dynamic(() => Promise.resolve(WishListPage), { ssr: false })
