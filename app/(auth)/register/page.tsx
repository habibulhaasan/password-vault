import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Account — Password Vault",
  description: "Register a new secure password vault account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
