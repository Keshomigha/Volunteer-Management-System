import { useState, useEffect } from 'react';
import { CheckSquare, Users, CheckCircle } from 'lucide-react';
import { getMyEvents } from '../../services/eventService';
import { getAttendeesForEvent, bulkMarkAttendance } from '../../services/attendanceService';

const Attendance = () => {
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Load active/approved events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsData = await getMyEvents();
        const approved = eventsData.filter(e => e.approvalStatus === 'Approved');
        setEventsList(approved);
        if (approved.length > 0) {
          setSelectedEvent(approved[0].id);
        }
      } catch (err) {
        console.error("Error loading events for attendance:", err);
      }
    };
    fetchEvents();
  }, []);

  // 2. Load approved volunteers for selected event
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchAttendees = async () => {
      setLoading(true);
      try {
        const data = await getAttendeesForEvent(selectedEvent);
        setVolunteers(data);

        const attendeeRecords = {};
        data.forEach(v => {
          attendeeRecords[v.userId] = v.status === 'Present';
        });
        setAttendance(attendeeRecords);
      } catch (err) {
        console.error("Error loading event attendees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [selectedEvent]);

  const presentCount = volunteers.filter((v) => attendance[v.userId]).length;

  const toggle = (userId) => {
    setAttendance((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const markAll = (value) => {
    const updates = {};
    volunteers.forEach((v) => { updates[v.userId] = value; });
    setAttendance((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveAttendance = async () => {
    try {
      const records = volunteers.map(v => ({
        userId: v.userId,
        status: attendance[v.userId] ? 'Present' : 'Absent'
      }));
      await bulkMarkAttendance(selectedEvent, records);
      setToastMessage('Attendance saved successfully!');
      setTimeout(() => setToastMessage(''), 2500);
    } catch (err) {
      console.error("Error saving attendance:", err);
      alert(err.response?.data?.message || err.message || "Failed to save attendance");
    }
  };

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-500 text-md mt-0.5">Mark volunteer attendance for each event</p>
      </div>

      {/* Event selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <label className="block text-md font-semibold text-gray-700 mb-2">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full sm:w-80 border border-gray-200 rounded-xl px-3 py-2.5 text-md
            text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100
            transition-all bg-gray-50"
        >
          {eventsList.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      {/* Stats + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-cyan-50 text-cyan-700 px-4 py-2 rounded-xl text-sm font-semibold">
            <Users className="w-4 h-4" />
            {presentCount} / {volunteers.length} Present
          </div>
          {volunteers.length > 0 && (
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${(presentCount / volunteers.length) * 100}%` }}
              />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => markAll(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-green-50 text-green-600
              hover:bg-green-100 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600
              hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 w-8">
                  <CheckSquare className="w-4 h-4 text-purple-400" />
                </th>
                <th className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                  Volunteer Name
                </th>
                <th className="text-left text-sm font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-400 text-sm">
                    Loading attendees...
                  </td>
                </tr>
              ) : volunteers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-gray-400 text-sm">
                    No approved volunteers for this event
                  </td>
                </tr>
              ) : volunteers.map((volunteer) => {
                const isPresent = !!attendance[volunteer.userId];
                return (
                  <tr
                    key={volunteer.userId}
                    onClick={() => toggle(volunteer.userId)}
                    className={`cursor-pointer transition-colors ${isPresent ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'
                      }`}
                  >
                    <td className="px-5 py-4">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isPresent ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300'
                        }`}>
                        {isPresent && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-cyan-600 text-xs font-bold">{(volunteer.name || '').charAt(0)}</span>
                        </div>
                        <span className={`text-sm font-medium ${isPresent ? 'text-gray-800' : 'text-gray-600'}`}>
                          {volunteer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isPresent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {isPresent ? 'Present' : 'Absent'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {volunteers.length > 0 && !loading && (
          <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSaveAttendance}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white
                bg-gradient-to-r from-cyan-400 to-blue-500
                hover:from-cyan-500 hover:to-blue-600 transition-all border-none cursor-pointer"
            >
              Save Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;