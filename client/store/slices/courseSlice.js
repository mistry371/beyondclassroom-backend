import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  courses: [],
  featuredCourses: [],
  selectedCourse: null,
  loading: false,
  filters: {
    category: '',
    difficulty: '',
    search: '',
  },
}

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload
    },
    setFeaturedCourses: (state, action) => {
      state.featuredCourses = action.payload
    },
    setSelectedCourse: (state, action) => {
      state.selectedCourse = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setCourses, setFeaturedCourses, setSelectedCourse, setFilters, setLoading } = courseSlice.actions
export default courseSlice.reducer
