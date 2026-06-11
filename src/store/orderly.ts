import { configureStore, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import type { OrderlyKeypair } from "../lib/orderly";

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
    localStorage.setItem(
      "orderly-session",
      JSON.stringify({
        accountId: state.accountId,
        keypair: state.keypair,
        // FIX: do NOT persist step — on page reload the wallet may be
        // disconnected, so we must always start from "not_connected".
        // The wagmi reconnect logic will fire and set step to "connected"
        // again if the wallet is still connected.
      })
    );
  } catch {
    // ignore
  }
}

const persisted = loadPersistedState();

const initialState: OrderlyState = {
  walletAddress: null,
  chainId: null,
  accountId: persisted.accountId ?? null,
  keypair: persisted.keypair ?? null,
  // FIX: always start from not_connected — OnboardingPanel's useEffect
  // will set it to "connected" as soon as wagmi re-hydrates the wallet,
  // and to "ready" if the persisted keypair is still valid.
  step: "not_connected",
};

const orderlySlice = createSlice({
  name: "orderly",
  initialState,
  reducers: {
    setWallet(state, action: PayloadAction<{ address: string; chainId: number }>) {
      state.walletAddress = action.payload.address;
      state.chainId = action.payload.chainId;
      // Only move to "connected" if we don't already have a valid keypair
      if (state.step === "not_connected") {
        state.step = state.keypair ? "ready" : "connected";
      }
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
      try { localStorage.removeItem("orderly-session"); } catch { /* ignore */ }
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

export const store = configureStore({
  reducer: {
    orderly: orderlySlice.reducer,
  },
});

store.subscribe(() => {
  savePersistedState(store.getState().orderly);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useOrderlyStore() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.orderly);

  return {
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
