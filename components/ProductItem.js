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
} from '@material-ui/core'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart'
import NextLink from 'next/link'
import Rating from '@material-ui/lab/Rating'
import useStyles from '../utils/styles'

const ProductItem = ({
  product,
  addToCartHandler,
  addOrRemoveWishHandler,
  existItemInWishlist,
  userInfo,
}) => {
  const classes = useStyles()

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
          <div className={classes.grow} />
          {userInfo &&
            (existItemInWishlist ? (
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
            ))}
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
