
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
    onLockedPhotoInteraction?: () => void;
    onLockedNameInteraction?: () => void;
    photoLockedHighlight?: boolean;
    nameLockedHighlight?: boolean;
    lockedFieldMessage?: string;
}

export default function Header({
  firstName,
  lastName,
  profileImg,
  isEdit,
  onChange,
  onLockedPhotoInteraction,
  onLockedNameInteraction,
  photoLockedHighlight = false,
  nameLockedHighlight = false,
  lockedFieldMessage = "",
}: Prop) {
    const [isUploading, setIsUploading] = useState(false);
  return (
    <div className={style.container}>
            <div className={style.photoCol}>
            <div
              className={`${style.imgWrapper} ${isEdit ? style.editing : ""} ${!isEdit && onLockedPhotoInteraction ? style.imgLocked : ""} ${photoLockedHighlight ? style.imgLockedHighlight : ""}`}
              onClick={!isEdit ? onLockedPhotoInteraction : undefined}
              onKeyDown={
                !isEdit && onLockedPhotoInteraction
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onLockedPhotoInteraction();
                      }
                    }
                  : undefined
              }
              role={!isEdit && onLockedPhotoInteraction ? "button" : undefined}
              tabIndex={!isEdit && onLockedPhotoInteraction ? 0 : undefined}
              aria-label={!isEdit ? "Profile photo, edit mode required to change" : undefined}
            >
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
            {photoLockedHighlight && lockedFieldMessage ? (
              <p className={style.lockedFieldMessage} role="alert">
                {lockedFieldMessage}
              </p>
            ) : null}
            </div>

      <div
        className={`${style.name} ${!isEdit && onLockedNameInteraction ? style.nameLocked : ""} ${nameLockedHighlight ? style.nameLockedHighlight : ""}`}
        onClick={!isEdit ? onLockedNameInteraction : undefined}
        onKeyDown={
          !isEdit && onLockedNameInteraction
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onLockedNameInteraction();
                }
              }
            : undefined
        }
        role={!isEdit && onLockedNameInteraction ? "button" : undefined}
        tabIndex={!isEdit && onLockedNameInteraction ? 0 : undefined}
      >
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
        {nameLockedHighlight && lockedFieldMessage ? (
          <p className={style.lockedFieldMessage} role="alert">
            {lockedFieldMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}