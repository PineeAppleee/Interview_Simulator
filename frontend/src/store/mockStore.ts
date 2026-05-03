import React, { useState, useEffect } from 'react';

// Mock Zustand for environment with no internet
export const createStore = (initialState: any) => {
  let state = initialState;
  const listeners = new Set<(s: any) => void>();
  
  return (selector: (s: any) => any) => {
    const [curr, setCurr] = useState(selector(state));
    
    useEffect(() => {
      const listener = (s: any) => setCurr(selector(s));
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    }, [selector]);

    const setState = (fn: any) => {
      state = typeof fn === 'function' ? fn(state) : fn;
      listeners.forEach(l => l(state));
    };

    return [curr, setState];
  };
};
