import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../app/store'

export interface UserState {
  account: string
  name: string
  id: string
  status: 'logout' | 'login'
}

const initialState: UserState = {
  account: '',
  name: '',
  id: '',
  status: 'logout',
}

export const userStateSlice = createSlice({
  name: 'userStateCheck',
  initialState,
  reducers: {
    checkUserState: (state: UserState, action: PayloadAction<UserState>) => {
      state.status = action.payload.status
      state.id = action.payload.id 
      state.name = action.payload.name
      state.account = action.payload.account
    },
  },
})

export const selectAccount = (state: RootState) => state.userStateCheck.account

export const { checkUserState } = userStateSlice.actions
export default userStateSlice.reducer
