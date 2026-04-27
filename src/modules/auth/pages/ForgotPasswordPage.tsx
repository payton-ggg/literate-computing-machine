import ForgotPasswordForm from "../components/ForgotPasswordForm";
import styles from "./AuthPage.module.css";

export default function ForgotPasswordPage() {
  return (
    <div className={styles.authPage}>
      <ForgotPasswordForm />
    </div>
  );
}
