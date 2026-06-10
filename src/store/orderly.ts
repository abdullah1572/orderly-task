import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { OrderlyKeypair } from "../lib/orderly";

// types and functions related to Orderly account management
export type OnboardingStep =
  | "not_connected"
  | "connected"
  | "registering"
  | "registered"
  | "adding_key"
  | "ready";

interface OrderlyState {
  walletAddress: string | null;
  chainId: number | null;
  accountId: string | null;
  keypair: OrderlyKeypair | null;
  step: OnboardingStep;
}

// load and save to localStorage 
function loadPersistedState(): Partial<OrderlyState> {
  try {
    const raw = localStorage.getItem("orderly-session");
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function savePersistedState(state: OrderlyState) {
  try {
    // Only persist accountId and keypair
    localStorage.setItem(
      "orderly-session",
      JSON.stringify({
        accountId: state.accountId,
        keypair: state.keypair,
        step: state.step,
      })
    );
  } catch {
    // ignore
  }
}

// initial state with persisted values if available
const persisted = loadPersistedState();

const initialState: OrderlyState = {
  walletAddress: null,
  chainId: null,
  accountId: persisted.accountId ?? null,
  keypair: persisted.keypair ?? null,
  step: (persisted.step as OnboardingStep) ?? "not_connected",
};

// slice for orderly state management
const orderlySlice = createSlice({
  name: "orderly",
  initialState,
  reducers: {
    setWallet(state, action: PayloadAction<{ address: string; chainId: number }>) {
      state.walletAddress = action.payload.address;
      state.chainId = action.payload.chainId;
      state.step = "connected";
    },
    clearWallet(state) {
      state.walletAddress = null;
      state.chainId = null;
      state.step = "not_connected";
    },
    setAccountId(state, action: PayloadAction<string>) {
      state.accountId = action.payload;
    },
    setKeypair(state, action: PayloadAction<OrderlyKeypair>) {
      state.keypair = action.payload;
    },
    setStep(state, action: PayloadAction<OnboardingStep>) {
      state.step = action.payload;
    },
    reset(state) {
      state.walletAddress = null;
      state.chainId = null;
      state.accountId = null;
      state.keypair = null;
      state.step = "not_connected";
    },
  },
});

export const {
  setWallet,
  clearWallet,
  setAccountId,
  setKeypair,
  setStep,
  reset,
} = orderlySlice.actions;

// store configuration
export const store = configureStore({
  reducer: {
    orderly: orderlySlice.reducer,
  },
});

// Persist on every state change
store.subscribe(() => {
  savePersistedState(store.getState().orderly);
});

// types for use in components and hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Typed hooks for using the store in components 
export function useOrderlyStore() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.orderly);

  return {
    // state
    walletAddress: state.walletAddress,
    chainId: state.chainId,
    accountId: state.accountId,
    keypair: state.keypair,
    step: state.step,

    setWallet: (address: string, chainId: number) =>
      dispatch(setWallet({ address, chainId })),
    clearWallet: () => dispatch(clearWallet()),
    setAccountId: (id: string) => dispatch(setAccountId(id)),
    setKeypair: (kp: OrderlyKeypair) => dispatch(setKeypair(kp)),
    setStep: (s: OnboardingStep) => dispatch(setStep(s)),
    reset: () => dispatch(reset()),
  };
}
