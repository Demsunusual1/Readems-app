'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowLeft,
  CaretDown,
  CheckCircle,
  DotsThree,
  FileText,
  ImageSquare,
  PaperPlaneTilt,
  Sparkle,
  X,
} from '@phosphor-icons/react';
import './create-story.css';

const initialTags = ['Mystery', 'Lagos', 'Suspense'];
const initialWarnings = ['Violence', 'Sensitive themes'];

export function CreateStory() {
  const [title, setTitle] = useState('The Last Train to Makoko');
  const [description, setDescription] = useState(
    'A journalist returns home to uncover the truth behind a corrupt coastal city.',
  );
  const [tags, setTags] = useState(initialTags);
  const [warnings, setWarnings] = useState(initialWarnings);
  const [mature, setMature] = useState(false);
  const [cover, setCover] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  const chooseCover = (file?: File) => {
    if (file) setCover(URL.createObjectURL(file));
  };

  return (
    <main className="create-story-page">
      <header className="create-story-hero">
        <div className="create-story-stars" />
        <Link href="/creator/stories" aria-label="Back to My Stories">
          <ArrowLeft />
        </Link>
        <div>
          <h1>Create New Story</h1>
          <p>Start with the details</p>
        </div>
        <button aria-label="More options">
          <DotsThree weight="bold" />
        </button>
      </header>

      <form className="create-story-sheet">
        <ol className="story-steps" aria-label="Story setup progress">
          <li className="active">
            <b>1</b>
            <span>Story Basics</span>
          </li>
          <i />
          <li>
            <b>2</b>
            <span>Publishing</span>
          </li>
        </ol>

        <section className="cover-section">
          <h2>Story cover</h2>
          <div className="cover-row">
            <button
              className="cover-preview"
              type="button"
              onClick={() => fileInput.current?.click()}
            >
              {cover ? (
                <span style={{ backgroundImage: `url(${cover})` }} />
              ) : (
                <>
                  <ImageSquare />
                  <em>Upload cover</em>
                </>
              )}
            </button>
            <div className="cover-help">
              <strong>Recommended 1600 × 2400 px</strong>
              <p>A striking cover helps readers discover your story.</p>
              <button type="button" onClick={() => fileInput.current?.click()}>
                <ImageSquare /> Choose Image
              </button>
              <input
                ref={fileInput}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => chooseCover(event.target.files?.[0])}
              />
            </div>
          </div>
        </section>

        <label className="story-title-field">
          <span>Story title</span>
          <div>
            <input
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Sparkle />
          </div>
          <small>
            <span>Give your story a memorable title.</span>
            <b>{title.length} / 120</b>
          </small>
        </label>

        <label className="story-description">
          <span>Description</span>
          <div>
            <textarea
              maxLength={500}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <small>{description.length} / 500</small>
          </div>
        </label>

        <div className="story-field-grid">
          <SelectField label="Category" value="Thriller" />
          <SelectField label="Language" value="English" />
        </div>

        <ChipField
          label="Tags"
          values={tags}
          onRemove={(value) => setTags(tags.filter((tag) => tag !== value))}
          addLabel="Add tag"
        />

        <div className="story-field-grid">
          <SelectField label="Subgenre" value="Mystery Thriller" />
          <SegmentField
            label="Story status"
            values={['Ongoing', 'Completed']}
          />
          <SegmentField
            label="Visibility"
            values={['Public', 'Unlisted', 'Private']}
          />
          <SelectField label="Target audience" value="Teen (13+)" />
          <SelectField label="Copyright" value="Original Work" />
          <ChipField
            label="Content warnings"
            optional
            values={warnings}
            onRemove={(value) =>
              setWarnings(warnings.filter((warning) => warning !== value))
            }
            addLabel="Add warning"
          />
        </div>

        <label className="mature-setting">
          <b>18+</b>
          <span>
            <strong>Mature content</strong>
            <small>Contains themes for readers 18+</small>
          </span>
          <input
            type="checkbox"
            checked={mature}
            onChange={(event) => setMature(event.target.checked)}
          />
          <i />
        </label>

        <p className="story-autosave">
          <CheckCircle /> Auto-saved just now
        </p>
      </form>

      <footer className="create-story-actions">
        <button type="button">
          <FileText /> Save Draft
        </button>
        <Link href="/creator/stories/new/editor">
          <PaperPlaneTilt /> Continue to Editor
        </Link>
      </footer>
    </main>
  );
}

function SelectField({ label, value }: { label: string; value: string }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <button type="button">
        {value}
        <CaretDown />
      </button>
    </label>
  );
}

function SegmentField({ label, values }: { label: string; values: string[] }) {
  const [selected, setSelected] = useState(values[0]);
  return (
    <fieldset className="segment-field">
      <legend>{label}</legend>
      <div>
        {values.map((value) => (
          <button
            className={selected === value ? 'active' : ''}
            type="button"
            key={value}
            onClick={() => setSelected(value)}
          >
            {value}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ChipField({
  label,
  optional,
  values,
  onRemove,
  addLabel,
}: {
  label: string;
  optional?: boolean;
  values: string[];
  onRemove: (value: string) => void;
  addLabel: string;
}) {
  return (
    <fieldset className="chip-field">
      <legend>
        {label}
        {optional && <small>Optional</small>}
      </legend>
      <div>
        {values.map((value) => (
          <span key={value}>
            {value}
            <button
              type="button"
              aria-label={`Remove ${value}`}
              onClick={() => onRemove(value)}
            >
              <X />
            </button>
          </span>
        ))}
        <button className="add-chip" type="button">
          + {addLabel}
        </button>
      </div>
    </fieldset>
  );
}
