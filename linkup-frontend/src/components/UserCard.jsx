import { Link } from 'react-router-dom';
import { FiMail, FiMapPin, FiMessageSquare, FiUser } from 'react-icons/fi';

const UserCard = ({ user }) => {
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          <span className="text-xl font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-slate-900 text-lg truncate group-hover:text-indigo-600 transition-colors duration-300">{user.name}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
            <FiMail className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{user.email}</span>
          </p>
        </div>
      </div>

      {user.bio && (
        <p className="text-sm text-slate-600 mb-5 line-clamp-2 leading-relaxed flex-1">
          {user.bio}
        </p>
      )}

      {user.skills && user.skills.length > 0 && (
        <div className="mb-6 mt-auto">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {user.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-2.5 py-1 rounded-lg font-medium"
              >
                {skill}
              </span>
            ))}
            {user.skills.length > 3 && (
              <span className="inline-block bg-slate-50 text-slate-500 border border-slate-200 text-xs px-2.5 py-1 rounded-lg font-medium">
                +{user.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <Link
          to={`/chat/${user._id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-colors duration-300 text-sm font-medium shadow-md shadow-slate-900/20 group-hover:bg-indigo-600 group-hover:shadow-indigo-500/30"
        >
          <FiMessageSquare className="w-4 h-4" /> Message
        </Link>
        <Link
          to={`/profile/${user._id}`}
          className="flex items-center justify-center w-11 h-11 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 hover:text-indigo-600 transition-all duration-300 shrink-0"
          title="View Profile"
        >
          <FiUser className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default UserCard;