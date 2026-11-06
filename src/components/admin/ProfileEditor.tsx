import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Experience, Profile } from '@/content/profile';
import { Field, LocalizedField, Section } from './fields';

interface ProfileEditorProps {
  draft: Profile;
  /** Applies an edit to a copy of the draft. */
  patch: (edit: (draft: Profile) => void) => void;
  /** Translated error for a field path ("experiences.1.endDate"), if any. */
  errorAt: (path: string) => string | undefined;
}

const iconButton = 'size-11 shrink-0 text-muted-foreground hover:text-foreground';

function move(list: unknown[], from: number, to: number) {
  list.splice(to, 0, ...list.splice(from, 1));
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ draft, patch, errorAt }) => {
  const { t } = useTranslation();
  const localizedErrors = (path: string) => ({
    en: errorAt(`${path}.en`) ?? errorAt(path),
    fr: errorAt(`${path}.fr`),
  });

  return (
    <div className="flex flex-col gap-4">
      <Section id="admin-profile" title={t('admin.sections.profile')}>
        <Field
          id="name"
          label={t('admin.fields.name')}
          value={draft.name}
          onChange={(v) => patch((d) => (d.name = v))}
          error={errorAt('name')}
        />
        <LocalizedField
          id="jobTitle"
          label={t('admin.fields.jobTitle')}
          value={draft.jobTitle}
          onChange={(v) => patch((d) => (d.jobTitle = v))}
          errors={localizedErrors('jobTitle')}
        />
        <LocalizedField
          id="status"
          label={t('admin.fields.status')}
          hint={t('admin.hints.status')}
          value={draft.status ?? { en: '', fr: '' }}
          onChange={(v) => patch((d) => (d.status = v))}
          errors={localizedErrors('status')}
        />
        <LocalizedField
          id="location"
          label={t('admin.fields.location')}
          value={draft.location}
          onChange={(v) => patch((d) => (d.location = v))}
          errors={localizedErrors('location')}
        />
        <LocalizedField
          id="description"
          label={t('admin.fields.description')}
          value={draft.description}
          onChange={(v) => patch((d) => (d.description = v))}
          errors={localizedErrors('description')}
          multiline
        />
      </Section>

      <Section id="admin-contact" title={t('admin.sections.contact')}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            id="email"
            type="email"
            label={t('admin.fields.email')}
            value={draft.email}
            onChange={(v) => patch((d) => (d.email = v))}
            error={errorAt('email')}
          />
          <Field
            id="phone"
            type="tel"
            label={t('admin.fields.phone')}
            value={draft.phone}
            onChange={(v) => patch((d) => (d.phone = v))}
            error={errorAt('phone')}
          />
          <Field
            id="linkedin"
            type="url"
            label={t('admin.fields.linkedin')}
            value={draft.socials.linkedin}
            onChange={(v) => patch((d) => (d.socials.linkedin = v))}
            error={errorAt('socials.linkedin')}
          />
          <Field
            id="github"
            label={t('admin.fields.github')}
            hint={t('admin.hints.github')}
            value={draft.socials.github}
            onChange={(v) => patch((d) => (d.socials.github = v))}
            error={errorAt('socials.github')}
          />
        </div>
      </Section>

      <Section id="admin-theme" title={t('admin.sections.theme')}>
        {/* Live preview with the draft colors; style, not classes: they are data. */}
        <div
          aria-hidden="true"
          className="h-20 rounded-lg"
          style={{
            backgroundImage: `linear-gradient(to bottom right, ${draft.theme.primary}, ${draft.theme.accent})`,
          }}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['primary', 'accent'] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`theme-${key}`} className="text-sm font-semibold">
                {t(`admin.fields.${key}`)}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id={`theme-${key}`}
                  type="color"
                  value={draft.theme[key]}
                  onChange={(e) => patch((d) => (d.theme[key] = e.target.value))}
                  className="h-11 w-16 cursor-pointer rounded-md border bg-secondary p-1"
                />
                <span className="text-sm text-muted-foreground uppercase tabular-nums">
                  {draft.theme[key]}
                </span>
              </div>
              {errorAt(`theme.${key}`) && (
                <p className="text-sm text-destructive">{errorAt(`theme.${key}`)}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section id="admin-skills" title={t('admin.sections.skills')}>
        {errorAt('skills') && <p className="text-sm text-destructive">{errorAt('skills')}</p>}
        <ol className="flex flex-col gap-3">
          {draft.skills.map((skill, i) => (
            <li
              // Rows have no id; an index key is fine for a short list edited in place.
              key={i}
              className="grid grid-cols-1 items-end gap-3 rounded-lg bg-secondary/50 p-3 sm:grid-cols-[1fr_2fr_auto]"
            >
              <Field
                id={`skill-${i}-name`}
                label={t('admin.fields.skillName')}
                value={skill.name}
                onChange={(v) => patch((d) => (d.skills[i] = { ...d.skills[i], name: v }))}
                error={errorAt(`skills.${i}.name`)}
              />
              <Field
                id={`skill-${i}-icon`}
                type="url"
                label={t('admin.fields.skillIcon')}
                value={skill.icon ?? ''}
                onChange={(v) =>
                  patch((d) => (d.skills[i] = { name: d.skills[i]?.name ?? '', icon: v }))
                }
                error={errorAt(`skills.${i}.icon`)}
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={iconButton}
                  aria-label={t('admin.actions.moveUp', { name: skill.name })}
                  disabled={i === 0}
                  onClick={() => patch((d) => move(d.skills, i, i - 1))}
                >
                  <ArrowUp aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={iconButton}
                  aria-label={t('admin.actions.moveDown', { name: skill.name })}
                  disabled={i === draft.skills.length - 1}
                  onClick={() => patch((d) => move(d.skills, i, i + 1))}
                >
                  <ArrowDown aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${iconButton} hover:text-destructive`}
                  aria-label={t('admin.actions.remove', { name: skill.name })}
                  onClick={() => patch((d) => d.skills.splice(i, 1))}
                >
                  <Trash2 aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
        <Button
          variant="secondary"
          className="h-11 self-start"
          onClick={() => patch((d) => d.skills.push({ name: '' }))}
        >
          <Plus aria-hidden="true" />
          {t('admin.actions.addSkill')}
        </Button>
      </Section>

      <Section id="admin-experiences" title={t('admin.sections.experiences')}>
        <p className="-mt-3 text-sm text-muted-foreground">{t('admin.hints.experiences')}</p>
        <ol className="flex flex-col gap-4">
          {draft.experiences.map((experience, i) => {
            const editExperience = (edit: (e: Experience) => void) =>
              patch((d) => edit(d.experiences[i]));
            return (
              <li key={i} className="flex flex-col gap-4 rounded-lg border bg-secondary/40 p-4">
                <div className="flex items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <Field
                      id={`exp-${i}-company`}
                      label={t('admin.fields.company')}
                      value={experience.company}
                      onChange={(v) => editExperience((e) => (e.company = v))}
                      error={errorAt(`experiences.${i}.company`)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${iconButton} hover:text-destructive`}
                    aria-label={t('admin.actions.remove', { name: experience.company })}
                    onClick={() => patch((d) => d.experiences.splice(i, 1))}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
                <LocalizedField
                  id={`exp-${i}-position`}
                  label={t('admin.fields.position')}
                  value={experience.position}
                  onChange={(v) => editExperience((e) => (e.position = v))}
                  errors={localizedErrors(`experiences.${i}.position`)}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id={`exp-${i}-start`}
                    type="date"
                    label={t('admin.fields.startDate')}
                    value={experience.startDate}
                    onChange={(v) => editExperience((e) => (e.startDate = v))}
                    error={errorAt(`experiences.${i}.startDate`)}
                  />
                  <Field
                    id={`exp-${i}-end`}
                    type="date"
                    label={t('admin.fields.endDate')}
                    hint={t('admin.hints.endDate')}
                    value={experience.endDate ?? ''}
                    onChange={(v) => editExperience((e) => (e.endDate = v || null))}
                    error={errorAt(`experiences.${i}.endDate`)}
                  />
                </div>
                <LocalizedField
                  id={`exp-${i}-description`}
                  label={t('admin.fields.expDescription')}
                  value={experience.description ?? { en: '', fr: '' }}
                  onChange={(v) => editExperience((e) => (e.description = v))}
                  errors={localizedErrors(`experiences.${i}.description`)}
                  multiline
                />
              </li>
            );
          })}
        </ol>
        <Button
          variant="secondary"
          className="h-11 self-start"
          onClick={() =>
            patch((d) =>
              d.experiences.unshift({
                company: '',
                position: { en: '', fr: '' },
                startDate: '',
                endDate: null,
              }),
            )
          }
        >
          <Plus aria-hidden="true" />
          {t('admin.actions.addExperience')}
        </Button>
      </Section>
    </div>
  );
};

export default ProfileEditor;
