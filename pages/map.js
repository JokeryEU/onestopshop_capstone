import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import classes from '../utils/classes'
import { Store } from '../utils/store'
import { useContext, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { useSnackbar } from 'notistack'
import { CircularProgress, Box } from '@mui/material'
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
} from '@react-google-maps/api'
import { getError } from '../utils/error'

const defaultLocation = { lat: 45.305646, lng: 27.962864 }
const libs = ['places']

const MapPage = () => {
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const { state, dispatch } = useContext(Store)
  const { userInfo } = state

  const [googleApiKey, setGoogleApiKey] = useState('')
  useEffect(() => {
    const fetchGoogleApiKey = async () => {
      try {
        const { data } = await axios('/api/keys/google', {
          headers: { authorization: `Bearer ${userInfo.accessToken}` },
        })
        setGoogleApiKey(data)
        getUserCurrentLocation()
      } catch (error) {
        enqueueSnackbar(getError(error), { variant: 'error' })
      }
    }
    fetchGoogleApiKey()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo])

  const [center, setCenter] = useState(defaultLocation)
  const [location, setLocation] = useState(center)

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      enqueueSnackbar('Geolocation is not supported by this browser', {
        variant: 'error',
      })
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      })
    }
  }

  const mapRef = useRef(null)
  const placeRef = useRef(null)
  const markerRef = useRef(null)

  const onLoad = (map) => {
    mapRef.current = map
  }
  const onIdle = () => {
    setLocation({
      lat: mapRef.current.center.lat(),
      lng: mapRef.current.center.lng(),
    })
  }

  const onLoadPlaces = (place) => {
    placeRef.current = place
  }
  const onPlacesChanged = () => {
    const place = placeRef.current.getPlaces()[0].geometry.location
    setCenter({ lat: place.lat(), lng: place.lng() })
    setLocation({ lat: place.lat(), lng: place.lng() })
  }
  const onConfirm = () => {
    const places = placeRef.current.getPlaces()
    if (places && places.length === 1) {
      dispatch({
        type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
        payload: {
          lat: location.lat,
          lng: location.lng,
          address: places[0].formatted_address,
          name: places[0].name,
          vicinity: places[0].vicinity,
          googleAddressId: places[0].id,
        },
      })
      enqueueSnackbar('location selected successfully', {
        variant: 'success',
      })
      router.push('/shipping')
    }
  }
  const onMarkerLoad = (marker) => {
    markerRef.current = marker
  }
  return googleApiKey ? (
    <Box sx={classes.fullHeight}>
      <LoadScript libraries={libs} googleMapsApiKey={googleApiKey}>
        <GoogleMap
          id="sample-map"
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onIdle={onIdle}
        >
          <StandaloneSearchBox
            onLoad={onLoadPlaces}
            onPlacesChanged={onPlacesChanged}
          >
            <Box sx={classes.mapInputBox}>
              <input type="text" placeholder="Enter your address" />
              <button type="button" onClick={onConfirm}>
                Confirm
              </button>
            </Box>
          </StandaloneSearchBox>
          <Marker position={location} onLoad={onMarkerLoad}></Marker>
        </GoogleMap>
      </LoadScript>
    </Box>
  ) : (
    <CircularProgress />
  )
}

export default dynamic(() => Promise.resolve(MapPage), { ssr: false })
