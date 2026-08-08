import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Award, Download, Eye, X, Clock, Calendar, CheckCircle } from 'lucide-react';
import { getMyCertificates, downloadCertificatePdf } from '../../services/certificateService';
const downloadCertificate = async (cert) => {
  try {
    const blobData = await downloadCertificatePdf(cert.id);
    const blob = new Blob([blobData], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `certificate-${cert.certificateId || cert.id}.pdf`;
    link.click();
  } catch (error) {
    console.error("Failed to download certificate PDF", error);
  }
};
/* ── Certificate Preview Modal ──────────────────────── */
export const CertificateModal = ({ cert, onClose }) => (
  <div
    className="fixed inset-0 z-[2000] flex items-start justify-center p-4 py-8 overflow-y-auto bg-black/50 backdrop-blur-sm"
    onClick={e => e.target === e.currentTarget && onClose()}
  >
    <div className="w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-2xl animate-scaleUp">
      {/* Modal toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-600">Certificate Preview</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadCertificate(cert)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Certificate body */}
      <div className="p-6">
        <div className="p-1.5 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500">
          <div className="px-10 py-10 text-center bg-white rounded-xl">
            {/* Logo */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center justify-center flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500">
                <span className="text-sm font-black text-white">VH</span>
              </div>
              <span className="text-xl font-extrabold text-gray-800">VolunteerHub</span>
            </div>

            {/* Accent line */}
            <div className="w-16 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500" />

            {/* Title */}
            <p className="text-xs font-bold uppercase tracking-[4px] text-purple-500 mb-5">
              Certificate of Participation
            </p>

            <p className="mb-2 text-sm text-gray-400">This certifies that</p>
            <p className="mb-3 text-3xl italic font-bold text-gray-800">{cert.volunteerName}</p>
            <p className="mb-2 text-sm text-gray-400">has successfully completed volunteer service at</p>
            <p className="mb-1 text-xl font-extrabold text-purple-600">{cert.event}</p>
            <p className="text-sm text-gray-400 mb-7">
              Organized by <span className="font-semibold text-gray-600">{cert.organizer}</span>
            </p>
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: Clock,    value: `${cert.hours}h`, label: 'Volunteer Hours'    },
                { icon: Award,    value: cert.reputationPoints, label: 'Reputation Points' },
                { icon: Calendar, value: cert.completedOn, label: 'Completed On' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="px-2 py-3 bg-purple-50 rounded-xl">
                  <Icon className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <p className="text-lg font-extrabold text-purple-600">{value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-end justify-between pt-5 border-t border-gray-100">
              <div className="text-center">
                <div className="w-32 border-t border-gray-300 pt-1.5 mx-auto">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Authorized Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-gray-300 pt-1.5 mx-auto">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">VolunteerHub Administration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
/* ── Main Page ──────────────────────────────────────── */
const StudentCertificates = () => {
  const { user } = useAuth();
  const [viewing, setViewing] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true);
        const data = await getMyCertificates();
        const mapped = (data || []).map(c => ({
          id: c.id,
          certificateId: c.certificateNumber,
          event: c.eventName,
          organizer: 'VolunteerHub',
          completedOn: c.issueDate,
          hours: c.hours,
          volunteerName: user?.name || 'Volunteer',
          reputationPoints: c.reputationPointsEarned
        }));
        setCertificates(mapped);
      } catch (err) {
        console.error("Error fetching student certificates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, [user]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6 text-[#1E293B]">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-extrabold text-gray-800">
          <Award className="w-8 h-8 text-purple-500" /> My Certificates
        </h1>
        <p className="mt-1 text-slate-500 font-medium">Download or view your official event participation certificates.</p>
      </div>
      {/* Certificate List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className="overflow-hidden bg-white border border-slate-100 shadow-sm rounded-2xl hover:shadow-md hover:border-purple-100 transition-all duration-200 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="p-6 flex items-start gap-4">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 text-purple-500">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center gap-2">
                  <h3 className="text-base font-bold text-gray-850 truncate" title={cert.event}>{cert.event}</h3>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full uppercase">
                    Verified
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 mt-1 flex items-center gap-1">
                  Issued: <span className="text-slate-600 font-bold">{cert.completedOn}</span>
                </p>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Hours Volunteered: <span className="text-indigo-600 font-bold">{cert.hours} hrs</span>
                </p>
              </div>
            </div>
            {/* Actions Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setViewing(cert)}
                className="flex-1 py-2 bg-white border border-slate-200 hover:border-purple-500 hover:text-purple-600 text-slate-600 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                <span>View</span>
              </button>
              <button
                onClick={() => downloadCertificate(cert)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Download</span>
              </button>
            </div>
            </div>
        ))}
      </div>
      {/* Certificate Preview Modal */}
      {viewing && (
        <CertificateModal cert={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
};

export default StudentCertificates;