import React, { useState, useEffect } from 'react';
import PollCard from './PollCard';
import axios from "axios";

const PollList = () => {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/polls")
      .then(response => setPolls(response.data))
      .catch(error => console.error("Error fetching polls:", error));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard key={poll.poll_id} poll={poll} />
      ))}
    </div>
  );
};

export default PollList;
