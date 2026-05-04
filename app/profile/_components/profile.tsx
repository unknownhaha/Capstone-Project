'use client'


import Header from "./profileHeader/header"
import Form from "@/app/_globle_components/Form/form"
import style from "./profile.module.css"
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react"



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
export const id = "680f1a1a1a1a1a1a1a1a1a01";
export default function Profile(){
    const [isEdit, setEdit] = useState<boolean>(false);
    const [preData, setPre] = useState<UserData | null>(null);
    const [newData, setNew] = useState<UserData | null>(null);
    const { data: session, status } = useSession();


  
   useEffect(() => {
    /*if (!session) return;*/
    
    const userId = session?.user?.id || id;
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
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                profileImg: data.user.profileImg,
                email: data.user.contact.email,
                phone: data.user.contact.phone,
                address: data.user.contact.address,
                jobTitle: data.user.organization.jobTitle,
                organization: data.user.organization.workPlace,
                department: data.user.organization.department,
                location: data.user.organization.workAddress,
            };
            setPre(mapped);
            setNew(mapped);
            console.log(data);
            
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    fetchData();
}, [session]);
  if (status === "loading") return null;
    const handleChange = (field: string, value: string) => {
        setNew((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };
    const handleReset = () => {
        setNew(preData);
        setEdit(false);
};
const handleConfirm = async () => {
     const userId = session?.user?.id || id;
  try {
    if(!userId) return;
    const res = await fetch(`/api/users/${ userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
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
if (!newData) {
  return <div>Loading profile...</div>;
}
    return (
  <main className={style.container}>
    <Header 
    firstName={newData?.firstName} 
    lastName={newData?.lastName} 
    profileImg={newData?.profileImg}
    isEdit={isEdit}
    onChange={handleChange}
    />

    {isEdit ? 
      <div className={style.edit2}>
        <button
          onClick={handleReset}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Reset
        </button>
        <button
          onClick={handleConfirm}
          style={{ backgroundColor: "rgb(27, 202, 71)", color: "white" }}
        >
          Confirm
        </button>
      </div>
      :
      <button
        className={style.edit}
        onClick={() => setEdit(true)}
      >
        Edit Profile
      </button>
    }

   
    <Form
      title="Contract"
      field={[
        {
          label: "Email",
          value: newData?.email || "",
          key: "email"
        },
        {
          label: "Phone",
          value: newData?.phone || "",
          key: "phone"
        },
        {
          label: "Address",
          value: newData?.address || "",
          key: "address"
        }
      ]}
      isEdit={isEdit}
      onChange={handleChange}
    />

   
    <Form
      title="Organization"
      field={[
        {
          label: "Job Title",
          value: newData?.jobTitle || "",
          key: "jobTitle"
        },
        {
          label: "Organization / Workplace name",
          value: newData?.organization || "",
          key: "organization"
        },
        {
          label: "Department / Team",
          value: newData?.department || "",
          key: "department"
        },
        {
          label: "Work Location",
          value: newData?.location || "",
          key: "location"
        }
      ]}
      isEdit={isEdit}
      onChange={handleChange}
    />

    <div className={style.line}></div>

    <button className={style.logout}>
      Log out
    </button>
  </main>
);
}