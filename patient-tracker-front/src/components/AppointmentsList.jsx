import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';

const AppointmentsList = ({ appointments, onDelete }) => {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleRowClick = (id) => {
    navigate(`/medical-history/${id}`);
  };

  const handleEditAppointment = (appointment) => {
    navigate(`/manage-appointments?patientId=${appointment.patient?._id || appointment.patient}&apptId=${appointment._id}`);
  };

  const confirmDeleteAppointment = (appointment) => {
    setAppointmentToDelete(appointment);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setAppointmentToDelete(null);
  };

  const handleDeleteAppointment = async () => {
    try {
      await customFetch.delete(`/appointments/${appointmentToDelete._id}`);
      toast.success('Appointment Deleted Successfully');
      if (onDelete) onDelete(appointmentToDelete._id);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong, please try again later';
      toast.error(errorMessage);
    } finally {
      setShowDeleteConfirm(false);
      setAppointmentToDelete(null);
    }
  };

  return (
    <>
      {/* Delete Confirmation Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-red-100 mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this appointment? This action cannot be undone.
            </p>
            
            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAppointment}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
              >
                Delete Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-sm border border-blue-100 mb-8">
        <div className="px-6 py-4 bg-gradient-to-r from-primary to-primaryMedium rounded-t-2xl -mx-6 -mt-6">
          <h2 className="text-xl font-semibold text-white">Appointments List</h2>
          <p className="text-primaryLight text-sm mt-1">Manage patient appointments</p>
        </div>
        
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full divide-y divide-gray-200 border border-blue-100 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose of visit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manage Appointment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <div className="mx-auto w-24 h-24 rounded-full bg-primaryLight bg-opacity-30 flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500">There are no appointments to display.</p>
                  </td>
                </tr>
              ) : (
                appointments.map((appointment, index) => {
                  const patient = appointment.patient;
                  const patientName =
                    (typeof patient === 'object' && patient !== null && patient.username)
                      ? patient.username
                      : appointment.patientName || 'N/A';
                  const patientId =
                    (typeof patient === 'object' && patient !== null && patient._id)
                      ? patient._id
                      : patient || appointment.patientId || 'N/A';
                  const patientContact =
                    (typeof patient === 'object' && patient !== null && patient.contact)
                      ? patient.contact
                      : appointment.patientContact || 'N/A';

                  if (!patient && !appointment.patientName) {
                    return (
                      <tr key={appointment._id} className="bg-red-50">
                        <td className="px-6 py-4" colSpan={6}>
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-red-700">Patient data missing for this appointment.</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  return (
                    <tr
                      key={appointment._id}
                      className="hover:bg-primaryLight hover:bg-opacity-10 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" onClick={() => handleRowClick(patientId)}>
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 cursor-pointer" onClick={() => handleRowClick(patientId)}>
                        {patientName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer" onClick={() => handleRowClick(patientId)}>
                        {patientContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer" onClick={() => handleRowClick(patientId)}>
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 cursor-pointer" onClick={() => handleRowClick(patientId)}>
                        {appointment.purpose}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200 shadow-sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg text-sm transition-colors duration-200 shadow-sm"
                            onClick={() => confirmDeleteAppointment(appointment)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AppointmentsList;