import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
} from '@material-ui/core'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
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
        {userInfo ? (
          existItemInWishlist ? (
            <IconButton
              aria-label="removefavorite"
              onClick={() => addOrRemoveWishHandler(product)}
              size="small"
            >
              <FavoriteIcon color="error" />
            </IconButton>
          ) : (
            <IconButton
              aria-label="addfavorite"
              onClick={() => addOrRemoveWishHandler(product)}
              size="small"
            >
              <FavoriteBorderIcon />
            </IconButton>
          )
        ) : (
          ''
        )}

        <Button
          size="small"
          color="primary"
          onClick={() => addToCartHandler(product)}
        >
          Add to cart
        </Button>
      </CardActions>
    </Card>
  )
}

export default ProductItem
