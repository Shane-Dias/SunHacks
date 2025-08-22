import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';

const AppointmentsList = ({ appointments, onDelete }) => {
  const navigate = useNavigate();

  const handleRowClick = (id) => {
    navigate(`/medical-history/${id}`);
  };

  const handleEditAppointment = (appointment) => {
    navigate(`/manage-appointments?patientId=${appointment.patient?._id || appointment.patient}&apptId=${appointment._id}`);
  };

  const handleDeleteAppointment = async (appointment) => {
    try {
      await customFetch.delete(`/appointments/${appointment._id}`);
      toast.success('Appointment Deleted Successfully');
      if (onDelete) onDelete(appointment._id);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        'Something went wrong, please try again later';
      toast.error(errorMessage);
    }
  };

  return (
    <section className="container mx-auto p-6 font-mono">
      <h2 className="text-2xl font-bold mb-4">Patients</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Patient Name</th>
              <th className="p-2 border">Patient Contact</th>
              <th className="p-2 border">Date of visit</th>
              <th className="p-2 border">Purpose of visit</th>
              <th className="p-2 border">Manage Appointment</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment, index) => {
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
                  <tr key={appointment._id} className="bg-red-100">
                    <td className="p-2 border" colSpan={6}>
                      Patient data missing for this appointment.
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={appointment._id}
                  className="cursor-pointer hover:bg-gray-100"
                >
                  <td className="p-2 border" onClick={() => handleRowClick(patientId)}>{index + 1}</td>
                  <td className="p-2 border" onClick={() => handleRowClick(patientId)}>{patientName}</td>
                  <td className="p-2 border" onClick={() => handleRowClick(patientId)}>{patientContact}</td>
                  <td className="p-2 border" onClick={() => handleRowClick(patientId)}>{appointment.date}</td>
                  <td className="p-2 border" onClick={() => handleRowClick(patientId)}>{appointment.purpose}</td>
                  <td className='grid place-items-center gap-2'>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 text-xs rounded"
                      onClick={() => handleEditAppointment(appointment)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 text-xs rounded"
                      onClick={() => handleDeleteAppointment(appointment)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default AppointmentsList;