import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import type { Localized } from '@/content/profile';
import { cn } from '@/lib/utils';

const control =
  'w-full border-input bg-secondary text-base placeholder:text-muted-foreground aria-invalid:border-destructive';

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
  type?: 'text' | 'email' | 'tel' | 'url' | 'date';
  placeholder?: string;
  lang?: string;
}

export const Field: React.FC<FieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  multiline = false,
  type = 'text',
  placeholder,
  lang,
}) => {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = {
    id,
    value,
    placeholder,
    lang,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            control,
            'resize-y rounded-md border p-3 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
          )}
        />
      ) : (
        <Input
          {...shared}
          type={type}
          onChange={(e) => onChange(e.target.value)}
          className={control}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

interface LocalizedFieldProps {
  id: string;
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  errors: { en?: string; fr?: string };
  multiline?: boolean;
  hint?: string;
}

/** English and French side by side on wide screens, stacked on phones. */
export const LocalizedField: React.FC<LocalizedFieldProps> = ({
  id,
  label,
  value,
  onChange,
  errors,
  multiline,
  hint,
}) => {
  const { t } = useTranslation();

  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-base font-bold">{label}</legend>
      {hint && <p className="-mt-1 text-sm text-muted-foreground">{hint}</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field
          id={`${id}-en`}
          label={t('admin.lang.en')}
          lang="en"
          value={value.en}
          onChange={(en) => onChange({ ...value, en })}
          error={errors.en}
          multiline={multiline}
        />
        <Field
          id={`${id}-fr`}
          label={t('admin.lang.fr')}
          lang="fr"
          value={value.fr}
          onChange={(fr) => onChange({ ...value, fr })}
          error={errors.fr}
          multiline={multiline}
        />
      </div>
    </fieldset>
  );
};

export const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section aria-labelledby={id} className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
    <h2 id={id} className="mb-5 text-lg font-extrabold">
      {title}
    </h2>
    <div className="flex flex-col gap-6">{children}</div>
  </section>
);
