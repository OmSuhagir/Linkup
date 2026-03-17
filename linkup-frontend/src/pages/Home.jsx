import { Link } from 'react-router-dom';
import { FiUsers, FiMessageCircle, FiGlobe, FiArrowRight } from 'react-icons/fi';
import { RiRocketLine, RiShieldStarLine } from 'react-icons/ri';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Navbar segment just for Home */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0 animate-fade-in-down">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiGlobe className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Linkup
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white transition-colors duration-300 font-medium">
            Log in
          </Link>
          <Link to="/register" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-medium backdrop-blur-md transition-all duration-300">
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 z-10">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="animate-slide-up [animation-delay:200ms] opacity-0 animate-fill-forwards">
          <span className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-semibold tracking-wide uppercase mb-8 inline-flex items-center gap-2">
            <RiRocketLine className="w-4 h-4" /> The New Way to Connect
          </span>
        </div>

        <h1 className="mt-8 text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl animate-slide-up [animation-delay:400ms] opacity-0 animate-fill-forwards leading-[1.1]">
          Connect implicitly with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            people near you.
          </span>
        </h1>
        
        <p className="mt-6 max-w-2xl text-lg md:text-xl text-slate-400 animate-slide-up [animation-delay:600ms] opacity-0 animate-fill-forwards">
          Linkup brings you closer to your community. Find teams, chat with nearby users, and collaborate globally with our seamlessly integrated platform.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center animate-slide-up [animation-delay:800ms] opacity-0 animate-fill-forwards">
          <Link to="/register" className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_0_40px_-10px_rgba(99,102,241,0.6)] hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.8)] overflow-hidden flex items-center gap-2">
            <span className="relative z-10">Get Started Free</span>
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-full font-semibold text-lg text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-300">
            Sign In to Account
          </Link>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 py-24 bg-slate-900/50 backdrop-blur-xl border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: FiUsers,
                title: "Nearby Discovery",
                description: "Find and connect with users in your local area based on shared interests and proximity.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: FiMessageCircle,
                title: "Real-time Chat",
                description: "Engage in instant communication with your connections via our blazing fast messaging system.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: RiShieldStarLine,
                title: "Team Formation",
                description: "Create or join teams to collaborate on projects, complete tasks, and achieve goals together.",
                color: "from-amber-400 to-orange-500"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-slate-600">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center p-0.5 mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <feature.icon className={`w-6 h-6 text-transparent bg-clip-text bg-gradient-to-br ${feature.color}`} style={{ stroke: 'url(#gradient)' }} />
                    {/* SVG Gradient definition for stroke icons */}
                    <svg width="0" height="0">
                      <linearGradient id="gradient" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop stopColor="currentColor" offset="0%" />
                        <stop stopColor="currentColor" offset="100%" />
                      </linearGradient>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white mix-blend-overlay opacity-80">
                      <feature.icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
