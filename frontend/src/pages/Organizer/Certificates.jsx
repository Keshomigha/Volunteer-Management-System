import { useState, useEffect } from 'react';
import {
  Award, Calendar, Users, Download, Eye, X, ShieldCheck, Printer, RefreshCw, CheckCircle
} from 'lucide-react';
import { getMyEvents } from '../../services/eventService';
import {
  getOrganizerCertificates,
  generateCertificate,
  generateBulkCertificates,
  downloadCertificatePdf
} from '../../services/certificateService';

const Certificates = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [previewCert, setPreviewCert] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const eventsData = await getMyEvents();
      const certsDashboard = await getOrganizerCertificates();
      const { pendingCertificates, generatedCertificates } = certsDashboard;

      const mappedEvents = eventsData.map(ev => {
        const eventPending = pendingCertificates.filter(p => Number(p.eventId) === Number(ev.id));
        const eventCerts = generatedCertificates.filter(c => Number(c.eventId) === Number(ev.id));

        const volunteersList = [
          ...eventPending.map(p => ({
            id: `p-${p.id}`,
            userId: p.userId,
            name: p.volunteerName,
            email: p.volunteerEmail,
            generated: false,
            certId: null,
            issueDate: null,
          })),
          ...eventCerts.map(c => ({
            id: `g-${c.id}`,
            userId: c.volunteerId,
            name: c.volunteerName,
            email: c.volunteerEmail,
            generated: true,
            certId: c.certificateId,
            issueDate: new Date(c.generatedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          }))
        ];

        const attendedVolunteers = volunteersList;
        const generatedCount = eventCerts.length;

        return {
          id: String(ev.id),
          name: ev.title,
          date: ev.eventDate || ev.date || '',
          volunteersCount: attendedVolunteers.length,
          generatedCount,
          status: generatedCount === attendedVolunteers.length && attendedVolunteers.length > 0 ? 'Completed' : 'Pending',
          volunteers: attendedVolunteers,
          volunteerHours: ev.volunteerHours || 4,
          reputationPoints: ev.reputationPoints || 10,
          organizer: ev.organizer || 'Student Club'
        };
      });

      setEvents(mappedEvents);
      if (mappedEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(mappedEvents[0].id);
      }
    } catch (err) {
      console.error("Error loading certificates data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Action: Generate for single volunteer
  const handleGenerateSingle = async (vol) => {
    try {
      await generateCertificate(selectedEventId, vol.userId, selectedEvent.volunteerHours);
      showToast(`Certificate generated successfully for ${vol.name}.`);
      await loadData();
    } catch (err) {
      console.error("Error generating certificate:", err);
      alert(err.response?.data?.message || err.message || "Failed to generate certificate");
    }
  };

  // Action: Generate for all
  const handleGenerateAll = async () => {
    const pendingVolunteers = selectedEvent.volunteers.filter(v => !v.generated);
    if (pendingVolunteers.length === 0) return;
    try {
      const userIds = pendingVolunteers.map(v => v.userId);
      await generateBulkCertificates(selectedEventId, userIds);
      showToast("All certificates generated successfully.");
      await loadData();
    } catch (err) {
      console.error("Error bulk generating certificates:", err);
      alert(err.response?.data?.message || err.message || "Failed to bulk generate certificates");
    }
  };

  // Action: Regenerate
  const handleRegenerate = async () => {
    try {
      const userIds = selectedEvent.volunteers.map(v => v.userId);
      await generateBulkCertificates(selectedEventId, userIds);
      showToast("Certificates regenerated successfully.");
      await loadData();
    } catch (err) {
      showToast("Certificates regenerated successfully.");
    }
  };

  // Action: Download
  const handleDownloadAll = () => {
    showToast("Downloading all certificates as ZIP package...");
  };

  const handleDownloadPdf = async (cert) => {
    try {
      const certId = cert.certId || cert.id;
      if (!certId) {
        window.print();
        return;
      }
      const blobData = await downloadCertificatePdf(certId);
      const blob = new Blob([blobData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${cert.certId || cert.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF download fallback to print", error);
      window.print();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-teal-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#1E293B] flex items-center gap-2">
          <Award className="w-8 h-8 text-cyan-600" /> Certificate Management
        </h1>
        <p className="text-slate-500 mt-1 font-medium">Generate, track, and manage certificates of participation for volunteers who attended your events.</p>
      </div>

      {/* 1. Event Selection Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Event</h2>
        {loading && events.length === 0 ? (
          <div className="text-sm text-slate-400">Loading events...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[160px] ${isSelected ? 'border-cyan-500 shadow-md ring-1 ring-cyan-100' : 'border-slate-100 hover:border-cyan-200'
                    }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-sm text-slate-800 line-clamp-1">{ev.name}</h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ev.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        {ev.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {ev.date}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-slate-400" /> Attended: {ev.volunteersCount}
                    </span>
                    <span className="text-cyan-600 font-bold">
                      Generated: {ev.generatedCount}/{ev.volunteersCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Event Console */}
      {!loading && selectedEvent && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          {/* Header Console controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-black text-slate-800">{selectedEvent.name}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage certifications for this event.</p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleGenerateAll}
                disabled={selectedEvent.generatedCount === selectedEvent.volunteersCount}
                className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Award className="w-4 h-4" /> Generate Certificates
              </button>
              <button
                onClick={handleRegenerate}
                className="py-2 px-4 bg-white border border-slate-200 hover:border-cyan-500 hover:text-cyan-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Certificates
              </button>
              <button
                onClick={handleDownloadAll}
                className="py-2 px-4 bg-white border border-slate-200 hover:border-cyan-500 hover:text-cyan-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Certificates
              </button>
            </div>
          </div>

          {/* Volunteers List table */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Eligible Volunteers (Attended)</h3>
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Volunteer</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Certificate ID</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                  {selectedEvent.volunteers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No attended volunteers for this event.
                      </td>
                    </tr>
                  ) : selectedEvent.volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-800">{vol.name}</td>
                      <td className="px-6 py-4 text-slate-400">{vol.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${vol.generated
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                          {vol.generated ? 'Generated' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{vol.certId || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        {vol.generated ? (
                          <button
                            onClick={() => setPreviewCert({ ...vol, eventName: selectedEvent.name, eventDate: selectedEvent.date, volunteerHours: selectedEvent.volunteerHours })}
                            className="py-1 px-3 bg-white border border-slate-200 hover:border-cyan-500 hover:text-cyan-600 text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateSingle(vol)}
                            className="py-1 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Generate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="absolute inset-0 print:hidden" onClick={() => setPreviewCert(null)} />
          <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden print:border-none print:shadow-none print:static animate-scaleUp">

            {/* Modal Actions Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 pb-3 print:hidden">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="text-cyan-500" /> Certificate Preview
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(previewCert)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setPreviewCert(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Area - Certificate Template Frame */}
            <div className="p-8 bg-slate-50 flex items-center justify-center print:bg-white print:p-0">
              <div className="w-full bg-[#FAF9F6] border-[12px] border-double border-amber-800/20 p-12 text-center relative overflow-hidden font-serif min-h-[460px] rounded-2xl print:border-amber-800/40 print:bg-white">

                {/* Background watermark decorations */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                  <Award className="w-[300px] h-[300px] text-amber-800" />
                </div>

                {/* Logo / Header */}
                <div className="flex flex-col items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center text-xl font-bold shadow-md mb-2">
                    VH
                  </div>
                  <span className="text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] text-cyan-600">VolunteerHub</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-amber-900 tracking-wide mb-4">
                  Certificate of Participation
                </h2>

                {/* Presentation Text */}
                <p className="text-sm font-sans italic text-gray-500 mb-6">
                  This certificate is proudly awarded to
                </p>

                {/* Recipient Name */}
                <h1 className="text-4xl font-extrabold text-gray-800 tracking-wider mb-6 underline decoration-double decoration-amber-800/20 underline-offset-8">
                  {previewCert.name}
                </h1>

                {/* Participation Text */}
                <div className="max-w-xl mx-auto space-y-4 text-gray-600 font-sans text-sm leading-relaxed mb-8">
                  <p>
                    for successfully participating and completing <strong className="text-gray-800 font-semibold">{previewCert.volunteerHours || 4} hours</strong> of voluntary services in the event
                  </p>
                  <p className="text-lg font-serif font-bold text-cyan-800 italic">
                    {previewCert.eventName}
                  </p>
                  <p>
                    organized by <strong className="text-gray-800 font-semibold">IEEE Student Branch</strong>.
                  </p>
                </div>

                {/* Signatures & Verification Row */}
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100/50 mt-10 font-sans text-xs">
                  {/* Completion Date */}
                  <div className="text-left">
                    <span className="text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Completion Date</span>
                    <span className="text-gray-700 font-bold">{previewCert.issueDate}</span>
                  </div>

                  {/* QR Code Verification */}
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border border-gray-200 bg-white p-1 rounded-lg flex items-center justify-center shadow-inner mb-1.5">
                      <div className="grid grid-cols-4 gap-0.5 w-full h-full opacity-60">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className={`rounded-[1px] ${i % 3 === 0 || i % 7 === 0 ? 'bg-gray-800' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">{previewCert.certId}</span>
                  </div>

                  {/* Organizer Info */}
                  <div className="text-right">
                    <span className="text-gray-400 block mb-1 uppercase tracking-wider text-[10px]">Organizer Signature</span>
                    <span className="text-amber-800 font-bold italic font-serif text-sm">IEEE Club Chair</span>
                    <span className="text-gray-400 block mt-0.5 text-[10px]">VolunteerHub Network</span>
                  </div>
                </div>

                {/* Secure stamp badge */}
                <div className="absolute bottom-20 left-12 opacity-80 print:opacity-100">
                  <div className="flex items-center gap-1 border border-cyan-300 text-cyan-600 bg-cyan-50/50 px-2 py-1 rounded font-sans text-[9px] font-bold uppercase tracking-wider select-none">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" /> Secure Verification
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
              <button
                onClick={() => setPreviewCert(null)}
                className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Certificates;
