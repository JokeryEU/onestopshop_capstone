import Cookies from 'js-cookie'
import { createContext, useReducer } from 'react'

export const Store = createContext()

const initialState = {
  darkMode: Cookies.get('darkMode') === 'ON' ? true : false,
  userInfo: Cookies.get('userInfo')
    ? JSON.parse(Cookies.get('userInfo'))
    : null,
  cart: {
    cartItems: Cookies.get('cartItems')
      ? JSON.parse(Cookies.get('cartItems'))
      : [],
    shippingAddress: Cookies.get('shippingAddress')
      ? JSON.parse(Cookies.get('shippingAddress'))
      : { location: {} },
    paymentMethod: Cookies.get('paymentMethod')
      ? Cookies.get('paymentMethod')
      : '',
  },
  wish: {
    wishItems: Cookies.get('wishItems')
      ? JSON.parse(Cookies.get('wishItems'))
      : [],
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'DARK_MODE_ON':
      return { ...state, darkMode: true }
    case 'DARK_MODE_OFF':
      return { ...state, darkMode: false }
    case 'CART_ADD_ITEM': {
      const newItem = action.payload
      const existItem = state.cart.cartItems.find(
        (item) => item.name === newItem.name
      )
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item.name === existItem.name ? newItem : item
          )
        : [...state.cart.cartItems, newItem]
      Cookies.set('cartItems', JSON.stringify(cartItems), { sameSite: 'lax' })
      return { ...state, cart: { ...state.cart, cartItems } }
    }
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      )
      Cookies.set('cartItems', JSON.stringify(cartItems), { sameSite: 'lax' })
      return { ...state, cart: { ...state.cart, cartItems } }
    }
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            ...action.payload,
          },
        },
      }
    case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            location: action.payload,
          },
        },
      }
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      }
    case 'CART_CLEAR':
      return { ...state, cart: { ...state.cart, cartItems: [] } }
    case 'WISH_ADD_ITEM': {
      const item = action.payload
      const existItem = state.wish.wishItems.find((x) => x.name === item.name)
      const wishItems = existItem
        ? state.wish.wishItems.map((x) =>
            x.name === existItem.name ? item : x
          )
        : [...state.wish.wishItems, ...item]

      Cookies.set('wishItems', JSON.stringify(wishItems), {
        sameSite: 'lax',
      })
      return {
        ...state,
        wish: {
          ...state.wish,
          wishItems,
        },
      }
    }
    case 'WISH_CLEAR':
      return {
        ...state,
        wish: {
          wishItems: [],
        },
      }
    case 'WISH_REMOVE_ITEM': {
      const wishItems = state.wish.wishItems.filter(
        (x) => x.name !== action.payload.name
      )
      Cookies.set('wishItems', JSON.stringify(wishItems), {
        sameSite: 'lax',
      })
      return {
        ...state,
        wish: {
          ...state.wish,
          wishItems,
        },
      }
    }
    case 'USER_LOGIN':
      return { ...state, userInfo: action.payload }
    case 'USER_LOGOUT':
      return {
        ...state,
        userInfo: null,
        cart: { cartItems: [], shippingAddress: {}, paymentMethod: '' },
        wish: {
          wishItems: [],
        },
      }
    default:
      return state
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = { state, dispatch }
  return <Store.Provider value={value}>{props.children}</Store.Provider>
}
