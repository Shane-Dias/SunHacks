import React, { useState } from "react";
import { Calendar, Phone, User, Clock, FileText, X, Check } from "lucide-react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const PatientAppointmentSystem = () => {
  const token = localStorage.getItem("token");
  // Sample patient data - you can replace this with your actual data
  const [patients, setPatients] = useState([
    {
      id: "68a7e1df72c089bf39ae14c2",
      name: "Chetan",
      mobile: "9856124513",
      qrCode:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='0' y='0' width='10' height='10'/%3E%3Crect x='20' y='0' width='10' height='10'/%3E%3Crect x='40' y='0' width='10' height='10'/%3E%3Crect x='70' y='0' width='10' height='10'/%3E%3Crect x='90' y='0' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='30' y='20' width='10' height='10'/%3E%3Crect x='50' y='20' width='10' height='10'/%3E%3Crect x='80' y='20' width='10' height='10'/%3E%3Crect x='10' y='40' width='10' height='10'/%3E%3Crect x='40' y='40' width='10' height='10'/%3E%3Crect x='60' y='40' width='10' height='10'/%3E%3Crect x='90' y='40' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E",
    },
    {
      id: "68a7eaa910c07afae848c0e7",
      name: "Astel dmello",
      mobile: "1122334455",
      qrCode:
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='white'/%3E%3Cg fill='black'%3E%3Crect x='10' y='0' width='10' height='10'/%3E%3Crect x='30' y='0' width='10' height='10'/%3E%3Crect x='60' y='0' width='10' height='10'/%3E%3Crect x='80' y='0' width='10' height='10'/%3E%3Crect x='0' y='20' width='10' height='10'/%3E%3Crect x='40' y='20' width='10' height='10'/%3E%3Crect x='70' y='20' width='10' height='10'/%3E%3Crect x='90' y='20' width='10' height='10'/%3E%3Crect x='20' y='40' width='10' height='10'/%3E%3Crect x='50' y='40' width='10' height='10'/%3E%3Crect x='80' y='40' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentPurpose, setAppointmentPurpose] = useState("");

  const handleAddAppointment = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
    setAppointmentDate("");
    setAppointmentPurpose("");
  };

  const handleSubmitAppointment = async () => {
    if (appointmentDate && appointmentPurpose) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/appointments",
          {
            patient: selectedPatient.id,
            date: appointmentDate,
            purpose: appointmentPurpose,
            doctor: "68a76717d9bba4b64698396c", // Replace with actual doctor ID (from context/store)
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Appointment scheduled:", response.data);

        toast.success(
          `Appointment scheduled for ${selectedPatient.name} on ${appointmentDate}`
        );

        setPatients((prevPatients) =>
          prevPatients.filter((p) => p.id !== selectedPatient.id)
        );

        setShowModal(false);
        setSelectedPatient(null);
        setAppointmentDate("");
        setAppointmentPurpose("");
      } catch (error) {
        console.error("Error scheduling appointment:", error);
        alert("Failed to schedule appointment. Please try again.");
      }
    } else {
      alert("Please fill in both date and purpose fields.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPatient(null);
    setAppointmentDate("");
    setAppointmentPurpose("");
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer />
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Patient Management System
        </h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Patient Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Mobile Number
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    QR Code
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-700">
                          {patient.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <img
                          src={patient.qrCode}
                          alt={`QR Code for ${patient.name}`}
                          className="w-16 h-16 border border-gray-300 rounded"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleAddAppointment(patient)}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Add Appointment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Schedule Appointment
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Patient:</p>
                <p className="font-medium text-gray-900">
                  {selectedPatient?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedPatient?.mobile}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Appointment Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={today}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Purpose of Appointment
                  </label>
                  <textarea
                    value={appointmentPurpose}
                    onChange={(e) => setAppointmentPurpose(e.target.value)}
                    placeholder="Enter the reason for the appointment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAppointment}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentSystem;
