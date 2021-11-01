import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grow,
  IconButton,
  Tooltip,
  Typography,
  Box,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart'
import NextLink from 'next/link'
import Rating from '@mui/material/Rating'
import classes from '../utils/classes'

const ProductItem = ({
  product,
  addToCartHandler,
  addOrRemoveWishHandler,
  existItemInWishlist,
}) => {
  return (
    <Grow in>
      <Card
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: 'column',
        }}
      >
        <NextLink href={`/product/${product.slug}`} passHref>
          <CardActionArea>
            <CardMedia
              className="product-card"
              component="img"
              image={product.image[0]}
              title={product.name}
            />
            <CardContent>
              <Typography noWrap>{product.name}</Typography>
              <Rating value={product.rating} readOnly />
            </CardContent>
          </CardActionArea>
        </NextLink>
        <CardActions>
          <Typography>
            <strong>€{product.price}</strong>
          </Typography>
          <Box sx={classes.grow} />
          {existItemInWishlist ? (
            <Tooltip title="Remove from wishlist" arrow>
              <IconButton
                aria-label="removefavorite"
                onClick={() => addOrRemoveWishHandler(product)}
              >
                <FavoriteIcon color="error" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Add to wishlist" arrow>
              <IconButton
                aria-label="addfavorite"
                onClick={() => addOrRemoveWishHandler(product)}
              >
                <FavoriteBorderIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Add to cart" arrow>
            <IconButton
              aria-label="addtocart"
              onClick={() => addToCartHandler(product)}
            >
              <AddShoppingCartIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grow>
  )
}

export default ProductItem
