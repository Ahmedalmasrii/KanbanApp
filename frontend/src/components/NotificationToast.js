import React, { useEffect, useState } from "react";

const NotificationToast = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, [message]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 right-5 z-50">
      <div className="bg-white text-black shadow-lg rounded-lg px-4 py-3 border-l-4 border-blue-500 animate-fadeIn flex items-start gap-3 max-w-xs">
        <div className="text-blue-600 text-xl mt-1">🔔</div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => onClose(), 200);
          }}
          className="ml-2 text-gray-400 hover:text-gray-600 text-lg"
          title="Stäng"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
