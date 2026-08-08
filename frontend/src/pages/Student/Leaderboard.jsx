import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Medal, Award } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/apiConfig';

const initials = name => {
  if (!name) return 'V';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return 'V';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
};

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
  return (
    <span className="inline-flex items-center justify-center text-sm font-semibold text-gray-500 bg-gray-100 rounded-full w-7 h-7">
      {rank}
    </span>
  );
};

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboardList, setLeaderboardList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${API_BASE_URL}/api/leaderboard`, { headers });
        const mapped = response.data.map((item, idx) => ({
          rank: idx + 1,
          name: item.name || 'Volunteer',
          score: item.reputationPoints || 0,
          events: item.totalCertificates || 0,
          hours: item.totalHours || 0
        }));
        setLeaderboardList(mapped);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboardData();
  }, [user]);

  const top3 = leaderboardList.slice(0, 3);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
          Leaderboard
        </h1>
        <p className="mt-1 text-gray-500">Top volunteers by reputation score</p>
      </div>

      {/* ── Top 3 Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading && leaderboardList.length === 0 ? (
          <div className="col-span-3 py-6 text-center text-gray-450">Loading leaderboard top 3...</div>
        ) : (
          top3.map(v => {
            const isFirst = v.rank === 1;
            return (
              <div
                key={v.rank}
                className={`rounded-2xl p-5 flex flex-col items-center gap-3 text-center
                  ${isFirst
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200'
                    : 'bg-white border border-gray-100 shadow-sm'}`}
              >
                {/* Rank icon — top-left */}
                <div className="self-start">
                  {v.rank === 1 && <Trophy className="w-7 h-7 text-amber-300" />}
                  {v.rank === 2 && <Medal className="text-gray-400 w-7 h-7" />}
                  {v.rank === 3 && <Award className="text-orange-400 w-7 h-7" />}
                </div>

                {/* Avatar */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold
                    ${isFirst ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}
                >
                  {initials(v.name)}
                </div>

                {/* Name */}
                <p className={`font-bold text-base leading-tight ${isFirst ? 'text-white' : 'text-gray-800'}`}>
                  {v.name}
                </p>

                {/* Score */}
                <p className={`text-4xl font-extrabold ${isFirst ? 'text-white' : 'text-gray-800'}`}>
                  {v.score}
                </p>

                {/* Sub-stats */}
                <p className={`text-sm ${isFirst ? 'text-white/70' : 'text-gray-400'}`}>
                  {v.events} events · {v.hours} hrs
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ── Full Table ──────────────────────────────── */}
      <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              {['Rank', 'Volunteer', 'Score', 'Events', 'Hours'].map(h => (
                <th
                  key={h}
                  className="px-5 py-3 text-xs font-semibold tracking-wider text-left text-gray-400 uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-sm text-center text-gray-400">
                  Loading leaderboard details...
                </td>
              </tr>
            ) : leaderboardList.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-sm text-center text-gray-400">
                  No rankings found.
                </td>
              </tr>
            ) : (
              leaderboardList.map(v => (
                <tr key={v.rank} className="transition-colors hover:bg-blue-50/40">

                  {/* Rank */}
                  <td className="px-5 py-4">
                    <RankIcon rank={v.rank} />
                  </td>

                  {/* Volunteer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-xs font-bold text-blue-600 bg-blue-100 rounded-full">
                        {initials(v.name)}
                      </div>
                      <span className="font-medium text-gray-800">{v.name}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-5 py-4">
                    <span className="text-base font-bold text-blue-600">{v.score}</span>
                  </td>

                  {/* Events */}
                  <td className="px-5 py-4 text-gray-500">{v.events}</td>

                  {/* Hours */}
                  <td className="px-5 py-4 text-gray-500">{v.hours}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Leaderboard;
