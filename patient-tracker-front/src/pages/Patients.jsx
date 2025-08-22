import React, { useState } from "react";
import { Calendar, Phone, User, Clock, FileText, X, Check } from "lucide-react";

const PatientAppointmentSystem = () => {
  const token = localStorage.getItem("token");

  const [patients, setPatients] = useState([
    {
      id: "68a7e1df72c089bf39ae14c2",
      name: "Chetan",
      mobile: "9856124513",
      qrCode:
        "https://qrexplore.com/icon/apple-icon.png",
    },
    {
      id: "68a7eaa910c07afae848c0e7",
      name: "Astel dmello",
      mobile: "1122334455",
      qrCode:
        "https://qrexplore.com/icon/apple-icon.png",
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

  const handleQRClick = (patient) => {
    // You can implement QR code functionality here
    alert(`QR Code clicked for ${patient.name} (ID: ${patient.id})`);
    // Or you could open a modal, download the QR code, etc.
  };

  const handleSubmitAppointment = async () => {
    if (appointmentDate && appointmentPurpose) {
      try {
        // Simulated API call - replace with actual axios call in your environment
        const appointmentData = {
          patient: selectedPatient.id,
          date: appointmentDate,
          purpose: appointmentPurpose,
          doctor: "68a76717d9bba4b64698396c",
        };

        console.log("Appointment scheduled:", appointmentData);

        // Simulated success toast - replace with actual toast in your environment
        alert(
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
    <div className="bg-primaryLight min-h-screen py-12">
      {/* <ToastContainer /> */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-5xl mb-6">
            Patient Management System
          </h1>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex items-center justify-center p-6 bg-primary rounded-2xl">
            <div className="flex-shrink-0 bg-primary/20 rounded-lg p-3 mr-4">
              <User className="h-6 w-6 " />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Patient Records
              </h3>
              <p className="text-sm text-gray-600">Secure digital storage</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 bg-primary rounded-2xl">
            <div className="flex-shrink-0 bg-secondary/20 rounded-lg p-3 mr-4">
              <Calendar className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Easy Scheduling
              </h3>
              <p className="text-sm text-gray-600">One-click appointments</p>
            </div>
          </div>

          <div className="flex items-center justify-center p-6 bg-primary rounded-2xl">
            <div className="flex-shrink-0 bg-accent/20 rounded-lg p-3 mr-4">
              <svg
                className="h-6 w-6 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                QR Code Access
              </h3>
              <p className="text-sm text-gray-600">Quick identification</p>
            </div>
          </div>
        </div>

        {/* Patient Cards */}
        <div className="grid gap-8">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  {/* Patient Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                      <div className="flex-shrink-0 bg-primary/20 rounded-full p-3 mr-4">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          {patient.name}
                        </h2>
                        <div className="flex items-center justify-center lg:justify-start mt-2">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-600">
                            {patient.mobile}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* QR Code - Now Clickable */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleQRClick(patient)}
                      className="bg-primaryLight/50 p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primaryLight/80 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-primary/20"
                    >
                      <img
                        src={patient.qrCode}
                        alt={`QR Code for ${patient.name}`}
                        className="w-24 h-24 rounded-lg"
                      />
                      <p className="text-xs text-primary mt-2 text-center font-medium">
                        Patient QR
                      </p>
                    </button>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleAddAppointment(patient)}
                      className="inline-flex items-center px-6 py-3 bg-primary text-black text-base font-semibold rounded-xl hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-primary/30"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Schedule Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {patients.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-primaryLight/50 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No patients available
            </h3>
            <p className="text-gray-600">
              All patients have been scheduled for appointments.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Schedule Appointment
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-2 hover:bg-primaryLight/50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-primaryLight/50 rounded-xl border border-primary/20">
                <div className="flex items-center mb-2">
                  <div className="bg-primary/20 rounded-full p-2 mr-3">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">
                      Patient Information
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-base ml-9">
                  {selectedPatient?.name}
                </p>
                <p className="text-gray-600 ml-9 flex items-center mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {selectedPatient?.mobile}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center text-base font-medium text-gray-700 mb-3">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    Appointment Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={today}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="flex items-center text-base font-medium text-gray-700 mb-3">
                    <FileText className="h-5 w-5 mr-2 text-gray-500" />
                    Purpose of Appointment
                  </label>
                  <textarea
                    value={appointmentPurpose}
                    onChange={(e) => setAppointmentPurpose(e.target.value)}
                    placeholder="Enter the reason for the appointment..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/30 focus:border-primary resize-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 text-gray-700 bg-primaryLight/50 rounded-xl hover:bg-primaryLight/80 transition-all duration-200 font-medium focus:outline-none focus:ring-4 focus:ring-primary/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAppointment}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 font-semibold focus:outline-none focus:ring-4 focus:ring-primary/30 shadow-lg"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Schedule Appointment
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
