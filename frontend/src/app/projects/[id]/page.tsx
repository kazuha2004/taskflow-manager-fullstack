'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { getToken, getUser } from '../../../lib/auth';
import { Project, Task, User } from '../../../types';
import StatusBadge from '../../../components/StatusBadge';
import { ArrowLeft, Plus, UserPlus, Calendar, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskError, setTaskError] = useState('');

  const currentUser = getUser();
  const isAdmin = project?.admin.id === currentUser?.id;

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [id, router]);

  const fetchData = async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/api/projects/${id}/`),
        api.get(`/api/projects/${id}/tasks/`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to fetch project data', err);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    try {
      const res = await api.post(`/api/projects/${id}/add-member/`, { email: memberEmail });
      setProject(res.data);
      setShowMemberModal(false);
      setMemberEmail('');
    } catch (err: any) {
      setMemberError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError('');
    try {
      const res = await api.post(`/api/projects/${id}/tasks/`, {
        title: taskTitle,
        description: taskDesc,
        assigned_to: taskAssignedTo,
        due_date: new Date(taskDueDate).toISOString(),
      });
      setTasks([...tasks, res.data]);
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignedTo('');
      setTaskDueDate('');
    } catch (err: any) {
      setTaskError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.assigned_to?.[0] || 'Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/api/tasks/${taskId}/`, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? res.data : t));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update task status.');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading project...</div>
      </div>
    );
  }

  // Admin + Members list for dropdown
  const assignableUsers = [project.admin, ...project.members];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-4">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-1 text-sm text-gray-500">{project.description}</p>
          </div>
          {isAdmin && (
            <div className="mt-4 flex sm:mt-0 sm:ml-4 space-x-3">
              <button
                onClick={() => setShowMemberModal(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                Add Member
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create Task
              </button>
            </div>
          )}
        </div>
        <div className="px-6 py-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Team Members</h3>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
              {project.admin.name} (Admin)
            </span>
            {project.members.map(m => (
              <span key={m.id} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <p className="text-sm text-gray-500">No tasks found. {isAdmin && "Create one to get started!"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tasks.map(task => {
            const canEditStatus = isAdmin || task.assigned_to.id === currentUser?.id;
            
            return (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{task.title}</h4>
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {canEditStatus ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className={`block w-full pl-3 pr-10 py-1 text-xs font-medium border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-full
                          ${task.status === 'To Do' ? 'bg-gray-100 text-gray-800' : 
                            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <UserIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Assigned to: <strong className="ml-1 text-gray-700">{task.assigned_to.name}</strong>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setShowMemberModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Add Team Member</h3>
              <form onSubmit={handleAddMember} className="mt-4">
                {memberError && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{memberError}</div>}
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                  />
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Add Member
                  </button>
                  <button type="button" onClick={() => setShowMemberModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" onClick={() => setShowTaskModal(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Task</h3>
              <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
                {taskError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{taskError}</div>}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input type="text" required value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select required value={taskAssignedTo} onChange={(e) => setTaskAssignedTo(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Select a team member</option>
                    {assignableUsers.map(u => (
                      <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input type="date" required value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>

                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
                    Create Task
                  </button>
                  <button type="button" onClick={() => setShowTaskModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
