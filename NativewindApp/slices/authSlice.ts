import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
    isAuthenticated: boolean;
}

const authSlice = createSlice({
    name: 'auth',
    initialState: {isAuthenticated: false},
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        logoutUser: (state) => {
            state.isAuthenticated = false;
        }
    }
})

export const {setAuthenticated, logoutUser} = authSlice.actions;
export default authSlice.reducer;