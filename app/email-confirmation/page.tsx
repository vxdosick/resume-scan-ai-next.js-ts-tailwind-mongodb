"use client";
const EmailConfirmation = () => {
    return (
      <div className='wrapper'>
        <main className='flex items-center justify-center flex-col h-screen'>
          <h1 className="text-2xl text-center mb-4">Подтвердите ваш email</h1>
          <p className="text-center">Пожалуйста, проверьте вашу почту и перейдите по ссылке для активации учётной записи.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 p-2 bg-blue-500 text-white rounded"
          >
            Перейти к логину
          </button>
        </main>
      </div>
    );
  };
  
  export default EmailConfirmation;
  