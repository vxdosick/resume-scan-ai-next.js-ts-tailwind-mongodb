'use client';

import { useState, useEffect } from 'react';

interface Feedback {
  rating: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  createdAt: string;
}

interface ProfilePageProps {
  params: { username: string };
}

const ProfilePage = ({ params }: ProfilePageProps) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params; // Если params — это Promise
      setUsername(resolvedParams.username);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!username) return;

    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`/api/save-feedback?username=${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch feedbacks');
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('An error occurred while fetching feedbacks');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [username]);

  if (loading) {
    return <p>Loading feedbacks...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="wrapper max-w-[1440px] mx-auto">
      <header className="py-6 border-b">
        <h1 className="text-4xl">Welcome, {username}!</h1>
      </header>
      <main className="p-6">
        <h2 className="text-2xl mb-4">Your Feedbacks</h2>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.createdAt} className="mb-6 p-4 border rounded shadow">
              <p>
                <strong>Rating:</strong> {feedback.rating} / 10
              </p>
              <p>
                <strong>Strengths:</strong>
              </p>
              <ul className="list-disc ml-6">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
              <p>
                <strong>Weaknesses:</strong>
              </p>
              <ul className="list-disc ml-6">
                {feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
              <p>
                <strong>Summary:</strong> {feedback.summary}
              </p>
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No feedbacks found.</p>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
