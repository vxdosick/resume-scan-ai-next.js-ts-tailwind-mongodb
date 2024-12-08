'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';

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
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <>
      <header className="py-6">
        <div className="header__container flex justify-between items-center
         main__container">
          <a href="/dashboard" className="logo--normaltext">ResumeScanAi</a>
          <nav className="header__menu">
            <ul className="flex items-center gap-8">
              <li>
                <Link className="text--normal" href="/dashboard">
                  Home
                </Link>
              </li>
              {username ? (
                <li>
                  <Link className="text--normal flex items-center gap-2" 
                  href={`/profile/${username}`}>
                  <Image 
                  src="/images/avatar.svg" width={25} height={25} alt="avatar"></Image>
                    {username}
                  </Link>
                </li>
              ) : null}
              <li>
                <button
                  onClick={handleLogout}
                  className="text--normal py-1 px-4 bg-red-400 text-white rounded-lg"
                >
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="main">
        <section className='history main--marginbottom'>
          <div className='history__container main__container'>
            <h2 className="subtitle--text mb-9">Your Feedbacks</h2>
            {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div key={feedback.createdAt} className="mb-6 p-4 border rounded shadow ">
              <h3 className='subtitle--text py-2 px-5 rounded-lg bg-blue-300 
              text-white mb-4'>
                Rating: {feedback.rating} / 10
              </h3>
              <h3 className='text--normal'>
                Strengths:
              </h3>
              <ul className="list-disc ml-6 small--text">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
              <h3 className='text--normal'>
                Weaknesses:
              </h3>
              <ul className="list-disc ml-6 small--text mb-4">
                {feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
              <div className='mb-3'>
                <h3 className='text--normal'>Summary:</h3>
                <p className='small--text'>{feedback.summary}</p>
              </div>
              <p className="text-sm text-gray-500">
                Submitted on: {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <p>No feedbacks found.</p>
        )}
          </div>
        </section>
      </main>
    <footer className="footer py-6">
        <div className="footer__container text-center flex flex-col gap-1">
          <Link href="/resume-summary" className="logo--smalltext">ResumeScanAi</Link>
          <Link href="/resume-summary" className="link--normal">Privacy Policy</Link>
        </div>
      </footer>
    </>
  );
};

export default ProfilePage;
