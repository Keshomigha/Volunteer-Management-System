import { useNavigate } from 'react-router-dom';
import { VolunteerHubLogoIcon } from '../../components/VolunteerHubLogo';

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
];

const RoleSelectPage = ({ mode = 'register' }) => {
  const navigate = useNavigate();
  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start pt-28 px-4 pb-8 overflow-hidden">

      {/* Background image */}
      <img
        src="/images/community.jpg"
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Strong overlay so cards and text are clearly readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">

        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <VolunteerHubLogoIcon className="w-16 h-16 drop-shadow-xl" />
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight">
            VolunteerHub
          </h1>
          <p className="text-white/70 text-lg font-medium tracking-wide">
            {isLogin ? 'Choose your role to sign in' : 'Choose your role to get started'}
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 w-full max-w-4xl mx-auto">
          {roles.map((role) => {
            const targetPath = isLogin ? `/login/${role.key}` : `/register/${role.key}`;
            
            return (
              <div
                key={role.key}
                onClick={() => navigate(targetPath)}
                className={`bg-gradient-to-br ${role.cardGradient}
                           backdrop-blur-md rounded-3xl p-8 flex flex-col items-center gap-5
                           cursor-pointer border border-white/30 shadow-2xl
                           hover:scale-105 hover:border-white/60 hover:shadow-blue-500/30
                           transition-all duration-250`}
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(147,197,253,0.12) 100%)' }}
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
                  <p className="text-white/80 text-base leading-relaxed font-medium">
                    {role.description}
                  </p>
                </div>

                {/* CTA hint */}
                <span className="text-sm text-blue-200 font-semibold tracking-wide mt-1">
                  {isLogin ? 'Sign In →' : 'Get Started →'}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RoleSelectPage;
