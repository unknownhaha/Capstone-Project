
'use client'
import style from "./header.module.css"
import { UploadButton } from "./upload";
import { useState } from "react";
interface Prop {
    firstName : string;
    lastName : string;
    profileImg : string;
    isEdit: boolean; 
    onChange: (field: string, value: string) => void; 
}

export default function Header({firstName, lastName, profileImg, isEdit,onChange}: Prop) {
    const [isUploading, setIsUploading] = useState(false);
  return (
    <div className={style.container}>
            <div className={`${style.imgWrapper} ${isEdit ? style.editing : ''}`}>
                    <img src={profileImg || "next.svg"} alt="Profile Picture" className={style.img} />
                       <UploadButton 
                            endpoint="profileImg"
                            onUploadBegin={() => {
                                setIsUploading(true);
                            }}
                            className={style.uploadContainer}
                            appearance={{
                                button: style.uploadBtn,
                                container: style.uploadContainer,
                                allowedContent: style.hideAllowedContent,
                            }}
                            content={{
                                button: isEdit ? (
                                    <svg
                                      className={style.overlay}
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden
                                    >
                                      <path d="M12 20h9" />
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                    </svg>
                                ) : (
                                    <span className={style.emptyButton} aria-hidden />
                                ),
                                allowedContent: "",
                            }}
                            onClientUploadComplete={(res) => {
                               const url = res?.[0]?.url || res?.[0]?.ufsUrl;

                                if (url) {
                                onChange("profileImg", url); 
                                }
                                
                                setIsUploading(false);
                            }}
                            onUploadError={() => {
                                setIsUploading(false);
                            }}
                            disabled={!isEdit || isUploading}
                            />
                </div>

      <div className={style.name}>
        {!isEdit ? (
          <>
            <p>{firstName}</p>
            <p>{lastName}</p>
          </>
        ) : (
          <>
            <input
              value={firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
            <input
              value={lastName}
              onChange={(e) => onChange("lastName", e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  );
}