"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

const DiningPhilosophers = () => {
  const [numPhilosophers, setNumPhilosophers] = useState(3);
  const [philosophers, setPhilosophers] = useState<string[]>([]);
  const [forks, setForks] = useState<number[]>([]);
  const [timers, setTimers] = useState<number[]>([]);
  const [strategies, setStrategies] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [starvationTime, setStarvationTime] = useState(10);
  const [explanation, setExplanation] = useState('Simulation not started');
  
  // New state variables for statistics
  const [eatenCount, setEatenCount] = useState<number[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<number[]>([]);
  const [thinkingTimes, setThinkingTimes] = useState<number[]>([]);
  const [totalThinkingTime, setTotalThinkingTime] = useState<number[]>([]);

  // New state for action strategy
  const [actionStrategy, setActionStrategy] = useState('round-robin');
  const [currentPhilosopher, setCurrentPhilosopher] = useState(-1);

  const resetSimulation = useCallback(() => {
    
    setPhilosophers(Array(numPhilosophers).fill('thinking'));

    setForks(Array(numPhilosophers).fill(-1));

    setTimers(Array(numPhilosophers).fill(0));

    setStrategies(Array(numPhilosophers).fill('greedy'));

    setEatenCount(Array(numPhilosophers).fill(0));

    setFailedAttempts(Array(numPhilosophers).fill(0));

    setThinkingTimes(Array(numPhilosophers).fill([]));

    setTotalThinkingTime(Array(numPhilosophers).fill(0));

    setIsRunning(false);
    setExplanation('Simulation reset. All philosophers are thinking.');
    setCurrentPhilosopher(-1);
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
      default:
        return 0;
    }
  }, [actionStrategy, currentPhilosopher, numPhilosophers, timers, philosophers]);

  const philosopherAction = useCallback((index : number) => {
    setPhilosophers(prev => {
      const newState = [...prev];
      const leftFork = index;
      const rightFork = (index - 1 + numPhilosophers) % numPhilosophers;

      if (newState[index] === 'thinking') {
        const canEat = forks[leftFork] === -1 && forks[rightFork] === -1;

        if (canEat || (strategies[index] === 'greedy' && (forks[leftFork] === index || forks[leftFork] === -1) && (forks[rightFork] === index) || forks[rightFork] === -1)) {
          newState[index] = 'eating';
          setForks(prevForks => {
            const newForks = [...prevForks];
            newForks[leftFork] = index;
            newForks[rightFork] = index;
            return newForks;
          });
          setTimers(prevTimers => {
            const newTimers = [...prevTimers];
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
            newTimes[index] = timers[index];
            return newTimes;
          });
          setTotalThinkingTime(prev => {
            const newTotal = [...prev];
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
              if (newForks[leftFork] === -1) {
                newForks[leftFork] = index;
                pickedUpForks++;
              }
              if (newForks[rightFork] === -1) {
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
        newState[index] = 'thinking';
        setForks(prevForks => {
          const newForks = [...prevForks];
          newForks[leftFork] = -1;
          newForks[rightFork] = -1;
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
            newState[index] = 'dead';
            return newState;
          });
          setForks(prevForks => {
            const newForks = [...prevForks];
            if (newForks[index] === index) newForks[index] = -1;
            if (newForks[(index - 1 + numPhilosophers) % numPhilosophers] === index) newForks[(index - 1 + numPhilosophers) % numPhilosophers] = -1;
            return newForks;
          });
          setExplanation(`Philosopher ${index + 1} has starved to death!`);
        }
      });

      return newTimers;
    });
  }, [numPhilosophers, philosopherAction, speed, philosophers, starvationTime, selectNextPhilosopher]);

  useEffect(() => {
    let interval : NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(simulationTick, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, speed, simulationTick]);

  const getPhilosopherEmoji = (state : string) => {
    switch (state) {
      case 'thinking': return '🤔';
      case 'eating': return '🍽️';
      case 'dead': return '💀';
      default: return '🤔';
    }
  };

  const getForkColor = (forkIndex : number) => {
    if (forks[forkIndex] !== -1) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  };

  const getStrategyColor = (strategy : string) => {
    switch (strategy) {
      case 'normal': return 'bg-blue-200';
      case 'greedy': return 'bg-red-200';
      default: return 'bg-blue-200';
    }
  };

  const cycleStrategy = (index : number) => {
    setStrategies(prev => {
      const newStrategies = [...prev];
      switch (newStrategies[index]) {
        case 'normal': newStrategies[index] = 'greedy'; break;
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
          min={10}
          max={2000}
          step={10}
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
      <br />
      <br />
      <br />
      <br />
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
        <label className="block mb-2">Scheduling Algorithm:</label>
        <Select value={actionStrategy} onValueChange={setActionStrategy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="round-robin">Round-Robin</SelectItem>
            <SelectItem value="random">Random</SelectItem>
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
