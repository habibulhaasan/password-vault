import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Reset Password — Password Vault",
  description: "Request a password reset link for your account",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
