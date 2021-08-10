import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core'
import React from 'react'
import NextLink from 'next/link'
import Rating from '@material-ui/lab/Rating'
import useStyles from '../utils/styles'

const ProductItem = ({ product, addToCartHandler }) => {
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
            // style={{ height: '30vh', objectFit: 'fill' }}
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
