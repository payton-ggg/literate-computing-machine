import LoginForm from "../components/LoginForm";
import styles from "./AuthPage.module.css";

interface Props {
  redirectPath: string | null;
}

export default function LoginPage({ redirectPath }: Props) {
  return (
    <div className={styles.authPage}>
      <LoginForm redirectPath={redirectPath} />
    </div>
  );
}
