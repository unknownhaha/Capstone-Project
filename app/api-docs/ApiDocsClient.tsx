"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./api-docs.module.css";

declare global {
  interface Window {
    SwaggerUIBundle?: (config: {
      domNode: HTMLElement | null;
      url: string;
      docExpansion?: string;
      defaultModelsExpandDepth?: number;
      persistAuthorization?: boolean;
      requestInterceptor?: (req: { credentials?: string }) => unknown;
    }) => void;
  }
}

/** Swagger UI stores pasted tokens in localStorage — separate from browser cookies. */
function clearSwaggerStoredAuth() {
  for (const key of Object.keys(localStorage)) {
    if (key.toLowerCase().includes("swagger")) {
      localStorage.removeItem(key);
    }
  }
  window.location.reload();
}

const SWAGGER_CSS = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui.css";
const SWAGGER_BUNDLE = "https://unpkg.com/swagger-ui-dist@5.18.2/swagger-ui-bundle.js";

export default function ApiDocsClient() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = SWAGGER_CSS;
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = SWAGGER_BUNDLE;
    script.async = true;
    script.onload = () => {
      window.SwaggerUIBundle?.({
        domNode: containerRef.current,
        url: "/api/openapi",
        docExpansion: "list",
        defaultModelsExpandDepth: 0,
        persistAuthorization: false,
        requestInterceptor: (req: { credentials?: string }) => {
          req.credentials = "include";
          return req;
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      link.remove();
      script.remove();
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>API reference · เอกสาร API</h1>
        <p className={styles.subtitle}>
          OpenAPI spec:{" "}
          <Link href="/api/openapi">/api/openapi</Link>
          {" · "}
          <Link href="/login">Log in</Link>
          {
            " on this site first — protected calls use your browser cookie automatically (you may not need Authorize at all)."
          }
        </p>
        <div className={styles.authNote}>
          <strong>Two different “logins”</strong>
          <ul>
            <li>
              <strong>Browser session</strong> — cookie after <Link href="/login">/login</Link>.
              Deleting only <code>authjs.session-token</code> may not be enough; also check{" "}
              <code>__Secure-authjs.session-token</code> on HTTPS, or delete all cookies for this
              site.
            </li>
            <li>
              <strong>Swagger Authorize box</strong> — optional pasted JWT. That is saved by Swagger
              (not the same as the cookie). There is often <em>no Logout button</em> unless you
              authorized through that dialog; use the button below to clear it.
            </li>
          </ul>
          <button type="button" className={styles.clearAuthBtn} onClick={clearSwaggerStoredAuth}>
            Clear Swagger stored auth and reload
          </button>
        </div>
        <details className={styles.stepsDetails}>
          <summary>Optional: manual Authorize (paste cookie value)</summary>
          <ol className={styles.steps}>
            <li>
              DevTools → Application → Cookies → copy <strong>Value</strong> of{" "}
              <code>authjs.session-token</code> or <code>__Secure-authjs.session-token</code>.
            </li>
            <li>
              Click <strong>Authorize</strong> → paste into <code>sessionCookie</code> → Authorize →
              Close. To undo: open Authorize again, clear the field, Authorize, or use the clear
              button above.
            </li>
          </ol>
        </details>
      </header>
      <div ref={containerRef} className={styles.swagger} />
    </div>
  );
}
