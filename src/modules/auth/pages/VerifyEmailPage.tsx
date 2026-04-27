import VerifyEmailForm from "../components/VerifyEmailForm";
import styles from "./AuthPage.module.css";

interface Props {
  email: string;
}

export default function VerifyEmailPage({ email }: Props) {
  return (
    <div className={styles.authPage}>
      <VerifyEmailForm email={email} />
    </div>
  );
}
