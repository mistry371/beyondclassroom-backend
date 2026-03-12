import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
    },
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n._id === action.payload)
      if (notification) {
        notification.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
  },
})

export const { setNotifications, markAsRead } = notificationSlice.actions
export default notificationSlice.reducer
