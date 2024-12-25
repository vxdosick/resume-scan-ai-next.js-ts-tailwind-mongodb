"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Feedback {
  _id: string; // Идентификатор отзыва
  rating: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  createdAt: string;
  fileName: string; // Название файла
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

  // Асинхронная распаковка params
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const resolvedParams = await params; // Распаковываем Promise
        if (resolvedParams?.username) {
          setUsername(resolvedParams.username);
        }
      } catch (error) {
        console.error("Failed to resolve params:", error);
      }
    };

    fetchParams();
  }, [params]);

  // Получаем отзывы пользователя
  useEffect(() => {
    if (!username) return;

    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`/api/save-feedback?username=${username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch feedbacks");
        }

        const data = await response.json();
        setFeedbacks(data);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
        setError("An error occurred while fetching feedbacks");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [username]);

  // Удаление отзыва
  const handleDeleteFeedback = async (id: string) => {
    try {
      const response = await fetch(`/api/save-feedback?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete feedback");
      }

      // Удаление отзыва из состояния
      setFeedbacks((prevFeedbacks) =>
        prevFeedbacks.filter((feedback) => feedback._id !== id)
      );
    } catch (error) {
      console.error("Error deleting feedback:", error);
      alert("Failed to delete feedback");
    }
  };

  // Логаут пользователя
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        router.push('/login');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Загрузка данных
  if (loading) {
    return <p>Loading feedbacks...</p>;
  }

  // Ошибка при загрузке
  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <header className="py-6">
        <div className="header__container flex justify-between items-center main__container">
          <a href="/dashboard" className="logo--normaltext">
            ResumeScanAi
          </a>
          <nav className="header__menu">
            <ul className="flex items-center gap-8">
              <li>
                <Link className="text--normal" href="/dashboard">
                  Home
                </Link>
              </li>
              {username ? (
                <li>
                  <Link
                    className="text--normal flex items-center gap-2"
                    href={`/profile/${username}`}
                  >
                    <Image
                      src="/images/avatar.svg"
                      width={25}
                      height={25}
                      alt="avatar"
                    />
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
        <section className="history main--marginbottom">
          <div className="history__container main__container">
            <h2 className="subtitle--text mb-9">Your Feedbacks</h2>
            {feedbacks.length > 0 ? (
              feedbacks.map((feedback) => (
                <div
                  key={feedback._id}
                  className="mb-6 p-4 border rounded shadow"
                >
                  <h3
                    className="subtitle--text py-2 px-5 rounded-lg bg-blue-300 
                  text-white mb-4"
                  >
                    Rating: {feedback.rating} / 10
                  </h3>
                  <h3 className="text--normal">File Name:</h3>
                  <p className="ml-6 small--text mb-4">
                    {feedback.fileName || "No file name available"}
                  </p>
                  <h3 className="text--normal">Strengths:</h3>
                  <ul className="ml-6 small--text">
                    {feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Image
                          src="/images/plus.svg"
                          width={20}
                          height={20}
                          alt="+"
                        />
                        {strength}
                      </li>
                    ))}
                  </ul>
                  <h3 className="text--normal">Weaknesses:</h3>
                  <ul className="ml-6 small--text mb-4">
                    {feedback.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Image
                          src="/images/minus.svg"
                          width={20}
                          height={20}
                          alt="-"
                        />
                        {weakness}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-5">
                    <h3 className="text--normal">Summary:</h3>
                    <p className="small--text">{feedback.summary}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Submitted on:{" "}
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={() => handleDeleteFeedback(feedback._id)}
                      className="text--normal py-1 px-4 bg-red-400 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No feedbacks found.</p>
            )}
          </div>
        </section>
      </main>
      <footer className="footer py-6">
        <div className="footer__container flex flex-col gap-1 main__container">
          <div className="flex items-center justify-between mb-9">
            <div className="flex items-center gap-2">
              <Image
                width={30}
                height={30}
                src="/images/coffe.png"
                alt="image"
              />
              <Link
                href="buymeacoffee.com/vxdosick"
                className="small--text"
              >
                Support the project: buymeacoffee.com/vxdosick
              </Link>
            </div>
            <Link href="/" className="link--normal">
              Privacy Policy
            </Link>
          </div>
          <Link
            href="/"
            className="logo--smalltext text-center"
          >
            ResumeScanAi
          </Link>
        </div>
      </footer>
    </>
  );
};

export default ProfilePage;
