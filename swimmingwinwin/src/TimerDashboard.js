import React, { useState, useEffect, useRef } from 'react';

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const milliseconds = ms % 1000;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}.${Math.floor(milliseconds / 10)
    .toString()
    .padStart(2, '0')}`;
};

const TimerCard = ({ lane, name, time, onStop }) => (
  <div className="rounded-2xl shadow-xl bg-white">
    <div className="p-6 space-y-3">
      <div className="text-xl font-bold text-blue-600">Lane {lane}</div>
      <div className="text-lg text-gray-700">{name || 'Waiting...'}</div>
      <div className="text-3xl font-mono text-black">{formatTime(time)}</div>
      <button
        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-xl shadow"
        onClick={() => onStop(lane)}
      >
        STOP
      </button>
    </div>
  </div>
);

const SwimTimerDashboard = () => {
  const [timers, setTimers] = useState([
    { lane: 1, name: '', time: 0 },
    { lane: 2, name: '', time: 0 },
    { lane: 3, name: '', time: 0 },
    { lane: 4, name: '', time: 0 },
  ]);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleStart = () => {
    if (running) return;
    setRunning(true);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setTimers(prev =>
        prev.map(t => ({ ...t, time: now - startTime }))
      );
    }, 10);
  };

  const handleStop = (laneNumber) => {
    setTimers(prev =>
      prev.map(t =>
        t.lane === laneNumber ? { ...t, running: false } : t
      )
    );
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const handleNameChange = (laneNumber, name) => {
    setTimers(prev =>
      prev.map(t =>
        t.lane === laneNumber ? { ...t, name } : t
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-center">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-md text-lg transition"
            onClick={handleStart}
          >
            START
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {timers.map(({ lane, name, time }) => (
            <div key={lane}>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={name}
                onChange={e => handleNameChange(lane, e.target.value)}
              />
              <TimerCard lane={lane} name={name} time={time} onStop={handleStop} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SwimTimerDashboard;
