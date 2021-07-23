import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import userStateCheck from '../redux/userState'

export const store = configureStore({
  reducer: {
    userStateCheck: userStateCheck
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
