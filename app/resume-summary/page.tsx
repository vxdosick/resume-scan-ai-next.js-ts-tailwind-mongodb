"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export interface Feedback {
  rating: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  fileName: string; // Название файла
}

const ResumeSummary = () => {
  const router = useRouter();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [saving, setSaving] = useState(false); // Состояние сохранения
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null); // Сообщение об успехе или ошибке

  const [username, setUsername] = useState<string | null>(null); // Для отображения ссылки на профиль

  useEffect(() => {
    const data = localStorage.getItem("resumeFeedback");
    if (data) {
      const parsedData = JSON.parse(data);
      const textResponse =
        parsedData?.geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        try {
          setFeedback(
            JSON.parse(
              textResponse.replace("```json", "").replace("```", "").trim()
            )
          );
        } catch (error) {
          console.error("Error parsing feedback:", error);
        }
      }
    }

    // Установка username из localStorage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleSaveFeedback = async () => {
    setSaving(true);
    setSaveSuccess(null);

    const userId = localStorage.getItem("userId");
    const fileName = localStorage.getItem("fileName"); // Извлекаем название файла

    if (!userId || !username || !feedback || !fileName) {
      setSaveSuccess(
        "Failed to save feedback: User not logged in, no feedback available, or file name missing"
      );
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/save-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          ...feedback,
          fileName, // Передаём название файла в запрос
        }),
      });

      if (response.ok) {
        setSaveSuccess("Feedback saved successfully");
      } else {
        const data = await response.json();
        setSaveSuccess(`Failed to save feedback: ${data.error}`);
      }
    } catch (error) {
      console.error("Error saving feedback:", error);
      setSaveSuccess("Failed to save feedback: Internal server error");
    } finally {
      setSaving(false);
    }
  };

  if (!feedback) {
    return <p>Loading feedback...</p>;
  }

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <>
      <header className="py-6">
        <div className="header__container flex justify-between items-center main__container">
          <a href="/resume-summary" className="logo--normaltext">
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
                    ></Image>
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
      <section className="rating bg-blue-300 py-10 main--marginbottom">
  <div className="rating__container main__container text-center text-white">
      <h1 className="title--text mb-4">
        Resume Analysis
      </h1>
    <h2 className="subtitle--text">Rating: {feedback.rating} / 10</h2>
    <button
      onClick={handleSaveFeedback}
      disabled={saving}
      className="mt-4 py-2 px-4 text--normal bg-purple-400 text-white rounded-lg"
    >
      {saving ? "Saving..." : "Save Feedback"}
    </button>
    {saveSuccess && <p className="mt-4 text--normal">{saveSuccess}</p>}
  </div>
</section>
        <section className="strengths main--marginbottom">
          <div className="strengths__container main__container">
            <h2 className="subtitle--text mb-6 text-center">Strengths</h2>
            <ul className="mb-6 flex flex-col gap-[20px]">
              {feedback.strengths && feedback.strengths.length > 0 ? (
                feedback.strengths.map((strength, index) => (
                  <li key={index} className="text--normal flex items-start gap-3">
                    <Image
                      width={40}
                      height={40}
                      src="/images/plus.svg"
                      alt="+"
                    ></Image>
                    {strength}
                  </li>
                ))
              ) : (
                <p>No strengths available.</p>
              )}
            </ul>
          </div>
        </section>
        <section className="weaknesses main--marginbottom">
          <div className="weaknesses__container main__container">
            <h2 className="subtitle--text mb-6 text-center">Weaknesses</h2>
            <ul className="mb-6 flex flex-col gap-[20px]">
              {feedback.weaknesses && feedback.weaknesses.length > 0 ? (
                feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="text--normal flex items-start gap-3">
                    <Image
                      width={40}
                      height={40}
                      src="/images/minus.svg"
                      alt="-"
                    ></Image>
                    {weakness}
                  </li>
                ))
              ) : (
                <p>No weaknesses available.</p>
              )}
            </ul>
          </div>
        </section>
        <section className="summary bg-blue-300 py-10 text-white">
          <div className="summary__container main__container">
            <h2 className="title--text mb-6 text-center">Summary</h2>
            <p className="text-center text--normal">{feedback.summary}</p>
          </div>
        </section>
      </main>
      <footer className="footer py-6">
        <div className="footer__container flex flex-col gap-1 main__container">
          <div className="flex items-center justify-between mb-9">
            <div className="flex items-center gap-2">
                <Image width={30} height={30} src="/images/coffe.png" alt="image"></Image>
                <Link href="buymeacoffee.com/vxdosick" className="small--text">
                Support the project: buymeacoffee.com/vxdosick
                </Link>
            </div>
            <Link href="/" className="link--normal">Privacy Policy</Link>
          </div>
          <Link href="/resume-summary" className="logo--smalltext 
          text-center">ResumeScanAi</Link>
        </div>
      </footer>
    </>
  );
};

export default ResumeSummary;
