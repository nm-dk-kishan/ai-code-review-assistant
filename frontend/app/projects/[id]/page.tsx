'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL, apiCall } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ProjectFile {
  id: string;
  path: string;
  language?: string;
  size: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  files: ProjectFile[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [reviewMode, setReviewMode] = useState<'security' | 'performance' | 'quality'>('security');

  useEffect(() => {
    const init = async () => {
      await checkAuth();
    };
    init();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProject();
  }, [user, router, projectId]);

  async function loadProject() {
    try {
      const data = await apiCall<Project>(`/projects/${projectId}`);
      setProject(data);
      setFiles(data.files);
    } catch (error) {
      toast.error('Failed to load project');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    if (!file.name.endsWith('.zip')) {
      toast.error('Please upload a ZIP file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${API_URL}/files/upload/${projectId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      toast.success(`${result.fileCount} files uploaded`);
      loadProject();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function handleReview() {
    if (selectedFiles.length === 0) {
      toast.error('Select files to review');
      return;
    }

    setReviewing(true);
    try {
      const review = await apiCall('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          fileIds: selectedFiles,
          mode: reviewMode,
        }),
      });
      toast.success('Review started');
      router.push(`/reviews/${(review as any).id}`);
    } catch (error) {
      toast.error('Review failed');
    } finally {
      setReviewing(false);
    }
  }

  async function handleDeleteFile(fileId: string) {
    if (!confirm('Delete this file?')) return;
    try {
      await apiCall(`/files/${fileId}`, { method: 'DELETE' });
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Files Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Files</h2>

              <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    disabled:opacity-50"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {uploading ? 'Uploading...' : 'Upload a ZIP file with your project'}
                </p>
              </div>

              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No files yet</p>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{file.path}</p>
                        <p className="text-xs text-gray-500">{file.language || 'text'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file.id]);
                            } else {
                              setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Review Section */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Review</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Mode
                </label>
                <select
                  value={reviewMode}
                  onChange={(e) => setReviewMode(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="security">Security Review</option>
                  <option value="performance">Performance Review</option>
                  <option value="quality">Code Quality Review</option>
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Selected: {selectedFiles.length} file(s)
                </p>
              </div>

              <button
                onClick={handleReview}
                disabled={reviewing || selectedFiles.length === 0}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
              >
                {reviewing ? 'Reviewing...' : 'Start Review'}
              </button>

              <Link
                href={`/chat?project=${projectId}`}
                className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                AI Chat
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
