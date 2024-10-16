"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

const DiningPhilosophers = () => {
  const [numPhilosophers, setNumPhilosophers] = useState(5);
  const [philosophers, setPhilosophers] = useState([]);
  const [forks, setForks] = useState([]);
  const [timers, setTimers] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [starvationTime, setStarvationTime] = useState(10);
  const [explanation, setExplanation] = useState('Simulation not started');
  
  // New state variables for statistics
  const [eatenCount, setEatenCount] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState([]);
  const [thinkingTimes, setThinkingTimes] = useState([]);
  const [totalThinkingTime, setTotalThinkingTime] = useState([]);

  // New state for action strategy
  const [actionStrategy, setActionStrategy] = useState('random');
  const [currentPhilosopher, setCurrentPhilosopher] = useState(0);

  const resetSimulation = useCallback(() => {
    // @ts-expect-error "todo: fix type error"
    setPhilosophers(Array(numPhilosophers).fill('thinking'));

    // @ts-expect-error "todo: fix type error"
    setForks(Array(numPhilosophers).fill(null));

    // @ts-expect-error "todo: fix type error"
    setTimers(Array(numPhilosophers).fill(0));

    // @ts-expect-error "todo: fix type error"
    setStrategies(Array(numPhilosophers).fill('normal'));

    // @ts-expect-error "todo: fix type error"
    setEatenCount(Array(numPhilosophers).fill(0));

    // @ts-expect-error "todo: fix type error"
    setFailedAttempts(Array(numPhilosophers).fill(0));

    // @ts-expect-error "todo: fix type error"
    setThinkingTimes(Array(numPhilosophers).fill([]));

    // @ts-expect-error "todo: fix type error"
    setTotalThinkingTime(Array(numPhilosophers).fill(0));

    setIsRunning(false);
    setExplanation('Simulation reset. All philosophers are thinking.');
    setCurrentPhilosopher(0);
  }, [numPhilosophers]);

  useEffect(() => {
    resetSimulation();
  }, [numPhilosophers, resetSimulation]);

  const selectNextPhilosopher = useCallback(() => {
    switch (actionStrategy) {
      case 'random':
        return Math.floor(Math.random() * numPhilosophers);
      case 'round-robin':
        const next = (currentPhilosopher + 1) % numPhilosophers;
        setCurrentPhilosopher(next);
        return next;
      case 'prioritize-starving':
        let maxTimer = -1;
        let starvingPhilosopher = 0;
        timers.forEach((timer, index) => {
          if (philosophers[index] === 'thinking' && timer > maxTimer) {
            maxTimer = timer;
            starvingPhilosopher = index;
          }
        });
        return starvingPhilosopher;
      default:
        return 0;
    }
  }, [actionStrategy, currentPhilosopher, numPhilosophers, timers, philosophers]);

// @ts-expect-error "todo: fix type error"
  const philosopherAction = useCallback((index) => {
    setPhilosophers(prev => {
      const newState = [...prev];
      const leftFork = index;
      const rightFork = (index - 1 + numPhilosophers) % numPhilosophers;

      if (newState[index] === 'thinking') {
        const canEat = forks[leftFork] === null && forks[rightFork] === null;

        if (canEat || (strategies[index] === 'greedy' && forks[leftFork] === index && forks[rightFork] === index)) {
          // @ts-expect-error "todo: fix type error"
          newState[index] = 'eating';
          setForks(prevForks => {
            const newForks = [...prevForks];

            // @ts-expect-error "todo: fix type error"
            newForks[leftFork] = index;

            // @ts-expect-error "todo: fix type error"
            newForks[rightFork] = index;
            return newForks;
          });
          setTimers(prevTimers => {
            const newTimers = [...prevTimers];

            // @ts-expect-error "todo: fix type error"
            newTimers[index] = 0;
            return newTimers;
          });
          setEatenCount(prev => {
            const newCount = [...prev];
            newCount[index]++;
            return newCount;
          });
          setThinkingTimes(prev => {
            const newTimes = [...prev];

            // @ts-expect-error "todo: fix type error"
            newTimes[index].push(timers[index]);
            return newTimes;
          });
          setTotalThinkingTime(prev => {
            const newTotal = [...prev];

            // @ts-expect-error "todo: fix type error"
            newTotal[index] += timers[index];
            return newTotal;
          });
          setExplanation(`Philosopher ${index + 1} started eating.`);
        } else {
          setFailedAttempts(prev => {
            const newAttempts = [...prev];
            newAttempts[index]++;
            return newAttempts;
          });
          if (strategies[index] === 'greedy') {
            let pickedUpForks = 0;
            setForks(prevForks => {
              const newForks = [...prevForks];
              if (newForks[leftFork] === null) {
                // @ts-expect-error "todo: fix type error"
                newForks[leftFork] = index;
                pickedUpForks++;
              }
              if (newForks[rightFork] === null) {
                // @ts-expect-error "todo: fix type error"
                newForks[rightFork] = index;
                pickedUpForks++;
              }
              return newForks;
            });

            if (pickedUpForks === 1) {
              setExplanation(`Greedy Philosopher ${index + 1} picked up one fork and is waiting for the other.`);
            } else {
              setExplanation(`Greedy Philosopher ${index + 1} is waiting for both forks.`);
            }
          } else {
            setExplanation(`Philosopher ${index + 1} tried to eat but couldn't get both forks.`);
          }
        }
      } else if (newState[index] === 'eating') {
        // @ts-expect-error "todo: fix type error"
        newState[index] = 'thinking';
        setForks(prevForks => {
          const newForks = [...prevForks];
          // @ts-expect-error "todo: fix type error"
          newForks[leftFork] = null;
          // @ts-expect-error "todo: fix type error"
          newForks[rightFork] = null;
          return newForks;
        });
        setExplanation(`Philosopher ${index + 1} finished eating and is now thinking.`);
      }

      return newState;
    });
  }, [forks, numPhilosophers, strategies, timers]);

  const simulationTick = useCallback(() => {
    const selectedPhilosopher = selectNextPhilosopher();
    philosopherAction(selectedPhilosopher);

// @ts-expect-error "todo: fix type error"
    setTimers(prevTimers => {
      const newTimers = prevTimers.map((timer, index) => {
        if (philosophers[index] === 'thinking') {
          return timer + speed / 1000;
        }
        return 0;
      });

      newTimers.forEach((timer, index) => {
        if (timer >= starvationTime && philosophers[index] !== 'dead') {
          setPhilosophers(prev => {
            const newState = [...prev];
            // @ts-expect-error "todo: fix type error"
            newState[index] = 'dead';
            return newState;
          });
          setForks(prevForks => {
            const newForks = [...prevForks];
            // @ts-expect-error "todo: fix type error"
            if (newForks[index] === index) newForks[index] = null;
            // @ts-expect-error "todo: fix type error"
            if (newForks[(index - 1 + numPhilosophers) % numPhilosophers] === index) newForks[(index - 1 + numPhilosophers) % numPhilosophers] = null;
            return newForks;
          });
          setExplanation(`Philosopher ${index + 1} has starved to death!`);
        }
      });

      return newTimers;
    });
  }, [numPhilosophers, philosopherAction, speed, philosophers, starvationTime, selectNextPhilosopher]);

  useEffect(() => {
    // @ts-expect-error "todo: fix type error"
    let interval;
    if (isRunning) {
      interval = setInterval(simulationTick, speed);
    }
    // @ts-expect-error "todo: fix type error"
    return () => clearInterval(interval);
  }, [isRunning, speed, simulationTick]);

// @ts-expect-error "todo: fix type error"
  const getPhilosopherEmoji = (state) => {
    switch (state) {
      case 'thinking': return '🤔';
      case 'eating': return '🍽️';
      case 'dead': return '💀';
      default: return '🤔';
    }
  };

// @ts-expect-error "todo: fix type error"
  const getForkColor = (forkIndex) => {
    if (forks[forkIndex] !== null) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

// @ts-expect-error "todo: fix type error"
  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'normal': return 'bg-blue-200';
      case 'polite': return 'bg-green-200';
      case 'greedy': return 'bg-red-200';
      default: return 'bg-blue-200';
    }
  };

