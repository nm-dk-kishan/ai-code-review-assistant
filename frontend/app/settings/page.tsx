'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  modelName: string;
  isDefault: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProvider, setShowNewProvider] = useState(false);
  const [formData, setFormData] = useState({
    name: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelName: 'gpt-4',
  });

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
    loadProviders();
  }, [user, router]);

  async function loadProviders() {
    try {
      const data = await apiCall<AIProvider[]>('/providers');
      setProviders(data);
    } catch (error) {
      toast.error('Failed to load providers');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddProvider(e: React.FormEvent) {
    e.preventDefault();
    try {
      const provider = await apiCall<AIProvider>('/providers', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setProviders([...providers, provider]);
      setFormData({
        name: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        modelName: 'gpt-4',
      });
      setShowNewProvider(false);
      toast.success('Provider added');
    } catch (error) {
      toast.error('Failed to add provider');
    }
  }

  async function handleSetDefault(providerId: string) {
    try {
      await apiCall(`/providers/${providerId}/set-default`, { method: 'POST' });
      setProviders(
        providers.map(p => ({
          ...p,
          isDefault: p.id === providerId,
        })),
      );
      toast.success('Default provider updated');
    } catch (error) {
      toast.error('Failed to set default provider');
    }
  }

  async function handleDeleteProvider(providerId: string) {
    if (!confirm('Delete this provider?')) return;
    try {
      await apiCall(`/providers/${providerId}`, { method: 'DELETE' });
      setProviders(providers.filter(p => p.id !== providerId));
      toast.success('Provider deleted');
    } catch (error) {
      toast.error('Failed to delete provider');
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-blue-600 hover:underline">
                Dashboard
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Providers</h2>

          {/* Provider List */}
          {providers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configured Providers</h3>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <p className="text-sm text-gray-600">{provider.modelName}</p>
                      <p className="text-xs text-gray-500 mt-1">{provider.baseUrl}</p>
                      {provider.isDefault && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {!provider.isDefault && (
                        <button
                          onClick={() => handleSetDefault(provider.id)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition text-sm font-medium"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded transition text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Provider */}
          <div className="border-t pt-8">
            <button
              onClick={() => setShowNewProvider(!showNewProvider)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {showNewProvider ? 'Cancel' : '+ Add Provider'}
            </button>

            {showNewProvider && (
              <form onSubmit={handleAddProvider} className="mt-6 space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Name
                  </label>
                  <select
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="lm-studio">LM Studio</option>
                    <option value="custom">Custom (OpenAI-compatible)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base URL
                  </label>
                  <input
                    type="url"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="sk-..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                  </label>
                  <input
                    type="text"
                    value={formData.modelName}
                    onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="gpt-4"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add Provider
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">API Key Security</h3>
            <p className="text-sm text-blue-800">
              Your API keys are stored securely on the server and never exposed to the frontend.
              They are only used server-side to communicate with AI providers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
