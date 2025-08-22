import { createSlice } from '@reduxjs/toolkit';

const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

const initialState = {
  user: getUserFromLocalStorage(),
  role: localStorage.getItem('role') || null,
  patientRecordId: localStorage.getItem('patientRecordId') || null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.role = user.role;
      
      // Store patient record ID if available
      if (user.patientRecord) {
        state.patientRecordId = user.patientRecord;
        localStorage.setItem('patientRecordId', user.patientRecord);
      }
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
    },
    logoutUser: (state) => {
      state.user = null;
      state.role = null;
      state.patientRecordId = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('patientRecordId');
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;