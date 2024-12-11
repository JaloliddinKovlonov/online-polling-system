import React from "react";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <footer className="bg-blue-500 text-white text-center p-4">
        <p>&copy; {new Date().getFullYear()} Online Polling System</p>
      </footer>
    </div>
  );
};

export default Layout;
