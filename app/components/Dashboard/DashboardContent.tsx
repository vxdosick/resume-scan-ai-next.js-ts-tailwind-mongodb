"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const DashboardContent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null); // Для хранения имени пользователя

  const isTokenExpired = (token: string | null): boolean => {
    if (!token || token.split(".").length !== 3) {
      console.error("Invalid token format");
      return true; // Считаем токен истёкшим, если он некорректен
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Расшифровываем payload
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error("Failed to decode token:", error);
      return true;
    }
  };

  const router = useRouter();
  const [fileName, setFileName] = useState<string>("No file selected");

  useEffect(() => {
    const validateUser = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/auth/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.valid) {
          const userId = localStorage.getItem("userId");
          if (userId) {
            const userResponse = await fetch(`/api/user`, {
              headers: { "user-id": userId },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              setUsername(userData.username); // Устанавливаем имя пользователя
            }
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        router.push("/login");
      }
    };

    validateUser();
  }, [router]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("No file selected");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setFileName(droppedFile.name);
    } else {
      setFileName("No file selected");
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCompanyType(e.target.value);
  };

  const handleSubmit = async () => {
    if (!file || !companyType) {
      alert("Please select a file and company type.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_type", companyType);

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("resumeFeedback", JSON.stringify(data));
        router.push("/resume-summary");
      } else {
        alert("Error analyzing resume.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <>
      <header className="py-6">
        <div className="header__container flex justify-between items-center main__container">
          <a href="/dashboard" className="logo--normaltext">ResumeScanAi</a>
          <nav className="header__menu">
            <ul className="flex items-center gap-8">
              <li>
                <Link className="text--normal" href="#scan">
                  Scan
                </Link>
              </li>
              <li>
                <Link className="text--normal" href="#about">
                  About
                </Link>
              </li>
              <li>
                <Link className="text--normal" href="#review">
                  Review
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="mt-4 p-2 bg-red-500 text-white rounded mx-auto block"
                >
                  Logout
                </button>
              </li>
              {username ? (
                <li>
                  <Link className="text--normal" href={`/profile/${username}`}>
                    {username}
                  </Link>
                </li>
              ) : null}
            </ul>
          </nav>
        </div>
      </header>
      <main className="main">
        <section className="hero main--marginbottom text-white">
          <div className="hero__container text-center bg-blue-300 py-[150px]">
            <h1 className="title--text mb-2">Resume validity checker</h1>
            <h2 className="text--normal">
              AI-enabled resume verification is the future for employers, hr employees, and all other IT specialties
            </h2>
          </div>
        </section>
        <section className="about main--marginbottom" id="about">
          <div className="about__container main__container">
            <ul className="about__list flex gap-[100px] items-center mx-auto">
              <li className="flex gap-4 items-start text--normal">
                <Image width={30} height={30} src="/images/info.svg" alt="image" />
                <p>
                  Welcome to <b>ResumeScanAi</b>, where you can validate your resume for different companies and receive both overall and targeted feedback to improve it.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal">
                <Image width={30} height={30} src="/images/ai.svg" alt="image" />
                <p>
                  Upload your resume in <b>PDF</b> format and select the type of company you&apos;re focused on. This helps AI provide a more accurate assessment.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal">
                <Image width={30} height={30} src="/images/feedback.svg" alt="image" />
                <p>
                  After the review, you&apos;ll get an evaluation with positive aspects and suggestions for improvement, supported by general <b>feedback</b> to refine your resume.
                </p>
              </li>
            </ul>
          </div>
        </section>
        <section className="scan main--marginbottom" id="scan">
          <div className="scan__container main__container">
            <h2 className="subtitle--text mb-2 text-center">Scan resume</h2>
            <div className='scan__questions flex main--marginbottom mx-auto 
             gap-[300px] items-center'>
              <div
                className="flex flex-col items-center justify-center w-[500px] 
                h-[300px] border-2 
                border-dashed border-gray-300 rounded-lg p-4 cursor-pointer 
                hover:border-blue-500"
                onClick={() => document.getElementById('file')?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}>
                <Image width={100} height={100} src="/images/pdf-icon.svg" 
                alt="Decorative image" />
                <span className="mt-2 text-sm text-gray-500">{fileName}</span>
                <label htmlFor="file" className="mt-2 px-4 py-2 bg-blue-500 text-white 
                text-sm rounded-lg cursor-pointer hover:bg-blue-600 text--normal">
                  Upload
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <div className="mb-4 flex flex-col gap-3">
                <label className='text--normal'>
                  <input
                    type="radio"
                    name="companyType"
                    value="startup"
                    onChange={handleTypeChange}
                    className='mr-2'
                  />
                  Startup
                </label>
                <label className='text--normal'>
                  <input
                    type="radio"
                    name="companyType"
                    value="corporate"
                    onChange={handleTypeChange}
                    className='mr-2'
                  />
                  Corporate
                </label>
                <label className='text--normal'>
                  <input
                    type="radio"
                    name="companyType"
                    value="freelance"
                    onChange={handleTypeChange}
                    className='mr-2'
                  />
                  Freelance
                </label>
              </div>
            </div>
            <div className='flex justify-center'>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="py-2 px-10 bg-blue-500 text-white rounded text--normal">
                {loading ? 'Processing...' : 'Analyze'}
              </button>
            </div>
          </div>
        </section>
        <section className='main--marginbottom aboutcompany'>
          <div className='aboutcompany__container text-center text-white bg-blue-300 py-10'>
            <div className='main__container'>
              <h2 className='title--text'>About Us</h2>
              <p className='text--normal'>ResumeScanAi is a cutting-edge platform that leverages AI technology to help individuals validate and enhance their resumes. Our service is designed to offer tailored feedback based on the type of company you&apos;re targeting, ensuring your resume meets industry standards. Whether you&apos;re an employer, HR specialist, or job seeker in IT or any other sector, our AI-enabled resume verification provides detailed insights to help you stand out. With ResumeScanAi, you can receive both general and specific recommendations that will elevate your resume to the next level.</p>
            </div>
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

export default DashboardContent;
