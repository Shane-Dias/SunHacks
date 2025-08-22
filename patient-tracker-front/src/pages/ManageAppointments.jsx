import React from 'react';
import { AppointmentRegister } from '../components';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
import { redirect, useSearchParams } from 'react-router-dom';

const ManageAppointment = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('apptId');
  const isEditMode = Boolean(appointmentId);

  const handleRegistrationSubmit = async (formData) => {
    if(formData._id){
      try {
        const response = await customFetch.put(`/appointments/${formData._id}`, formData);
        toast.success('Appointment Edited Successfully');
        return redirect('/appointments');
      } catch (error) {
        const errorMessage =
          error.message ||
          'Something went wrong, please try again later';
        toast.error(errorMessage);
        return null;
      }
    }
    else{
      try {
        const response = await customFetch.post(`/appointments/`, formData);
        toast.success('Appointment Created Successfully');
        return redirect('/appointments');
      } catch (error) {
        const errorMessage =
          error.message ||
          'Something went wrong, please try again later';
        toast.error(errorMessage);
        return null;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 bg-white p-6 rounded-2xl shadow-sm border border-blue-100">
            Manage Appointment
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto bg-white p-4 rounded-xl shadow-sm">
            {isEditMode ? 'Edit existing appointment' : 'Create a new appointment'}
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-primary to-primaryMedium">
            <h2 className="text-xl font-semibold text-white">
              {isEditMode ? 'Edit Appointment Details' : 'New Appointment Registration'}
            </h2>
            <p className="text-primaryLight text-sm mt-1">
              {isEditMode ? 'Update the appointment information' : 'Fill in the details to schedule a new appointment'}
            </p>
          </div>
          
          <div className="p-6">
            <AppointmentRegister onSubmit={handleRegistrationSubmit} isEditMode={isEditMode} />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-gradient-to-r from-primaryLight to-primaryLight bg-opacity-30 rounded-2xl p-6 border border-primary border-opacity-20">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary bg-opacity-20 rounded-lg p-3 mr-4">
              <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Appointment Guidelines</h3>
              <p className="text-gray-600 mt-1 text-sm">
                Please ensure all information is accurate. Double-check dates and contact details before submitting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAppointment;