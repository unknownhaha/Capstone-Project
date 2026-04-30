"use client";

import styles from "./register.module.css";

export default function RegisterPage() {
  return (
    <div className={styles.container}>
      <div className={styles.box}>

        <h2 className={styles.title}>Register</h2>

        <div className={styles.form}>
          <label>First Name</label>
          <input type="text" className={styles.input} />

          <label>Surname</label>
          <input type="text" className={styles.input} />

          <label>Email</label>
          <input type="email" className={styles.input} />

          <label>Password</label>
          <input type="password" className={styles.input} />

          <label>Confirm password</label>
          <input type="password" className={styles.input} />
        </div>

        <button className={styles.button}>Sign up</button>

      </div>
    </div>
  );
}