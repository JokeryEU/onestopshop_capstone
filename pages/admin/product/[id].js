import axios from 'axios'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { useEffect, useContext, useReducer, useState } from 'react'
import {
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  TextField,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { getError } from '../../../utils/error'
import { Store } from '../../../utils/store'
import Layout from '../../../components/Layout'
import classes from '../../../utils/classes'
import { Controller, useForm } from 'react-hook-form'
import Form from '../../../components/Form'
import { useSnackbar } from 'notistack'

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' }
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' }
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload }
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' }
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' }
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload }
    default:
      return state
  }
}

const AdminProductEditPage = ({ params }) => {
  const productId = params.id
  const { state } = useContext(Store)
  const { userInfo } = state
  const [isFeatured, setIsFeatured] = useState(false)

  const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  })
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' })
        const { data } = await axios.get(`/api/admin/product/${productId}`, {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        dispatch({ type: 'FETCH_SUCCESS' })
        setValue('name', data.name)
        setValue('slug', data.slug)
        setValue('price', data.price)
        setValue('category', data.category)
        setValue('image', data.image)
        setValue('brand', data.brand)
        setValue('countInStock', data.countInStock)
        setValue('description', data.description)
        setIsFeatured(data.isFeatured)
      } catch (error) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(error) })
      }
    }
    fetchData()
  }, [userInfo, productId, setValue])

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    image,
    brand,
    countInStock,
    description,
  }) => {
    closeSnackbar()
    const form = new FormData()
    form.append('name', name)
    form.append('slug', slug)
    form.append('description', description)
    form.append('price', price)
    form.append('brand', brand)
    form.append('isFeatured', isFeatured)
    form.append('category', category)
    form.append('countInStock', countInStock)
    for (const key of Object.keys(image)) {
      form.append('prodImage', image[key])
    }

    try {
      dispatch({ type: 'UPDATE_REQUEST' })
      await axios.put(`/api/admin/product/${productId}`, form, {
        headers: {
          authorization: `Bearer ${userInfo.accessToken}`,
        },
      })

      dispatch({ type: 'UPDATE_SUCCESS' })
      enqueueSnackbar('Product updated successfully', { variant: 'success' })
      router.push('/admin/products')
    } catch (error) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(error) })
      enqueueSnackbar(getError(error), { variant: 'error' })
    }
  }
  return (
    <Layout title={`Admin Edit Product ${productId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card sx={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Admin Dashboard" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Orders" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="Products" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/coupons" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Coupons" />
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="Users" />
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card sx={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit Product {productId}
                </Typography>
                &nbsp;&nbsp;&nbsp;
                {loading && <CircularProgress />}
                {error && <Typography sx={classes.error}>{error}</Typography>}
              </ListItem>

              <ListItem>
                <Form onSubmit={handleSubmit(submitHandler)}>
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            helperText={errors.name ? 'Name is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="slug"
                            label="Slug"
                            error={Boolean(errors.slug)}
                            helperText={errors.slug ? 'Slug is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="price"
                            label="Price"
                            error={Boolean(errors.price)}
                            helperText={errors.price ? 'Price is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="category"
                            label="Category"
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? 'Category is required' : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="brand"
                            label="Brand"
                            error={Boolean(errors.brand)}
                            helperText={errors.brand ? 'Brand is required' : ''}
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="countInStock"
                            label="Count in stock"
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? 'Count in stock is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            multiline
                            id="description"
                            label="Description"
                            error={Boolean(errors.description)}
                            helperText={
                              errors.description
                                ? 'Description is required'
                                : ''
                            }
                            {...field}
                          />
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <Button
                            variant="contained"
                            component="label"
                            id="image"
                            onChange={(e) => {
                              field.onChange(e.target.files)
                            }}
                          >
                            Upload Images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                            />
                          </Button>
                        )}
                      />
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="Is Featured"
                        control={
                          <Checkbox
                            onClick={(e) => setIsFeatured(e.target.checked)}
                            checked={isFeatured}
                            name="isFeatured"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                        disabled={loadingUpdate}
                      >
                        Update
                        {loadingUpdate && (
                          <CircularProgress
                            size={25}
                            sx={classes.buttonProgress}
                          />
                        )}
                      </Button>
                    </ListItem>
                    <ListItem>
                      <NextLink href="/admin/products" passHref>
                        <Button variant="contained" fullWidth>
                          Cancel
                        </Button>
                      </NextLink>
                    </ListItem>
                  </List>
                </Form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  )
}

export function getServerSideProps({ req, params }) {
  if (!req.headers.cookie) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  const user = req.headers.cookie.includes('accessToken')
  const role = req.headers.cookie.includes('Admin')

  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  } else if (!role) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  } else {
    return {
      props: { params },
    }
  }
}

export default dynamic(() => Promise.resolve(AdminProductEditPage), {
  ssr: false,
})
