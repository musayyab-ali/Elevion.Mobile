import { EventEmitter } from "eventemitter3";

// We use an event emitter so the API client can talk to the AuthContext
export const authEvents = new EventEmitter();

export const emitLogout = () => {
  authEvents.emit("forceLogout");
};
