import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
import AppointmentsList from '../components/AppointmentsList';

const AppointmentsPage = () => {
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);
  const patientRecordId = useSelector((state) => state.userState.patientRecordId);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let res;
      if (role === 'doctor') {
        // Fetch appointments for doctor
        res = await customFetch.get(`/appointments/doctor/${user._id}`);
      } else if (role === 'patient') {
        // Fetch appointments for patient
        res = await customFetch.get(`/appointments/patient/${patientRecordId}`);
      } else {
        toast.error('Invalid user role');
        setAppointments([]);
        setLoading(false);
        return;
      }
      setAppointments(res.data);
    } catch (error) {
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ((role === 'doctor' && user?._id) || (role === 'patient' && patientRecordId)) {
      fetchAppointments();
    }
    // eslint-disable-next-line
  }, [role, user, patientRecordId]);

  const handleDelete = (deletedId) => {
    setAppointments((prev) => prev.filter((appt) => appt._id !== deletedId));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      <AppointmentsList appointments={appointments} onDelete={handleDelete} />
    </div>
  );
};

export default AppointmentsPage;