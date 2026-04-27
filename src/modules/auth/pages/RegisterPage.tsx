import RegisterForm from "../components/RegisterForm";
import styles from "./AuthPage.module.css";

interface Props {
  redirectPath: string | null;
}

export default function RegisterPage({ redirectPath }: Props) {
  return (
    <div className={styles.authPage}>
      <RegisterForm redirectPath={redirectPath} />
    </div>
  );
}
