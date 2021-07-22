import {  createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../app/store'

export interface UserState {
    accountName: string
    status: 'logout' | 'login'
  }


const initialState: UserState = {
  accountName: "",
  status: 'logout',
}

export const userStateSlice = createSlice({
  name: 'userStateCheck',
  initialState,
  reducers:{
    checkUserState: (state: UserState,action: PayloadAction<UserState>) => {
        state.status = action.payload.status
        state.accountName = action.payload.accountName
    }
  },

})

export const selectAccount = (state: RootState) => state.userStateCheck.accountName

export const { checkUserState} = userStateSlice.actions
export default userStateSlice.reducer