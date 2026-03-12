import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload
    },
    addToCart: (state, action) => {
      state.items.push(action.payload)
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload)
    },
    clearCart: (state) => {
      state.items = []
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setCart, addToCart, removeFromCart, clearCart, setLoading } = cartSlice.actions
export default cartSlice.reducer
