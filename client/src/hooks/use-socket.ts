import { useSocketContext } from "@/lib/SocketContext";

// Re-export the context hook as the main useSocket hook
// This ensures Pages don't need to change their imports
export function useSocket() {
  return useSocketContext();
}
