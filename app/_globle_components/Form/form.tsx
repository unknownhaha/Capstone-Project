import style from "./form.module.css"


interface Field {
    label : string;
    value : string;
    key : string;
    placeholder?: string;
}
interface Prop {
    title : string;
    field : Field[];
    isEdit: boolean; 
    onChange: (field: string, value: string) => void;
    theme?: "dark" | "light";
    onLockedInteraction?: (fieldKey: string) => void;
    lockedHighlightKey?: string | null;
    lockedFieldMessage?: string;
}


export default function Form({
  title,
  field,
  isEdit,
  onChange,
  theme = "dark",
  onLockedInteraction,
  lockedHighlightKey = null,
  lockedFieldMessage = "",
}: Prop) {
  return (
    <div className={`${style.container} ${theme === "light" ? style.light : ""}`}>
      <h2>{title}</h2>
    <div className={style.line}></div>
      {field.map((item) => {
        const lockedHighlight =
          !isEdit && lockedHighlightKey === item.key;
        const notifyLocked = () => onLockedInteraction?.(item.key);

        return (
          <div
            key={item.key}
            className={
              !isEdit
                ? `${style.fieldRowLocked}${lockedHighlight ? ` ${style.fieldRowLockedHighlight}` : ""}`
                : undefined
            }
            onClick={!isEdit ? notifyLocked : undefined}
            onKeyDown={
              !isEdit && onLockedInteraction
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      notifyLocked();
                    }
                  }
                : undefined
            }
            role={!isEdit && onLockedInteraction ? "button" : undefined}
            tabIndex={!isEdit && onLockedInteraction ? 0 : undefined}
          >
            <label
              className={style.labels}
              htmlFor={isEdit ? `field-${item.key}` : undefined}
            >
              {item.label}
            </label>

            <div className={style.inputAsideRow}>
              <input
                id={isEdit ? `field-${item.key}` : undefined}
                className={`${style.input}${lockedHighlight ? ` ${style.inputLockedHighlight}` : ""}`}
                type={item.key === "email" ? "email" : "text"}
                value={item.value}
                disabled={!isEdit}
                readOnly={!isEdit}
                placeholder={item.placeholder}
                aria-readonly={!isEdit}
                aria-invalid={lockedHighlight || undefined}
                aria-describedby={
                  lockedHighlight ? `locked-hint-${item.key}` : undefined
                }
                onChange={(e) => onChange(item.key, e.target.value)}
                onFocus={!isEdit ? notifyLocked : undefined}
              />
              {lockedHighlight && lockedFieldMessage ? (
                <p
                  id={`locked-hint-${item.key}`}
                  className={style.lockedFieldMessage}
                  role="alert"
                >
                  {lockedFieldMessage}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}