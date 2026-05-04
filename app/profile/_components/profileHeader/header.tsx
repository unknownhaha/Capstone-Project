
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
                            appearance={{
                                button: style.uploadBtn,
                                allowedContent: "hidden",
                            }}
                            content={{
                                button: isEdit ? (
                                    <img src="edit.png" alt="Edit" className={style.overlay} />
                                ) : (
                                    <></>  
                                )
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