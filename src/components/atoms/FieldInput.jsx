import { Field, Input } from "@fluentui/react-components";

export const FieldInput = ({
  fieldLabel,
  name,
  placeholder,
  value,
  onChange,
  ...props
}) => {
  return (
    <Field label={fieldLabel}>
      <Input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </Field>
  );
};
