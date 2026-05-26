import { useNavigate } from 'react-router-dom';

const roles = [
  {
    key: 'student',
    label: 'Student',
    description: 'Join events, earn certificates, and build your volunteer reputation',
    gradient: 'from-blue-400 to-purple-500',
    cardGradient: 'from-blue-400/20 to-purple-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-11 h-11 text-white" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    path: '/register/student',
  },
  {
    key: 'organizer',
    label: 'Organizer',
    description: 'Create events, manage volunteers, and track attendance',
    gradient: 'from-cyan-400 to-blue-500',
    cardGradient: 'from-cyan-400/20 to-blue-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-11 h-11 text-white" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10
             0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2
             2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0
             012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    path: '/register/organizer',
  },
  {
    key: 'admin',
    label: 'Admin',
    description: 'Manage users, approve events, and oversee the platform',
    gradient: 'from-[#14B8A6] to-[#6EE7D8]',
    cardGradient: 'from-[#14B8A6]/20 to-[#6EE7D8]/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-11 h-11 text-white" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955
             11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824
             10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
   path: '/login/admin',
  },
];

const RoleSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative flex flex-col items-center justify-start pt-16 px-4 pb-8"
      style={{
        backgroundImage: `url('/images/bg-volunteer.jpg'), url('https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#1e3a8a',
      }}
    >
      {/* Blue gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/60 to-indigo-950/75" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <div className="w-18 h-18 bg-gradient-to-br from-blue-400 to-indigo-600
                          rounded-2xl flex items-center justify-center shadow-xl p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
                   0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3
                   0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0
                   0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
            VolunteerHub
          </h1>
          <p className="text-blue-200 text-lg font-medium tracking-wide">
            Choose your role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 w-full">
          {roles.map((role) => (
            <div
              key={role.key}
              onClick={() => navigate(role.path)}
              className={`bg-gradient-to-br ${role.cardGradient}
                         backdrop-blur-md rounded-3xl p-8 flex flex-col items-center gap-5
                         cursor-pointer border border-white/30 shadow-2xl
                         hover:scale-105 hover:border-white/60 hover:shadow-blue-500/30
                         transition-all duration-250`}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(147,197,253,0.18) 100%)' }}
            >
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${role.gradient}
                               flex items-center justify-center shadow-lg`}>
                {role.icon}
              </div>

              {/* Text */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow">
                  {role.label}
                </h2>
                <p className="text-blue-100 text-base leading-relaxed font-medium">
                  {role.description}
                </p>
              </div>

              {/* CTA hint */}
              <span className="text-sm text-blue-200 font-semibold tracking-wide mt-1">
                Get Started →
              </span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RoleSelectPage;
