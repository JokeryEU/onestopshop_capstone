import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from '@material-ui/core'
import Layout from '../components/layout'

export default function Home() {
  return (
    <Layout>
      <h1>Products</h1>
      <Grid container spacing={3}>
        {toBeAddedFromDB.products.map((product) => (
          <Grid item md={4} key={product._id}>
            <Card>
              <CardActionArea>
                <CardMedia
                  component="img"
                  image={product.image}
                  title={product.name}
                ></CardMedia>
                <CardContent>
                  <Typography>{product.name}</Typography>
                </CardContent>
              </CardActionArea>
              <CardActions>
                <Typography>€{product.price}</Typography>
                <Button size="small" color="primary">
                  Add to cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  )
}
