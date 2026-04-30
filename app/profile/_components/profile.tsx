'use client'


import Header from "./profileHeader/header"
import Form from "@/app/_globle_components/Form/form"
import style from "./profile.module.css"
import { useState, useEffect } from "react"
export default function Profile(){
    const [isEdit, setEdit] = useState<boolean>(true);
    return (
        <main className={style.container}>
            <Header />
            {isEdit ? 
            <div className={style.edit2}>
                <button style={{backgroundColor : "red", color : "white"}} >Reset</button>
                <button style={{backgroundColor : "rgb(27, 202, 71)", color : "white"}}>Confirm</button>
            </div>
            :
            <button className={style.edit}>Edit Profile</button>}
            <Form title="Contact" field={[
                { label: "Job Title", value: "Master degree" },
                { label: "Organization / Workplace name", value: "Computer science" },
                { label: "Department / Team", value: "Kmutt" },
                { label: "Work Location", value: "Kmutt" },
            ]}></Form>
            <Form title="Organization" field={[
                { label: "Job Title", value: "Master degree" },
                { label: "Organization / Workplace name", value: "Computer science" },
                { label: "Department / Team", value: "Kmutt" },
                { label: "Work Location", value: "Kmutt" },
            ]}></Form>
            <div className={style.line}></div>
            <button className={style.logout}>Log out</button>  
        </main>
    )
}