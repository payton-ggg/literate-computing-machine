import ResetPasswordForm from "../components/ResetPasswordForm";
import styles from "./AuthPage.module.css";

interface Props {
  token: string;
}

export default function ResetPasswordPage({ token }: Props) {
  return (
    <div className={styles.authPage}>
      <ResetPasswordForm token={token} />
    </div>
  );
}
