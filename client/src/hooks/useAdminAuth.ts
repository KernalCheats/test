import { useQuery } from "@tanstack/react-query";

export function useAdminAuth() {
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch
  };
}