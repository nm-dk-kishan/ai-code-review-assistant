'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiCall } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Issue {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  lineNumber?: number;
  suggestion?: string;
}

interface Review {
  id: string;
  mode: string;
  summary: string;
  issues: Issue[];
  recommendations: string;
  createdAt: string;
  project: { id: string; name: string };
}

const severityColors = {
  Critical: 'bg-red-100 text-red-800 border-red-300',
  High: 'bg-orange-100 text-orange-800 border-orange-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Low: 'bg-blue-100 text-blue-800 border-blue-300',
};

export default function ReviewDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const reviewId = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

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
    loadReview();
  }, [user, router, reviewId]);

  async function loadReview() {
    try {
      const data = await apiCall<Review>(`/reviews/${reviewId}`);
      setReview(data);
    } catch (error) {
      toast.error('Failed to load review');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!review) {
    return <div className="flex items-center justify-center min-h-screen">Review not found</div>;
  }

  const issueCounts = {
    Critical: review.issues.filter(i => i.severity === 'Critical').length,
    High: review.issues.filter(i => i.severity === 'High').length,
    Medium: review.issues.filter(i => i.severity === 'Medium').length,
    Low: review.issues.filter(i => i.severity === 'Low').length,
  };

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
              <Link
                href={`/projects/${review.project.id}`}
                className="text-blue-600 hover:underline"
              >
                {review.project.name}
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {review.mode} Review
              </h1>
            </div>
            <button
              onClick={() => {
                const url = `/reviews?project=${review.project.id}`;
                router.push(url);
              }}
              className="text-blue-600 hover:underline"
            >
              View History
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{review.summary}</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {(['Critical', 'High', 'Medium', 'Low'] as const).map((severity) => (
            <div key={severity} className={`rounded-lg p-4 ${severityColors[severity]}`}>
              <div className="text-2xl font-bold">{issueCounts[severity]}</div>
              <div className="text-sm font-medium">{severity} Issues</div>
            </div>
          ))}
        </div>

        {/* Issues */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Issues Found</h2>

          {review.issues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No issues found! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {review.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    severityColors[issue.severity]
                  } ${expandedIssue === `issue-${index}` ? 'ring-2' : ''}`}
                  onClick={() =>
                    setExpandedIssue(
                      expandedIssue === `issue-${index}` ? null : `issue-${index}`,
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{issue.title}</h3>
                      {expandedIssue === `issue-${index}` && (
                        <div className="mt-3 space-y-2 text-sm">
                          <div>
                            <p className="font-medium">Description:</p>
                            <p className="mt-1">{issue.description}</p>
                          </div>
                          {issue.suggestion && (
                            <div>
                              <p className="font-medium">Suggestion:</p>
                              <p className="mt-1">{issue.suggestion}</p>
                            </div>
                          )}
                          {issue.lineNumber && (
                            <div>
                              <p className="font-medium">Line: {issue.lineNumber}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-semibold ml-2 whitespace-nowrap">
                      {issue.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {review.recommendations && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {review.recommendations}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
