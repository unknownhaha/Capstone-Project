"use client";

import Header from "./profileHeader/header";
import Form from "@/app/_globle_components/Form/form";
import style from "./profile.module.css";
import PhoneShell from "@/app/allproject/_components/PhoneShell";
import AppSidebar from "@/app/allproject/_components/AppSidebar";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";



export type UserData = {
  firstName : string;
  lastName : string;
  profileImg : string;
  email: string;
  phone: string;
  address: string;
  jobTitle: string;
  organization: string;
  department: string;
  location: string;
};

export default function Profile() {
  const [isEdit, setEdit] = useState<boolean>(false);
  const [preData, setPre] = useState<UserData | null>(null);
  const [newData, setNew] = useState<UserData | null>(null);
  const [openMenu, setOpenMenu] = useState(false);
  const { data: session, status } = useSession();


  
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
    const handleReset = () => {
        setNew(preData);
        setEdit(false);
};
const handleConfirm = async () => {
  const userId = session?.user?.id;
  try {
    if (!userId) return;
    const res = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(newData),
    });

    if (!res.ok) throw new Error("Failed to update");

    const updated = await res.json();

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
    
  } catch (err) {
    console.error(err);
  }
};
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <PhoneShell
      title="Profile"
      subtitle="Your account"
      scrollable
      onMenuClick={() => setOpenMenu(true)}
    >
      <AppSidebar open={openMenu} onClose={() => setOpenMenu(false)} />

      <div className={style.page}>
        <div className={style.contentPanel}>
          {!newData ? (
            <p className={style.loading}>Loading profile...</p>
          ) : (
            <div className={style.inner}>
              <Header
                firstName={newData.firstName}
                lastName={newData.lastName}
                profileImg={newData.profileImg}
                isEdit={isEdit}
                onChange={handleChange}
              />

              {isEdit ? (
                <div className={style.edit2}>
                  <button
                    type="button"
                    className={style.resetBtn}
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    className={style.confirmBtn}
                    onClick={handleConfirm}
                  >
                    Confirm
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={style.edit}
                  onClick={() => setEdit(true)}
                >
                  Edit Profile
                </button>
              )}

              <Form
                title="Contact"
                theme="light"
                field={[
                  {
                    label: "Email",
                    value: newData.email || "",
                    key: "email",
                    disabled: true,
                  },
                  {
                    label: "Phone",
                    value: newData.phone || "",
                    key: "phone",
                  },
                  {
                    label: "Address",
                    value: newData.address || "",
                    key: "address",
                  },
                ]}
                isEdit={isEdit}
                onChange={handleChange}
              />

              <Form
                title="Organization"
                theme="light"
                field={[
                  {
                    label: "Job Title",
                    value: newData.jobTitle || "",
                    key: "jobTitle",
                  },
                  {
                    label: "Organization / Workplace name",
                    value: newData.organization || "",
                    key: "organization",
                  },
                  {
                    label: "Department / Team",
                    value: newData.department || "",
                    key: "department",
                  },
                  {
                    label: "Work Location",
                    value: newData.location || "",
                    key: "location",
                  },
                ]}
                isEdit={isEdit}
                onChange={handleChange}
              />

              <div className={style.line} />

              <button
                type="button"
                className={style.logout}
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </PhoneShell>
  );
}