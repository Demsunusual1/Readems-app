'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarBlank,
  CaretRight,
  ChartBar,
  Clock,
  Code,
  DotsThree,
  Eye,
  ImageSquare,
  Images,
  LinkSimple,
  ListBullets,
  Minus,
  PaperPlaneTilt,
  Quotes,
  Sparkle,
} from '@phosphor-icons/react';
import './story-editor.css';

const chapterCopy = `The train screeched into Makoko just as the sky began to bruise with night.

Steam curled around the rusted tracks, mixing with the scent of saltwater and woodsmoke. Amina stepped down, clutching her bag tighter.

“You’re late,” said the man in the patched coat.

“I had to see it first,” she replied.

Between them lay a choice that would change everything.`;

export function StoryEditor() {
  const [title, setTitle] = useState('Crossroads');
  const editor = useRef<HTMLDivElement>(null);
  const format = (command: string) => {
    editor.current?.focus();
    document.execCommand(command);
  };

  return (
    <main className="story-editor-page">
      <section className="editor-hero">
        <div className="editor-constellations" />
        <div className="editor-top">
          <Link href="/creator/stories" aria-label="Back to My Stories">
            <ArrowLeft />
          </Link>
          <div className="editor-breadcrumb">
            <strong>The Last Train to Makoko</strong>
            <p>
              <span>Chapters</span>
              <CaretRight />
              <b>Chapter 12</b>
            </p>
          </div>
          <div className="editor-actions">
            <button aria-label="Preview chapter">
              <Eye />
            </button>
            <button aria-label="Schedule chapter">
              <CalendarBlank />
            </button>
            <button aria-label="More options">
              <DotsThree weight="bold" />
            </button>
          </div>
        </div>
      </section>

      <section className="editor-sheet">
        <label className="chapter-title">
          <span>Chapter title</span>
          <div>
            <input
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-describedby="title-help"
            />
            <Sparkle weight="duotone" />
          </div>
          <small id="title-help">
            Give your chapter a clear, captivating title.
            <b>{title.length} / 120</b>
          </small>
        </label>

        <section className="writing-card" aria-label="Chapter editor">
          <div className="format-bar">
            <button className="paragraph">Paragraph⌄</button>
            <button onClick={() => format('bold')} aria-label="Bold">
              <b>B</b>
            </button>
            <button onClick={() => format('italic')} aria-label="Italic">
              <i>I</i>
            </button>
            <button onClick={() => format('underline')} aria-label="Underline">
              <u>U</u>
            </button>
            <button
              onClick={() => format('strikeThrough')}
              aria-label="Strikethrough"
            >
              <s>S</s>
            </button>
            <button
              onClick={() => format('insertUnorderedList')}
              aria-label="Bulleted list"
            >
              <ListBullets />
            </button>
          </div>
          <div
            ref={editor}
            className="chapter-body"
            contentEditable
            suppressContentEditableWarning
            aria-label="Chapter content"
          >
            {chapterCopy.split('\n\n').map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? 'opening' : undefined}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <footer className="editor-stats">
            <span>
              <b>1,248</b>
              <small>Words</small>
            </span>
            <span>
              <b>6,912</b>
              <small>Characters</small>
            </span>
            <span className="saved">
              ◔<i>✓</i>
              <span>
                Auto-saved<small>Just now</small>
              </span>
            </span>
            <button>
              <ChartBar /> View Stats
            </button>
          </footer>
        </section>

        <section className="chapter-inserts">
          <h2>Add to your chapter</h2>
          <div>
            <button>
              <ImageSquare />
              <span>Image</span>
            </button>
            <button>
              <Images />
              <span>Gallery</span>
            </button>
            <button>
              <Quotes />
              <span>Quote</span>
            </button>
            <button>
              <Minus />
              <span>Divider</span>
            </button>
            <button>
              <LinkSimple />
              <span>Link</span>
            </button>
            <button>
              <Code />
              <span>Embed</span>
            </button>
          </div>
        </section>
      </section>

      <footer className="publish-bar">
        <button className="schedule">
          <Clock /> Schedule
        </button>
        <button className="publish">
          <PaperPlaneTilt /> Publish Chapter
        </button>
      </footer>
    </main>
  );
}
