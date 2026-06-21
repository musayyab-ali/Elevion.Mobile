import { EventEmitter } from "eventemitter3";
export const authEvents = new EventEmitter();
export const emitLogout = () => {
  authEvents.emit("forceLogout");
};
