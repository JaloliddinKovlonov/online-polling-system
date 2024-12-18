import React, { useState, useEffect, useContext } from 'react';
import PollCard from './PollCard';
import axios from "axios";
import { AuthContext } from "../context/AuthContext"; // Assuming you have an AuthContext

const PollList = () => {
  const [polls, setPolls] = useState([]);
  const { auth } = useContext(AuthContext); // Get the auth token from context

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/polls`, {
          headers: {
            Authorization: `Bearer ${auth.token}`, // Include the token in the header
          },
        });
        setPolls(response.data);
      } catch (error) {
        console.error("Error fetching polls:", error);
      }
    };

    fetchPolls();
  }, [auth]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard key={poll.poll_id} poll={poll} />
      ))}
    </div>
  );
};

export default PollList;
