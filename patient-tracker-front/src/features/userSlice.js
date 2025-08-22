import { createSlice } from '@reduxjs/toolkit';

const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

const getPatientRecordId = () => {
  try {
    // Try to get from localStorage first
    const id = localStorage.getItem('patientRecordId');
    if (id) return id;
    // Fallback: try to get from user object
    const user = getUserFromLocalStorage();
    if (user && (user.patientRecord || user._id)) {
      return user.patientRecord || user._id;
    }
    return null;
  } catch {
    return null;
  }
};

const initialState = {
  user: getUserFromLocalStorage(),
  role: localStorage.getItem('role') || null,
  patientRecordId: getPatientRecordId(),
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.role = user.role;

      // Store patient record ID if available (try both patientRecord and _id)
      let patientRecordId = user.patientRecord || user._id || null;
      if (user.role === 'patient' && patientRecordId) {
        state.patientRecordId = patientRecordId;
        localStorage.setItem('patientRecordId', patientRecordId);
      } else {
        state.patientRecordId = null;
        localStorage.removeItem('patientRecordId');
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