import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiCode, FiHeart, FiBriefcase, FiGithub, FiLinkedin, FiSave, FiX } from 'react-icons/fi';

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: '',
    interests: '',
    projects: '',
    experience: '',
    github: '',
    linkedin: '',
  });

  useEffect(() => {
    if (!user) return;

    // Initialize the form once from the user data. Once the user starts typing,
    // we avoid overwriting their input if the user object updates (e.g. via sockets).
    if (formData.bio || formData.skills || formData.interests || formData.projects || formData.experience || formData.github || formData.linkedin) {
      return;
    }

    setFormData({
      bio: user.bio || '',
      skills: user.skills?.join(', ') || '',
      interests: user.interests?.join(', ') || '',
      projects: user.projects?.join('\n') || '',
      experience: user.experience?.join('\n') || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
    });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        skills: formData.skills.split(',').map(item => item.trim()).filter(Boolean),
        interests: formData.interests.split(',').map(item => item.trim()).filter(Boolean),
        projects: formData.projects.split('\n').map(item => item.trim()).filter(Boolean),
        experience: formData.experience.split('\n').map(item => item.trim()).filter(Boolean),
      };

      const response = await api.put('/profile/update', submitData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 relative z-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <FiUser className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
              <p className="text-slate-500 mt-1">Update your professional information and portfolio</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <FiUser className="w-4 h-4 text-slate-400" />
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Skills */}
              <div>
                <label htmlFor="skills" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiCode className="w-4 h-4 text-slate-400" />
                  Skills
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="JavaScript, React, Node.js"
                  value={formData.skills}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">Separate skills with commas</p>
              </div>

              {/* Interests */}
              <div>
                <label htmlFor="interests" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiHeart className="w-4 h-4 text-slate-400" />
                  Interests
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="AI, Web Development, Open Source"
                  value={formData.interests}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">Separate interests with commas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Projects */}
              <div>
                <label htmlFor="projects" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiBriefcase className="w-4 h-4 text-slate-400" />
                  Projects
                </label>
                <textarea
                  id="projects"
                  name="projects"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 whitespace-pre-wrap"
                  placeholder="Linkup App&#10;E-commerce Platform"
                  value={formData.projects}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">One project per line</p>
              </div>

              {/* Experience */}
              <div>
                <label htmlFor="experience" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiBriefcase className="w-4 h-4 text-slate-400" />
                  Experience
                </label>
                <textarea
                  id="experience"
                  name="experience"
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900 whitespace-pre-wrap"
                  placeholder="Software Developer at Tech Corp (2020-Present)"
                  value={formData.experience}
                  onChange={handleChange}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium">One experience entry per line</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* GitHub */}
              <div>
                <label htmlFor="github" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiGithub className="w-4 h-4 text-slate-400" />
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="https://github.com/username"
                  value={formData.github}
                  onChange={handleChange}
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <FiLinkedin className="w-4 h-4 text-slate-400" />
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-slate-900"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiSave className="w-5 h-5" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <FiX className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;