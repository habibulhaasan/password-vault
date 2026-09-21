import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In — Password Vault",
  description: "Sign in to access your secure password vault",
};

export default function LoginPage() {
  return <LoginForm />;
}
