import { Link } from 'react-router-dom';
import { FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';

const TeamCard = ({ team }) => {
  const currentMembers = team.members?.length || 0;
  const isFull = currentMembers >= team.teamSize;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors duration-300">{team.teamName}</h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
              {team.leader?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
            Led by <span className="font-medium text-slate-700">{team.leader?.name || 'Unknown'}</span>
          </p>
        </div>
        <div className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 border ${
          isFull
            ? 'bg-rose-50 text-rose-600 border-rose-100'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {isFull ? 'Full' : 'Open'}
        </div>
      </div>

      {team.requiredSkills && team.requiredSkills.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FiAward className="w-3.5 h-3.5" /> Required Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {team.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-slate-50 text-slate-600 border border-slate-200 text-xs px-2.5 py-1 rounded-md font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto mb-5">
        <div className="flex items-center text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
          <FiUsers className="w-4 h-4 mr-2 text-indigo-500" />
          <span className="text-slate-900">{currentMembers}</span>
          <span className="mx-1">/</span>
          {team.teamSize} members
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          to={`/team/${team._id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-4 py-2.5 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors duration-300 text-sm font-medium"
        >
          View Team <FiArrowRight className="w-4 h-4" />
        </Link>
        {!isFull && (
          <button className="flex items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors duration-300 text-sm font-medium shadow-md shadow-slate-900/20">
            Join
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamCard;