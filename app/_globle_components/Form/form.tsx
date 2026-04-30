import style from "./form.module.css"


interface Field {
    label : string;
    value : string;
}
interface Prop {
    title : string;
    field : Field[];
}


export default function Form({title, field} : Prop) {
      return( 
      <section className={style.container}>
            <h2>{title}</h2>
         <div className={style.line}></div>
        {field.map((field, index) => (
            <div key={index} >
                <label className={style.labels}>{field.label}</label>
                <div>
                    <input value={field.value} readOnly className={style.input}/>
                </div>
            </div>
                
        ))}
        
        </section>
    )
}