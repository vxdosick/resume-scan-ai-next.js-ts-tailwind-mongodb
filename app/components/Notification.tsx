'use client';


interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification = ({ message, onClose }: NotificationProps) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded shadow-lg">
      <p>{message}</p>
      <button
        onClick={onClose}
        className="mt-2 text-sm underline"
      >
        Закрыть
      </button>
    </div>
  );
};

export default Notification;
