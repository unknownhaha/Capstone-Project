import style from "./form.module.css"


interface Field {
    label : string;
    value : string;
    key : string;
}
interface Prop {
    title : string;
    field : Field[];
    isEdit: boolean; 
    onChange: (field: string, value: string) => void; 
}


export default function Form({ title, field, isEdit, onChange }: Prop) {
  return (
    <div className={style.container}>
      <h2>{title}</h2>
    <div className={style.line}></div>
      {field.map((item) => (
        <div key={item.key}>
          <label className={style.labels}>{item.label}</label>

          <input
            className={style.input}
            value={item.value}
            disabled={!isEdit}
            onChange={(e) => onChange(item.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}