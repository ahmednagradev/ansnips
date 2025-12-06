import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    authStatus: false,
    userData: null,
    username: null,
    name: null, // Added name field
    authLoading: true,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.authStatus = true;
            state.userData = action.payload.userData;
            state.username = action.payload.username;
            state.name = action.payload.name; // Store name in Redux
            state.authLoading = false;
        },
        logout: (state) => {
            state.authStatus = false;
            state.userData = null;
            state.username = null;
            state.name = null; // Clear name on logout
            state.authLoading = false;
        },
        setAuthLoading: (state, action) => {
            state.authLoading = action.payload;
        },
        updateUserData: (state, action) => {
            state.userData = action.payload;
        },
        updateUsername: (state, action) => {
            state.username = action.payload;
        },
        updateName: (state, action) => {
            state.name = action.payload; // Action to update name
        }
    }
})

export const { 
    login, 
    logout, 
    setAuthLoading, 
    updateUserData, 
    updateUsername,
    updateName 
} = authSlice.actions;

export default authSlice.reducer;