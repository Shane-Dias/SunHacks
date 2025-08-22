import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.userState.user);
  const role = useSelector((state) => state.userState.role);
  const patientRecordId = useSelector((state) => state.userState.patientRecordId);

  useEffect(() => {
    // Only fetch appointments if user is a patient
    if (role === 'patient') {
      fetchPatientAppointments();
    }
  }, [role]);

  const fetchPatientAppointments = async () => {
    try {
      setLoading(true);
      
      if (!patientRecordId) {
        toast.error('Patient record not found. Please contact support.');
        return;
      }

      // First try the specific patient endpoint
      try {
        const response = await customFetch.get(`/appointments/patient/${patientRecordId}`);
        if (response.data) {
          setAppointments(response.data);
          return;
        }
      } catch (endpointError) {
        console.log('Specific patient endpoint not available, trying fallback');
      }

      // Fallback: Get all appointments and filter client-side
      const allAppointmentsResponse = await customFetch.get('/appointments');
      if (allAppointmentsResponse.data) {
        const patientApps = allAppointmentsResponse.data.filter(app => 
          app.patient && app.patient._id === patientRecordId
        );
        setAppointments(patientApps);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // If user is not a patient, show access denied
  if (role !== 'patient') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to patients.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Welcome back, {user?.username || user?.name || 'Patient'}
          </p>
        </div>

        {/* Appointments Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-primary border-b border-primaryLight">
            <h2 className="text-xl font-semibold text-white">Your Appointments</h2>
          </div>
          
          {appointments.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-500 text-lg mb-4">
                No appointments scheduled yet.
              </div>
              <p className="text-gray-400">
                Contact your doctor to schedule an appointment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.doctor?.username || appointment.doctor?.name || 'Dr. Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          new Date(appointment.date) > new Date() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {new Date(appointment.date) > new Date() ? 'Upcoming' : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primaryLight">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{appointments.length}</h3>
                <p className="text-sm text-gray-500">Total Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primaryLight">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointments.filter(app => new Date(app.date) > new Date()).length}
                </h3>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primaryLight">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointments.filter(app => new Date(app.date) <= new Date()).length}
                </h3>
                <p className="text-sm text-gray-500">Completed Appointments</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;