"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "../Footer";

const DashboardContent = () => {
  const [file, setFile] = useState<File | null>(null);
  const [companyType, setCompanyType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("No file selected");
  const [burgerOpen, setBurgerOpen] = useState(false);
  const [scienceLevel, setScienceLevel] = useState<string | null>(null);

  const handeBurger = () => {
    setBurgerOpen(!burgerOpen);
  };
  
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFile(file);
      setFileName(file.name);
      localStorage.setItem("fileName", file.name);
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
      localStorage.setItem("fileName", droppedFile.name);
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
  const scienceLevelHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setScienceLevel(e.target.value);
  }

  const handleSubmit = async () => {
    if (!file || !companyType || !scienceLevel) {
      alert("Please select a file and company type.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_type", companyType);
    formData.append("science_level", scienceLevel);

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

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("fileName");
        router.push("/login");
      } else {
        console.error("Failed to log out");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

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
                <Link className="text--normal" href="#scan">
                  Scan
                </Link>
              </li>
              <li>
                <Link className="text--normal" href="#aboutcompany">
                  About
                </Link>
              </li>
              <li>
                <Link className="text--normal" href="#review">
                  Review
                </Link>
              </li>
              {username ? (
                <li>
                  <Link
                    className="text--normal flex items-center gap-2"
                    href={`/profile/${username}`}
                  >
                    <Image
                      src="images/avatar.svg"
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
        <div className="header__container--mobile flex justify-between items-center main__container">
          <div className="flex justify-between">
            <Link href="/dashboard" className="logo--normaltext">
              ResumeScanAi
            </Link>
            <button
              className="header__burger inline-block align-end font-bold 
            text-blue-300 text-[25px]"
              onClick={handeBurger}
            >
              &#9776;
            </button>
          </div>
          {burgerOpen && (
            <nav className="header__menu">
              <ul
                className="flex flex-col items-center gap-8 fixed z-10 top-[70px] 
            right-[15px]
             border border-blue-300 bg-white pb-7 px-6 pt-8"
              >
                <li className="absolute top-[8px] right-[8px]">
                  <button
                    onClick={handeBurger}
                    className="border border-blue-300 px-2 py-1 rounded-md"
                  >
                    &#10005;
                  </button>
                </li>
                <li>
                  <Link className="text--normal" href="#scan">
                    Scan
                  </Link>
                </li>
                <li>
                  <Link className="text--normal" href="#aboutcompany">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="text--normal" href="#review">
                    Review
                  </Link>
                </li>
                {username ? (
                  <li>
                    <Link
                      className="text--normal flex items-center gap-2"
                      href={`/profile/${username}`}
                    >
                      <Image
                        src="images/avatar.svg"
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
          )}
        </div>
      </header>
      <main className="main">
        <section className="hero main--marginbottom bg-blue-300 text-white">
          <div className="hero__container text-center py-[150px] relative">
            <h1 className="title--text mb-2">Resume validity checker</h1>
            <h2 className="text--normal">
              AI-enabled resume verification is the future for employers, hr
              employees, and all other IT specialties
            </h2>
          </div>
        </section>
        <section className="about main--marginbottom" id="about">
          <div className="about__container main__container">
            <ul className="about__list flex gap-[30px] items-start mx-auto flex-wrap">
              <li
                className="about__text max-w-[350px] flex gap-4 items-start 
                      text--normal"
              >
                <Image
                  width={30}
                  height={30}
                  src="/images/info.svg"
                  alt="image"
                />
                <p>
                  Welcome to <b>ResumeScanAi</b>, where you can validate your
                  resume for different companies and receive both overall and
                  targeted feedback to improve it.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal max-w-[350px]">
                <Image
                  width={30}
                  height={30}
                  src="/images/ai.svg"
                  alt="image"
                />
                <p>
                  Upload your resume in <b>PDF</b> format and select the type of
                  company you&apos;re focused on. This helps AI provide a more
                  accurate assessment.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal max-w-[350px]">
                <Image
                  width={30}
                  height={30}
                  src="/images/feedback.svg"
                  alt="image"
                />
                <p>
                  After the review, you&apos;ll get an evaluation with positive
                  aspects and suggestions for improvement, supported by general{" "}
                  <b>feedback</b> to refine your resume.
                </p>
              </li>
            </ul>
          </div>
        </section>
        <section className="scan main--marginbottom" id="scan">
          <div className="scan__container main__container">
            <h2 className="subtitle--text mb-9 text-center">Scan resume</h2>
            <div
              className="scan__questions flex main--marginbottom mx-auto 
             gap-[100px] items-center"
            >
              <div
                className="scan__file flex flex-col items-center justify-center w-[500px] 
                h-[300px] border-2 
                border-dashed border-gray-300 rounded-lg p-4 cursor-pointer 
                hover:border-blue-500"
                onClick={() => document.getElementById("file")?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Image
                  width={100}
                  height={100}
                  src="/images/pdf-icon.svg"
                  alt="Decorative image"
                />
                <span className="mt-2 text-sm text-gray-500">{fileName}</span>
                <label
                  htmlFor="file"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 px-5 py-2 bg-blue-300 text-white 
                text-sm rounded-lg cursor-pointer text--normal"
                >
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
              <div className="scan__questions flex gap-10">
                <div className="mb-4 flex flex-col gap-3">
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="startup"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Startup
                  </label>

                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="corporate"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Corporate
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="freelance"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Freelance
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="outsourcing"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Outsourcing
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="Product"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Product
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="companyType"
                      value="industrial"
                      onChange={handleTypeChange}
                      className="mr-2
    inline-flex items-center justify-center w-4 h-4 border-2 border-blue-400 rounded-full cursor-pointer 
    transition-all duration-300 ease-in-out peer-checked:bg-blue-400 peer-checked:border-blue-500 peer-checked:shadow-md 
    hover:border-blue-500 hover:shadow-sm
  "
                    />
                    Industrial
                  </label>
                </div>
                <div className="mb-4 flex flex-col gap-3">
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="scienceLevel"
                      value="internship"
                      onChange={scienceLevelHandler}
                      className="mr-2
                        inline-flex items-center justify-center w-4 h-4 border-2 
                        border-blue-400 rounded-full cursor-pointer 
                        transition-all duration-300 ease-in-out peer-checked:bg-blue-400
                         peer-checked:border-blue-500 peer-checked:shadow-md 
                         hover:border-blue-500 hover:shadow-sm"
                    />
                    Internship
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="scienceLevel"
                      value="junior"
                      onChange={scienceLevelHandler}
                      className="mr-2
                        inline-flex items-center justify-center w-4 h-4 border-2 
                        border-blue-400 rounded-full cursor-pointer 
                        transition-all duration-300 ease-in-out peer-checked:bg-blue-400
                         peer-checked:border-blue-500 peer-checked:shadow-md 
                         hover:border-blue-500 hover:shadow-sm"
                    />
                    Junior
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="scienceLevel"
                      value="mid"
                      onChange={scienceLevelHandler}
                      className="mr-2
                        inline-flex items-center justify-center w-4 h-4 border-2 
                        border-blue-400 rounded-full cursor-pointer 
                        transition-all duration-300 ease-in-out peer-checked:bg-blue-400
                         peer-checked:border-blue-500 peer-checked:shadow-md 
                         hover:border-blue-500 hover:shadow-sm"
                    />
                    Mid
                  </label>
                  <label className="text--normal">
                    <input
                      type="radio"
                      name="scienceLevel"
                      value="senior"
                      onChange={scienceLevelHandler}
                      className="mr-2
                        inline-flex items-center justify-center w-4 h-4 border-2 
                        border-blue-400 rounded-full cursor-pointer 
                        transition-all duration-300 ease-in-out peer-checked:bg-blue-400
                         peer-checked:border-blue-500 peer-checked:shadow-md 
                         hover:border-blue-500 hover:shadow-sm"
                    />
                    Senior
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="py-2 px-5 bg-blue-300 text-white rounded-lg text--normal"
              >
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
          </div>
        </section>
        <section className="main--marginbottom aboutcompany" id="aboutcompany">
          <div className="aboutcompany__container text-center text-white bg-blue-300 
          py-10">
            <div className="main__container">
              <h2 className="title--text">About Us</h2>
              <p className="text--normal">
                ResumeScanAi is a cutting-edge platform that leverages AI
                technology to help individuals validate and enhance their
                resumes. Our service is designed to offer tailored feedback
                based on the type of company you&apos;re targeting, ensuring
                your resume meets industry standards. Whether you&apos;re an
                employer, HR specialist, or job seeker in IT or any other
                sector, our AI-enabled resume verification provides detailed
                insights to help you stand out. With ResumeScanAi, you can
                receive both general and specific recommendations that will
                elevate your resume to the next level.
              </p>
            </div>
          </div>
        </section>
        <section className="main--marginbottom review" id="review">
          <div className="review__container main__container">
            <h2 className="subtitle--text text-center mb-9">Reviews</h2>
            <h3 className="title--text text-center">Soon...</h3>
          </div>
        </section>
      </main>
      <Footer link= "/dashboard" />
    </>
  );
};
export default DashboardContent;
