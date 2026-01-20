import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Check if user is authenticated
  // const isAuthenticated = await checkAuth();
  // if (isAuthenticated) return <Redirect href="/(dashboard)" />;

  return <Redirect href="/(auth)/login" />;
}
