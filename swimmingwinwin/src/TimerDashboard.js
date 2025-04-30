import React, { useState, useRef } from 'react';

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

const TimerCard = ({ lane, name, time, status, color }) => (
  <div className={`rounded-2xl shadow-xl bg-white border-4 ${color} p-4`}>
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xl font-bold text-blue-700">Lane {lane}</div>
      <div className="text-md text-gray-800 italic">{name || 'Name Not Set'}</div>
      <div className="text-3xl font-mono text-black tracking-wide">{formatTime(time)}</div>
      {status && <div className="text-sm font-semibold text-gray-600">{status.toUpperCase()}</div>}
    </div>
  </div>
);

const ScoreBoard = ({ scores }) => {
  const sorted = [...scores].sort((a, b) => a.time - b.time);
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-xl font-bold mb-4 text-blue-800">🏆 Score Dashboard</h2>
      <table className="w-full text-left border border-blue-200 rounded-lg overflow-hidden">
        <thead className="bg-blue-100">
          <tr>
            <th className="p-2 border-r border-blue-200">Position</th>
            <th className="p-2 border-r border-blue-200">Lane</th>
            <th className="p-2 border-r border-blue-200">Name</th>
            <th className="p-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((entry, index) => (
            <tr key={index} className="even:bg-blue-50">
              <td className="p-2 border-r border-blue-100">
                {index === 0
                  ? '🥇 1st'
                  : index === 1
                  ? '🥈 2nd'
                  : index === 2
                  ? '🥉 3rd'
                  : '🐢 Last'}
              </td>
              <td className="p-2 border-r border-blue-100">{entry.lane}</td>
              <td className="p-2 border-r border-blue-100">{entry.name}</td>
              <td className="p-2">{formatTime(entry.time)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SwimTimerDashboard = () => {
  const initialTimers = [
    { lane: 1, name: '', time: 0, finished: false },
    { lane: 2, name: '', time: 0, finished: false },
    { lane: 3, name: '', time: 0, finished: false },
    { lane: 4, name: '', time: 0, finished: false },
  ];

  const [timers, setTimers] = useState(initialTimers);
  const [swimProgress, setSwimProgress] = useState([0, 0, 0, 0]);
  const [animationInterval, setAnimationInterval] = useState(null);
  const [scoreboard, setScoreboard] = useState([]);
  const [timerColor, setTimerColor] = useState('border-gray-300');
  const swimRates = useRef([1, 1.2, 0.9, 1.1]);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  const handleStart = () => {
    clearInterval(intervalRef.current);
    clearInterval(animationInterval);
    setTimers(prev => prev.map(t => ({ ...t, time: 0, finished: false })));
    setSwimProgress([0, 0, 0, 0]);
    setScoreboard([]);
    setTimerColor('border-green-500');
    setIsPaused(false);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setTimers(prev =>
        prev.map((t, index) =>
          t.finished ? t : { ...t, time: (now - startTimeRef.current) * swimRates.current[index] }
        )
      );
    }, 10);

    const swimAnim = setInterval(() => {
      setSwimProgress(prev =>
        prev.map((progress, index) => {
          if (timers[index].finished) return progress;
          let newProgress = progress + 1 / swimRates.current[index];
          if (newProgress >= 100) {
            newProgress = 100;
            setTimers(t => {
              const now = Date.now();
              const updated = [...t];
              updated[index].time = (now - startTimeRef.current) * swimRates.current[index];
              updated[index].finished = true;
              setScoreboard(score => {
                const exists = score.find(s => s.lane === updated[index].lane);
                return exists ? score : [...score, updated[index]];
              });
              return updated;
            });
          }
          return newProgress;
        })
      );
    }, 70);

    setAnimationInterval(swimAnim);
  };

  const handleStopAll = () => {
    clearInterval(intervalRef.current);
    clearInterval(animationInterval);
    setTimerColor('border-red-500');
    setIsPaused(true);
  };

  const handleContinue = () => {
    if (!isPaused) return;
    setTimerColor('border-blue-500');
    setIsPaused(false);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setTimers(prev =>
        prev.map((t, index) =>
          t.finished ? t : { ...t, time: t.time + (now - startTimeRef.current) * swimRates.current[index] }
        )
      );
    }, 10);

    const swimAnim = setInterval(() => {
      setSwimProgress(prev =>
        prev.map((progress, index) => {
          if (timers[index].finished) return progress;
          let newProgress = progress + 1 / swimRates.current[index];
          if (newProgress >= 100) {
            newProgress = 100;
            setTimers(t => {
              const now = Date.now();
              const updated = [...t];
              updated[index].time += (now - startTimeRef.current) * swimRates.current[index];
              updated[index].finished = true;
              setScoreboard(score => {
                const exists = score.find(s => s.lane === updated[index].lane);
                return exists ? score : [...score, updated[index]];
              });
              return updated;
            });
          }
          return newProgress;
        })
      );
    }, 70);

    setAnimationInterval(swimAnim);
  };

  const handleNameChange = (laneNumber, name) => {
    setTimers(prev =>
      prev.map(t =>
        t.lane === laneNumber ? { ...t, name } : t
      )
    );
  };

  const getSwimmerStatus = (lane) => {
    const finishedTimers = timers.filter(t => t.finished);
    if (finishedTimers.length < 4) return '';
    const sorted = [...finishedTimers].sort((a, b) => a.time - b.time);
    if (sorted[0].lane === lane) return 'fastest';
    if (sorted[3].lane === lane) return 'slowest';
    return 'mid swimmer';
  };

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-center space-x-4">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-md text-lg"
            onClick={handleStart}
          >
            START
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-md text-lg"
            onClick={handleContinue}
          >
            CONTINUE
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl shadow-md text-lg"
            onClick={handleStopAll}
          >
            STOP ALL
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {timers.map(({ lane, name, time }) => (
            <div key={lane}>
              <input
                type="text"
                placeholder="Enter name"
                className="w-full mb-2 px-4 py-2 border rounded-md"
                value={name}
                onChange={e => handleNameChange(lane, e.target.value)}
              />
              <TimerCard lane={lane} name={name} time={time} status={getSwimmerStatus(lane)} color={timerColor} />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="relative bg-gradient-to-b from-blue-300 to-blue-500 rounded-xl h-72 overflow-hidden border-4 border-blue-600">
            {[1, 2, 3, 4].map((lane, idx) => (
              <div key={lane} className="absolute left-0 w-full h-18 border-b border-white text-white font-bold px-4 flex items-center" style={{ top: `${idx * 72}px` }}>
                <span>Lane {lane}</span>
              </div>
            ))}
            <div className="absolute top-0 right-0 h-full w-2 bg-yellow-400 z-10"></div>
            {swimProgress.map((progress, index) => (
              <div
                key={index}
                className="absolute text-2xl"
                style={{
                  top: `${index * 72 + 20}px`,
                  left: `${Math.min(progress, 100)}%`,
                  transition: 'left 0.07s linear',
                  zIndex: 20,
                }}
              >
                🏊
              </div>
            ))}
          </div>
        </div>

        <ScoreBoard scores={scoreboard} />
      </div>
    </div>
  );
};

export default SwimTimerDashboard;