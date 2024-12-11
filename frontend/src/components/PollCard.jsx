import React from "react";
import { Link } from "react-router-dom";

const PollCard = ({ poll }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h2 className="text-lg font-semibold mb-2">{poll.title}</h2>
      <Link
        to={`/polls/${poll.poll_id}`}
        className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 inline-block"
      >
        View Poll
      </Link>
    </div>
  );
};

export default PollCard;
