
import style from "./header.module.css"

export default function Header() {
    return (
        <div className={style.container}>
            <img src="file.svg" className={style.img}></img>
            <p className={style.name}>Name</p>
        </div>
    )
}