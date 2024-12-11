"use client";

const EmailConfirmation = () => {
  return (
    <div className="wrapper">
      <main className="flex items-center justify-center flex-col h-screen">
        {/* Заголовок */}
        <h1 className="text-2xl text-center mb-4">Confirm Your Email</h1>
        {/* Сообщение */}
        <p className="text-center">
          Please check your email and follow the link to activate your account.
        </p>
        {/* Кнопка для перехода на страницу входа */}
        <button
          onClick={() => (window.location.href = "/login")}
          className="mt-4 py-2 px-4 bg-blue-300 text-white rounded-lg text--normal"
        >
          Go to Login
        </button>
      </main>
    </div>
  );
};

export default EmailConfirmation;
