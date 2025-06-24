import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isAuthenticated: false, role: "user" },
  reducers: {
    login(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    },
    changeRole(state, action) {
      const role = action.payload;
      state.role = role;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice.reducer;
