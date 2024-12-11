import React, { useState, useEffect } from 'react';
import PollList from '../components/PollList';

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // Simulate loading delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Available Polls</h1>
        {loading ? (
          <div className="text-center text-gray-500">Loading polls...</div>
        ) : (
          <PollList />
        )}
      </div>
    </div>
  );
};

export default Home;
