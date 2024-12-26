"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Footer from "../Footer";

const StartingPageComponent = () => {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const handeBurger = () => {
    setBurgerOpen(!burgerOpen);
  }
  return (
    <>
      <header className="py-6">
        <div className="header__container flex justify-between items-center
         main__container">
          <Link href="/" className="logo--normaltext">ResumeScanAi</Link>
          <nav className="header__menu">
            <ul className="flex items-center gap-8">
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
              <li>
                <Link className="text--normal py-2 px-5 bg-blue-300 
                text-white rounded-lg" href="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="text--normal py-2 px-5 rounded-lg
                 border border-blue-300 text-blue-400" href="/register">
                  Register
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="header__container--mobile flex justify-between items-center
         main__container">
          <div className="flex justify-between">
            <Link href="/" className="logo--normaltext">ResumeScanAi</Link>
            <button className="header__burger inline-block align-end font-bold text-blue-300 text-[25px]" 
            onClick={handeBurger}>
              &#9776;
            </button>
          </div>
          {burgerOpen && (
            <nav className="header__menu">
            <ul className="flex flex-col items-center gap-8 fixed z-10 top-[70px] right-[15px] border border-blue-300 bg-white pb-7 px-6 pt-8">
              <li className="absolute top-[8px] right-[8px]">
                <button onClick={handeBurger} 
                className="border border-blue-300 px-2 py-1 rounded-md">
                  &#10005;
                </button>
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
              <li>
                <Link className="text--normal py-2 px-5 bg-blue-300 
                text-white rounded-lg" href="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="text--normal py-2 px-5 rounded-lg
                 border border-blue-300 text-blue-400" href="/register">
                  Register
                </Link>
              </li>
            </ul>
          </nav>
          )}
        </div>
      </header>
      <main className="main">
        <section className="hero main--marginbottom text-white">
          <div className="hero__container text-center bg-blue-300 py-[150px] px-[15px]">
            <h1 className="title--text mb-2 hero__title">Resume validity checker</h1>
            <h2 className="text--normal hero__subtitle">
              AI-enabled resume verification is the future for employers, hr employees, and all other IT specialties
            </h2>
          </div>
        </section>
        <section className="about main--marginbottom" id="about">
          <div className="about__container main__container">
            <ul className="about__list flex gap-[30px] items-start mx-auto flex-wrap">
              <li className="about__text max-w-[350px] flex gap-4 items-start 
              text--normal">
                <Image width={30} height={30} src="/images/info.svg" alt="image" />
                <p>
                  Welcome to <b>ResumeScanAi</b>, where you can validate your resume for different companies and receive both overall and targeted feedback to improve it.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal max-w-[350px]">
                <Image width={30} height={30} src="/images/ai.svg" alt="image" />
                <p>
                  Upload your resume in <b>PDF</b> format and select the type of company you&apos;re focused on. This helps AI provide a more accurate assessment.
                </p>
              </li>
              <li className="flex gap-4 items-start text--normal max-w-[350px]">
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
            <h2 className="subtitle--text text-center mb-9">Scan resume</h2>
            <ul className="flex items-center gap-8 justify-center">
              <li>
                <Link className="text--normal py-2 px-5 bg-blue-300 
                text-white rounded-lg" href="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="text--normal py-2 px-5 rounded-lg
                 border border-blue-300 text-blue-400" href="/register">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </section>
        <section className='main--marginbottom aboutcompany' id="aboutcompany">
          <div className='aboutcompany__container text-center text-white bg-blue-300 
          py-10'>
            <div className='main__container'>
              <h2 className='title--text'>About Us</h2>
              <p className='text--normal'>ResumeScanAi is a cutting-edge platform that leverages AI technology to help individuals validate and enhance their resumes. Our service is designed to offer tailored feedback based on the type of company you&apos;re targeting, ensuring your resume meets industry standards. Whether you&apos;re an employer, HR specialist, or job seeker in IT or any other sector, our AI-enabled resume verification provides detailed insights to help you stand out. With ResumeScanAi, you can receive both general and specific recommendations that will elevate your resume to the next level.</p>
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
      <Footer link="/"/>
    </>
  );
};

export default StartingPageComponent;
