"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepForward } from 'lucide-react';

const DiningPhilosophers = () => {
  const [numPhilosophers, setNumPhilosophers] = useState(5);
  const [philosophers, setPhilosophers] = useState([]);
  const [forks, setForks] = useState([]);
  const [timers, setTimers] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds between actions
  const [starvationTime, setStarvationTime] = useState(10); // seconds before starvation
  const [explanation, setExplanation] = useState('Simulation not started');

  const resetSimulation = useCallback(() => {
    setPhilosophers(Array(numPhilosophers).fill('thinking'));
    setForks(Array(numPhilosophers).fill(null));
    setTimers(Array(numPhilosophers).fill(0));
    setStrategies(Array(numPhilosophers).fill('normal'));
    setIsRunning(false);
    setExplanation('Simulation reset. All philosophers are thinking.');
  }, [numPhilosophers]);

  useEffect(() => {
    resetSimulation();
  }, [numPhilosophers, resetSimulation]);

const philosopherAction = useCallback((index) => {
  setPhilosophers(prev => {
    const newState = [...prev];
    const leftFork = index;
    const rightFork = (index - 1 + numPhilosophers) % numPhilosophers;

    // Check if the philosopher is currently thinking
    if (newState[index] === 'thinking') {
      // Determine if both forks are available
      const canEat = forks[leftFork] === null && forks[rightFork] === null;

      // If both forks are available, start eating
      if (canEat) {
        newState[index] = 'eating';
        setForks(prevForks => {
          const newForks = [...prevForks];
          newForks[leftFork] = index; // Pick up left fork
          newForks[rightFork] = index; // Pick up right fork
          return newForks;
        });
        setTimers(prevTimers => {
          const newTimers = [...prevTimers];
          newTimers[index] = 0; // Reset timer for the philosopher
          return newTimers;
        });
        setExplanation(`Philosopher ${index + 1} started eating.`);
      } else {
        // Handling for greedy philosophers trying to pick up forks
        if (strategies[index] === 'greedy') {
          if (forks[leftFork] === null) {
            setForks(prevForks => {
              const newForks = [...prevForks];
              newForks[leftFork] = index; // Pick up left fork
              return newForks;
            });

            setExplanation(`Greedy Philosopher ${index + 1} picked up left fork and is waiting for right fork.`);
          } else if (forks[rightFork] === null) {
            setForks(prevForks => {
              const newForks = [...prevForks];
              newForks[rightFork] = index; // Pick up right fork
              return newForks;
            });

            setExplanation(`Greedy Philosopher ${index + 1} picked up right fork and is waiting for left fork.`);
            
          } else {
            // This means both forks are taken, and they can't eat
            setExplanation(`Greedy Philosopher ${index + 1} is waiting for both forks.`);
          }
        } else {
          // Non-greedy philosopher behavior when unable to eat
          setExplanation(`Philosopher ${index + 1} tried to eat but couldn't get both forks.`);
        }
      }

      // Determine if both forks are available
      const canEat2 = forks[leftFork] === null && forks[rightFork] === null;

      if (canEat2) {
        newState[index] = 'eating';
        setForks(prevForks => {
          const newForks = [...prevForks];
          newForks[leftFork] = index; // Pick up left fork
          newForks[rightFork] = index; // Pick up right fork
          return newForks;
        });
        setTimers(prevTimers => {
          const newTimers = [...prevTimers];
          newTimers[index] = 0; // Reset timer for the philosopher
          return newTimers;
        });
        setExplanation(`Philosopher ${index + 1} started eating.`);
      }

    } else if (newState[index] === 'eating') {
      // Philosopher finishes eating and puts down both forks
      newState[index] = 'thinking';
      setForks(prevForks => {
        const newForks = [...prevForks];
        newForks[leftFork] = null; // Put down left fork
        newForks[rightFork] = null; // Put down right fork
        return newForks;
      });
      setExplanation(`Philosopher ${index + 1} finished eating and is now thinking.`);
    }

    return newState;
  });
}, [forks, numPhilosophers, strategies]);



  const simulationTick = useCallback(() => {
    const randomPhilosopher = Math.floor(Math.random() * numPhilosophers);
    philosopherAction(randomPhilosopher);

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
            if (newForks[index] === index) newForks[index] = null;
            if (newForks[(index - 1 + numPhilosophers) % numPhilosophers] === index) newForks[(index - 1 + numPhilosophers) % numPhilosophers] = null;
            return newForks;
          });
          setExplanation(`Philosopher ${index + 1} has starved to death!`);
        }
      });

      return newTimers;
    });
  }, [numPhilosophers, philosopherAction, speed, philosophers, starvationTime]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(simulationTick, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, speed, simulationTick]);

  const getPhilosopherEmoji = (state) => {
    switch (state) {
      case 'thinking': return '🤔';
      case 'eating': return '🍽️';
      case 'dead': return '💀';
      default: return '🤔';
    }
  };

  const getForkColor = (forkIndex) => {
    if (forks[forkIndex] !== null) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'normal': return 'bg-blue-200';
      case 'polite': return 'bg-green-200';
      case 'greedy': return 'bg-red-200';
      default: return 'bg-blue-200';
    }
  };

  const cycleStrategy = (index) => {
    setStrategies(prev => {
      const newStrategies = [...prev];
      switch (newStrategies[index]) {
        case 'normal': newStrategies[index] = 'polite'; break;
        case 'polite': newStrategies[index] = 'greedy'; break;
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
              <div className="text-xs mt-1">
                {leftPhilosopher + 1}/{rightPhilosopher + 1}
              </div>
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
    </div>
  );
};

export default DiningPhilosophers;
