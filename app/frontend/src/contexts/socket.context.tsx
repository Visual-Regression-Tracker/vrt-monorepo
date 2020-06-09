import * as React from "react";
import socketIOClient from "socket.io-client";
import { useBuildState, useBuildDispatch, addBuild } from "./build.context";
import { Build, TestRun } from "../types";
import { useTestRunDispatch, addTestRun } from "./testRun.context";

interface IConnectAction {
  type: "connect";
  payload: SocketIOClient.Socket;
}

interface IClearAction {
  type: "clear";
}

type IAction = IConnectAction | IClearAction;

type Dispatch = (action: IAction) => void;
type State = { socket: SocketIOClient.Socket | undefined };

type SocketProviderProps = { children: React.ReactNode };

const SocketStateContext = React.createContext<State | undefined>(undefined);
const SocketDispatchContext = React.createContext<Dispatch | undefined>(
  undefined
);

const initialState: State = {
  socket: undefined,
};

function socketReducer(state: State, action: IAction): State {
  switch (action.type) {
    case "connect": {
      return { socket: action.payload };
    }
    default:
      return state;
  }
}

function SocketProvider({ children }: SocketProviderProps) {
  const [state, dispatch] = React.useReducer(socketReducer, initialState);
  const { selectedBuildId } = useBuildState();
  const testRunDispatch = useTestRunDispatch();
  const buildDispatch = useBuildDispatch();

  React.useEffect(() => {
    connect(dispatch);
  }, []);

  React.useEffect(() => {
    if (state.socket) {
      state.socket.removeAllListeners();

      state.socket.on("build_created", function (build: Build) {
        addBuild(buildDispatch, build);
      });

      state.socket.on(`testRun_created`, function (testRun: TestRun) {
        if (testRun.buildId === selectedBuildId) {
          addTestRun(testRunDispatch, testRun);
        }
      });
    }
  }, [state.socket, selectedBuildId, buildDispatch, testRunDispatch]);

  return (
    <SocketStateContext.Provider value={state}>
      <SocketDispatchContext.Provider value={dispatch}>
        {children}
      </SocketDispatchContext.Provider>
    </SocketStateContext.Provider>
  );
}

function useSocketState() {
  const context = React.useContext(SocketStateContext);
  if (context === undefined) {
    throw new Error("must be used within a SocketProvider");
  }
  return context;
}

function useSocketDispatch() {
  const context = React.useContext(SocketDispatchContext);
  if (context === undefined) {
    throw new Error("must be used within a SocketProvider");
  }
  return context;
}

function connect(dispatch: Dispatch) {
  const socket = socketIOClient("http://127.0.0.1:4201");
  dispatch({ type: "connect", payload: socket });
  console.log("Socket connected");
}

export { SocketProvider, useSocketState, useSocketDispatch, connect };
