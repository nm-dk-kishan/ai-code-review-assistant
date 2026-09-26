'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  useEffect(() => {
    const init = async () => {
      await checkAuth();
    };
    init();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Code Review AI</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition">
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Code Review
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get intelligent insights on your code with security, performance, and quality reviews.
            Upload your project and let AI find issues before they reach production.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Review</h3>
            <p className="text-gray-600">
              Detect vulnerabilities, authentication issues, and security risks in your code.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Analysis</h3>
            <p className="text-gray-600">
              Find optimization opportunities and inefficient patterns that slow down your app.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Code Quality</h3>
            <p className="text-gray-600">
              Improve maintainability with best practices and design pattern recommendations.
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-20 bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Powerful Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="text-2xl">📁</div>
              <div>
                <h4 className="font-semibold text-gray-900">ZIP Upload</h4>
                <p className="text-gray-600 text-sm">Upload your entire project as a ZIP file</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">🤖</div>
              <div>
                <h4 className="font-semibold text-gray-900">AI Chat</h4>
                <p className="text-gray-600 text-sm">Ask questions about your code with context</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">📊</div>
              <div>
                <h4 className="font-semibold text-gray-900">Review History</h4>
                <p className="text-gray-600 text-sm">Track all your code reviews and progress</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl">⚙️</div>
              <div>
                <h4 className="font-semibold text-gray-900">Custom AI Providers</h4>
                <p className="text-gray-600 text-sm">Use OpenAI, LM Studio, or any compatible API</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
