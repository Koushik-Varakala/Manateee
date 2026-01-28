import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useHealth() {
  return useQuery({
    queryKey: [api.health.check.path],
    queryFn: async () => {
      const res = await fetch(api.health.check.path);
      if (!res.ok) throw new Error("Health check failed");
      return api.health.check.responses[200].parse(await res.json());
    },
    // Don't retry health checks aggressively
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
