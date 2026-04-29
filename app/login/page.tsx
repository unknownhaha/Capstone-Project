import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>

        <div className={styles.avatar}>
          <div className={styles.avatarInner}></div>
        </div>

        <input type="text" placeholder="Username" className={styles.input} />
        <input type="password" placeholder="Password" className={styles.input} />

        <div className={styles.options}>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <span className={styles.forgot}>Forgot Password?</span>
        </div>

        <button className={styles.loginBtn}>LOGIN</button>

        <p className={styles.signup}>Sign up</p>

      </div>
    </div>
  );
}