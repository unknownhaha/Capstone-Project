"use client";

import Header from "./profileHeader/header";
import Form from "@/app/_globle_components/Form/form";
import style from "./profile.module.css";
import PhoneShell from "@/app/allproject/_components/PhoneShell";
import AppSidebar from "@/app/allproject/_components/AppSidebar";
import { profileCopy } from "@/app/profile/profile-copy";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

export type UserData = {
  firstName: string;
  lastName: string;
  profileImg: string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  organization: string;
  department: string;
  location: string;
};

type LockedTarget = "photo" | "name" | string;

export default function Profile() {
  const [isEdit, setEdit] = useState<boolean>(false);
  const [preData, setPre] = useState<UserData | null>(null);
  const [newData, setNew] = useState<UserData | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [lockedTarget, setLockedTarget] = useState<LockedTarget | null>(null);
  const { data: session, status } = useSession();

  const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

  const showLockedPrompt = useCallback((target: LockedTarget) => {
    setLockedTarget(target);
    setSaveSuccess(null);
  }, []);

  const enterEditMode = useCallback(() => {
    setSaveError(null);
    setSaveSuccess(null);
    setLockedTarget(null);
    setEdit(true);
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        const mapped = {
          firstName: data?.user?.firstName ?? "",
          lastName: data?.user?.lastName ?? "",
          profileImg: data?.user?.profileImg ?? "",
          email: data?.user?.contact?.email ?? "",
          phone: data?.user?.contact?.phone ?? "",
          address: data?.user?.contact?.address ?? "",
          jobTitle: data?.user?.organization?.jobTitle ?? "",
          organization: data?.user?.organization?.workPlace ?? "",
          department: data?.user?.organization?.department ?? "",
          location: data?.user?.organization?.workAddress ?? "",
        };
        setPre(mapped);
        setNew(mapped);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchData();
  }, [session]);

  if (status === "loading") return null;

  const handleChange = (field: string, value: string) => {
    setNew((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : prev
    );
  };

  const handleDiscard = () => {
    setNew(preData);
    setSaveError(null);
    setSaveSuccess(null);
    setLockedTarget(null);
    setEdit(false);
  };

  const handleSave = async () => {
    const userId = session?.user?.id;
    try {
      if (!userId || !newData) return;

      const email = newData.email.trim();
      if (!email || !EMAIL_REGEX.test(email)) {
        setSaveError(profileCopy.emailInvalid);
        setSaveSuccess(null);
        return;
      }

      setSaveError(null);
      setLockedTarget(null);
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newData),
      });

      const updated = await res.json();
      if (!res.ok) {
        setSaveError(
          updated.error || updated.message || profileCopy.saveFailed
        );
        setSaveSuccess(null);
        return;
      }

      const mapped = {
        firstName: updated.user.firstName,
        lastName: updated.user.lastName,
        profileImg: updated.user.profileImg,
        email: updated.user.contact.email,
        phone: updated.user.contact.phone,
        address: updated.user.contact.address,
        jobTitle: updated.user.organization?.jobTitle,
        organization: updated.user.organization?.workPlace,
        department: updated.user.organization?.department,
        location: updated.user.organization?.workAddress,
      };

      setPre(mapped);
      setNew(mapped);
      setEdit(false);
      setSaveSuccess(profileCopy.saveSuccess);
    } catch (err) {
      console.error(err);
      setSaveError(profileCopy.saveFailed);
      setSaveSuccess(null);
    }
  };

  return (
    <PhoneShell
      title="Profile"
      scrollable
      onMenuClick={() => setOpenMenu(true)}
    >
      <AppSidebar open={openMenu} onClose={() => setOpenMenu(false)} />

      <div className={style.page}>
        <div className={style.contentPanel}>
          {!newData ? (
            <p className={style.loading}>{profileCopy.loading}</p>
          ) : (
            <div className={style.inner}>
              <Header
                firstName={newData.firstName}
                lastName={newData.lastName}
                profileImg={newData.profileImg}
                isEdit={isEdit}
                onChange={handleChange}
                onLockedPhotoInteraction={
                  isEdit ? undefined : () => showLockedPrompt("photo")
                }
                onLockedNameInteraction={
                  isEdit ? undefined : () => showLockedPrompt("name")
                }
                photoLockedHighlight={lockedTarget === "photo"}
                nameLockedHighlight={lockedTarget === "name"}
                lockedFieldMessage={profileCopy.lockedEditPrompt}
              />

              {isEdit ? (
                <div className={style.edit2}>
                  <button
                    type="button"
                    className={style.discardBtn}
                    onClick={handleDiscard}
                  >
                    {profileCopy.discardChanges}
                  </button>
                  <button
                    type="button"
                    className={style.saveBtn}
                    onClick={handleSave}
                  >
                    {profileCopy.saveChanges}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={style.edit}
                  onClick={enterEditMode}
                >
                  {profileCopy.editProfile}
                </button>
              )}

              {saveError ? (
                <p className={style.saveError} role="alert">
                  {saveError}
                </p>
              ) : null}

              {saveSuccess && !isEdit ? (
                <p className={style.saveSuccess} role="status">
                  {saveSuccess}
                </p>
              ) : null}

              <Form
                title={profileCopy.contactSection}
                theme="light"
                field={[
                  {
                    label: profileCopy.fields.email,
                    value: newData.email || "",
                    key: "email",
                    disabled: true,
                    placeholder: profileCopy.placeholders.email,
                  },
                  {
                    label: profileCopy.fields.phone,
                    value: newData.phone || "",
                    key: "phone",
                    placeholder: profileCopy.placeholders.phone,
                  },
                  {
                    label: profileCopy.fields.address,
                    value: newData.address || "",
                    key: "address",
                    placeholder: profileCopy.placeholders.address,
                  },
                ]}
                isEdit={isEdit}
                onChange={handleChange}
                onLockedInteraction={
                  isEdit ? undefined : (key) => showLockedPrompt(key)
                }
                lockedHighlightKey={
                  !isEdit &&
                  lockedTarget &&
                  lockedTarget !== "photo" &&
                  lockedTarget !== "name"
                    ? lockedTarget
                    : null
                }
                lockedFieldMessage={profileCopy.lockedEditPrompt}
              />

              <Form
                title={profileCopy.organizationSection}
                theme="light"
                field={[
                  {
                    label: profileCopy.fields.jobTitle,
                    value: newData.jobTitle || "",
                    key: "jobTitle",
                    placeholder: profileCopy.placeholders.jobTitle,
                  },
                  {
                    label: profileCopy.fields.workplace,
                    value: newData.organization || "",
                    key: "organization",
                    placeholder: profileCopy.placeholders.workplace,
                  },
                  {
                    label: profileCopy.fields.department,
                    value: newData.department || "",
                    key: "department",
                    placeholder: profileCopy.placeholders.department,
                  },
                  {
                    label: profileCopy.fields.workLocation,
                    value: newData.location || "",
                    key: "location",
                    placeholder: profileCopy.placeholders.workLocation,
                  },
                ]}
                isEdit={isEdit}
                onChange={handleChange}
                onLockedInteraction={
                  isEdit ? undefined : (key) => showLockedPrompt(key)
                }
                lockedHighlightKey={
                  !isEdit &&
                  lockedTarget &&
                  lockedTarget !== "photo" &&
                  lockedTarget !== "name"
                    ? lockedTarget
                    : null
                }
                lockedFieldMessage={profileCopy.lockedEditPrompt}
              />
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}
