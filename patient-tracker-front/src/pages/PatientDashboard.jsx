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
      <div className="min-h-screen rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-blue-100">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to patients.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-600">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">Patient Dashboard</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-sm">
            Welcome back, <span className="text-primary  font-bold text-xl">{user?.username || user?.name || 'Patient'}</span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{appointments.length}</h3>
                <p className="text-sm text-gray-500">Total Appointments</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        {/* Appointments Section */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-blue-100 mb-10">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600">
            <h2 className="text-xl font-semibold text-white">Your Appointments</h2>
            <p className="text-blue-100 text-sm mt-1">Manage and view your upcoming and past appointments</p>
          </div>
          
          {appointments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Contact your healthcare provider to schedule your first appointment.
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
                    <tr key={appointment._id} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{appointment.purpose}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {appointment.doctor?.username || appointment.doctor?.name || 'Dr. Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          new Date(appointment.date) > new Date() 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
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

        {/* Additional Resources Section */}
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 border border-blue-200 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <h3 className="text-xl font-semibold text-gray-900">Need to schedule a new appointment?</h3>
              <p className="text-gray-600 mt-1">Contact your healthcare provider directly to book your next visit.</p>
            </div>
            <button className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 whitespace-nowrap shadow-sm">
              Contact Support
            </button>
          </div>
        </div>

        {/* Health Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-lg bg-blue-100 mr-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Health Tip</h4>
                <p className="text-sm text-gray-600 mt-1">Stay hydrated by drinking at least 8 glasses of water daily.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-lg bg-green-100 mr-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Wellness Reminder</h4>
                <p className="text-sm text-gray-600 mt-1">Remember to take short breaks and stretch during long periods of sitting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;