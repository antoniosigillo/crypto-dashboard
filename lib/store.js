import { configureStore } from '@reduxjs/toolkit';
import marketReducer from '@/lib/slices/marketSlice';
import portfolioReducer from '@/lib/slices/portfolioSlice';

export const makeStore = (preloadedState) =>
  configureStore({
    reducer: { market: marketReducer, portfolio: portfolioReducer },
    preloadedState,
  });
