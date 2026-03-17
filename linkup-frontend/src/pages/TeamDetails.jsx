import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiUser, FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';

const TeamDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      const response = await api.get(`/teams/${id}`);
      setTeam(response.data.team);
      setJoinRequests(response.data.joinRequests || []);
    } catch (error) {
      console.error('Error fetching team details:', error);
      toast.error('Failed to load team details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    setActionLoading(true);
    try {
      await api.post('/teams/join', { teamId: id });
      toast.success('Join request sent!');
      fetchTeamDetails(); // Refresh to show updated status
    } catch (error) {
      console.error('Error sending join request:', error);
      const message = error.response?.data?.message || 'Failed to send join request';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveRequest = async (userId) => {
    setActionLoading(true);
    try {
      await api.post('/teams/approve', { teamId: id, userId });
      toast.success('Member approved!');
      fetchTeamDetails(); // Refresh the team data
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve member');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectRequest = async (userId) => {
    setActionLoading(true);
    try {
      await api.post('/teams/reject', { teamId: id, userId });
      toast.success('Request rejected');
      fetchTeamDetails(); // Refresh the team data
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const isTeamLeader = team?.leader?._id === user?._id;
  const isTeamMember = team?.members?.some(member => member._id?.toString() === user?._id?.toString());
  const hasPendingRequest = joinRequests.some(request => request.user?._id?.toString() === user?._id?.toString());
  const isTeamFull = team?.members?.length >= team?.teamSize;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500">Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Team Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{team.teamName}</h1>
              <p className="text-gray-600 mt-1">
                Led by {team.leader?.name || 'Unknown'}
              </p>
            </div>
            <div className="flex gap-2">
              {isTeamMember ? (
                <Link
                  to={`/chat/team/${team._id}`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm shadow-indigo-500/20"
                >
                  <FiMessageSquare className="w-4 h-4" />
                  Team Chat
                </Link>
              ) : hasPendingRequest ? (
                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg">
                  Request Pending
                </span>
              ) : isTeamFull ? (
                <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  Team Full
                </span>
              ) : (
                <button
                  onClick={handleJoinRequest}
                  disabled={actionLoading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Sending...' : 'Join Team'}
                </button>
              )}
            </div>
          </div>

          {/* Team Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Size</h3>
              <p className="text-gray-600">
                {team.members?.length || 0} / {team.teamSize} members
              </p>
            </div>
            {team.requiredSkills && team.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {team.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          {team.members && team.members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.members.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {member.name?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  {member._id === team.leader?._id && (
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No members yet</p>
          )}
        </div>

        {/* Join Requests (Only for team leader) */}
        {isTeamLeader && joinRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Requests</h2>
            <div className="space-y-4">
              {joinRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {request.user.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{request.user.name}</p>
                      <p className="text-sm text-gray-600">{request.user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(request.user._id)}
                      disabled={actionLoading}
                      className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium shadow-sm"
                    >
                      <FiCheck className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.user._id)}
                      disabled={actionLoading}
                      className="bg-rose-500 text-white px-3 py-1.5 rounded-lg hover:bg-rose-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium shadow-sm"
                    >
                      <FiX className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;