import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import UserCard from '../components/UserCard';
import TeamCard from '../components/TeamCard';
import { FiUsers, FiShield, FiUser, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersResponse, teamsResponse] = await Promise.all([
          api.get('/users/nearby'),
          api.get('/teams'),
        ]);

        // Backend returns { users, searchCriteria }
        const nearby = usersResponse.data?.users ?? usersResponse.data ?? [];
        const teamsData = teamsResponse.data?.teams ?? teamsResponse.data ?? [];

        setNearbyUsers(nearby.slice(0, 3)); // Show only first 3 nearby users
        setTeams(teamsData.slice(0, 3)); // Show only first 3 teams
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening nearby.</p>
      </div>

      {/* Nearby Users Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Nearby Users</h2>
          <Link
            to="/nearby-users"
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
        {nearbyUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyUsers.map((user) => (
              <UserCard key={user._id} user={user} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">No nearby users found. Try updating your location.</p>
          </div>
        )}
      </div>

      {/* Teams Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Active Teams</h2>
          <Link
            to="/teams"
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            View all →
          </Link>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">No active teams. Create your first team!</p>
            <Link
              to="/teams"
              className="inline-block mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Browse Teams
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/nearby-users"
            className="group block bg-slate-50 hover:bg-white border border-transparent hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-500/5 p-6 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Find Nearby Users</h3>
            <p className="text-sm text-slate-500 mt-2">Discover professionals in your area</p>
          </Link>
          <Link
            to="/teams"
            className="group block bg-slate-50 hover:bg-white border border-transparent hover:border-purple-100 hover:shadow-md hover:shadow-purple-500/5 p-6 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <FiShield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Join a Team</h3>
            <p className="text-sm text-slate-500 mt-2">Collaborate on hackathon projects</p>
          </Link>
          <Link
            to="/profile"
            className="group block bg-slate-50 hover:bg-white border border-transparent hover:border-pink-100 hover:shadow-md hover:shadow-pink-500/5 p-6 rounded-2xl transition-all duration-300"
          >
            <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300">
              <FiUser className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors">Update Profile</h3>
            <p className="text-sm text-slate-500 mt-2">Showcase your skills and experience</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;