// @ts-expect-error "todo: fix type error"
  const cycleStrategy = (index) => {
    setStrategies(prev => {
      const newStrategies = [...prev];
      switch (newStrategies[index]) {
        // @ts-expect-error "todo: fix type error"
        case 'normal': newStrategies[index] = 'polite'; break;
          // @ts-expect-error "todo: fix type error"
        case 'polite': newStrategies[index] = 'greedy'; break;
          // @ts-expect-error "todo: fix type error"
        case 'greedy': newStrategies[index] = 'normal'; break;
      }
      return newStrategies;
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dining Philosophers Problem</h1>
      <div className="mb-4">
        <label className="block mb-2">Number of Philosophers:</label>
        <Slider
          value={[numPhilosophers]}
          onValueChange={(value) => setNumPhilosophers(value[0])}
          min={3}
          max={10}
          step={1}
          className="w-64"
        />
        <span className="ml-2">{numPhilosophers}</span>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Simulation Speed (ms):</label>
        <Slider
          value={[speed]}
          onValueChange={(value) => setSpeed(value[0])}
          min={100}
          max={2000}
          step={100}
          className="w-64"
        />
        <span className="ml-2">{speed} ms</span>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Starvation Time (seconds):</label>
        <Slider
          value={[starvationTime]}
          onValueChange={(value) => setStarvationTime(value[0])}
          min={5}
          max={30}
          step={1}
          className="w-64"
        />
        <span className="ml-2">{starvationTime} s</span>
      </div>
      <div className="relative w-80 h-80 mx-auto mb-4">
        {philosophers.map((state, index) => {
          const angle = (index / numPhilosophers) * 2 * Math.PI;
          const x = 140 * Math.cos(angle) + 160;
          const y = 140 * Math.sin(angle) + 160;
          return (
            <div
              key={index}
              className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center transition-colors duration-300 ${
                state === 'thinking' ? 'bg-blue-200' : state === 'eating' ? 'bg-green-200' : 'bg-gray-200'
              } ${getStrategyColor(strategies[index])}`}
              style={{ left: `${x}px`, top: `${y}px` }}
              onClick={() => cycleStrategy(index)}
            >
              <div className="text-2xl">{getPhilosopherEmoji(state)}</div>
              <div className="text-xs font-semibold">{index + 1}</div>
              <div className="text-xs">{strategies[index]}</div>
              {state !== 'dead' && (
                <div className="absolute -bottom-6 text-xs font-semibold">
                  {(starvationTime - timers[index]).toFixed(1)}s
                </div>
              )}
            </div>
          );
        })}
        {forks.map((owner, index) => {
          const leftPhilosopher = (index + 1) % numPhilosophers;
          const rightPhilosopher = index;
          const angle = ((index + 0.5) / numPhilosophers) * 2 * Math.PI;
          const x = 100 * Math.cos(angle) + 160;
          const y = 100 * Math.sin(angle) + 160;
          return (
            <div
              key={`fork-${index}`}
              className={`absolute w-8 h-8 flex flex-col items-center justify-center transition-colors duration-300 ${getForkColor(index)}`}
              style={{ left: `${x}px`, top: `${y}px` }}
            >
              🍴
              {owner !== null && (
                <div className="text-xs font-bold mt-1 bg-white rounded-full w-4 h-4 flex items-center justify-center">
                  {owner + 1}
                </div>
              )}
              
            </div>
          );
        })}
      </div>
      <div className="text-center mb-4 h-12">
        <p className="font-semibold">{explanation}</p>
      </div>
      <div className="flex justify-center space-x-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded flex items-center"
          onClick={() => {
            setIsRunning(!isRunning);
            setExplanation(isRunning ? 'Simulation paused.' : 'Simulation started.');
          }}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
          <span className="ml-2">{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded flex items-center"
          onClick={resetSimulation}
        >
          <RotateCcw size={20} />
          <span className="ml-2">Reset</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-200 rounded flex items-center"
          onClick={() => {
            setIsRunning(false);
            simulationTick();
          }}
        >
          <StepForward size={20} />
          <span className="ml-2">Step</span>
        </button>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Action Strategy:</label>
        <Select value={actionStrategy} onValueChange={setActionStrategy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="random">Random</SelectItem>
            <SelectItem value="round-robin">Round-Robin</SelectItem>
            <SelectItem value="prioritize-starving">Prioritize Starving</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information</h2>
        <div>
          <strong>Forks:</strong> [{forks.map(f => f === null ? 'null' : f + 1).join(', ')}]
        </div>
        <div>
          <strong>Philosophers:</strong> [{philosophers.join(', ')}]
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Statistics</h2>
        <table className="w-full">
          <thead>
            <tr>
              <th>Philosopher</th>
              <th>Times Eaten</th>
              <th>Failed Attempts</th>
              <th>Avg. Thinking Time</th>
            </tr>
          </thead>
          <tbody>
            {philosophers.map((_, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{eatenCount[index]}</td>
                <td>{failedAttempts[index]}</td>
                <td>
                  {eatenCount[index] > 0
                    ? (totalThinkingTime[index] / eatenCount[index]).toFixed(2)
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DiningPhilosophers;
