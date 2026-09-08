'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import {
  Bell,
  BookOpen,
  BookmarkSimple,
  CaretDown,
  CaretRight,
  CheckCircle,
  Compass,
  DownloadSimple,
  Feather,
  Globe,
  House,
  LockSimple,
  MagnifyingGlass,
  Plus,
  Sparkle,
  UserCircle,
} from '@phosphor-icons/react';
import { Logo } from './ui/logo';
import {
  createList,
  deleteList,
  toggleLibraryStory,
  updateReadingGoal,
} from '@/app/library/actions';
import './reader-library.css';

export type ShelfStory = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  percent: number;
  chapter: number;
  paragraph: number;
  saved: boolean;
};

export type LibraryList = {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  count: number;
  covers: string[];
};

export type LibraryGoal = {
  target: number;
  finished: number;
  percent: number;
  pace: { books: number; state: string };
};

const tabs = [
  ['Current', BookOpen],
  ['Saved', BookmarkSimple],
  ['Completed', CheckCircle],
  ['Downloads', DownloadSimple],
] as const;

type TabName = (typeof tabs)[number][0];

const listIcons = [Globe, Feather, Sparkle];
const listTones = ['navy', 'plum', 'purple'];

function resumeHref(story: ShelfStory) {
  return story.percent > 0
    ? `/stories/${story.id}/chapters/${story.chapter}#paragraph-${story.paragraph}`
    : `/stories/${story.id}`;
}

export function ReaderLibrary({
  profileHref,
  signedIn,
  shelf,
  lists,
  goal,
}: {
  profileHref: string;
  signedIn: boolean;
  shelf: {
    current: ShelfStory[];
    saved: ShelfStory[];
    completed: ShelfStory[];
  };
  lists: LibraryList[];
  goal: LibraryGoal;
}) {
  const [activeTab, setActiveTab] = useState<TabName>('Current');
  const [sort, setSort] = useState<'Recent' | 'Title'>('Recent');
  const [showListForm, setShowListForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [listState, submitList] = useActionState(createList, null);
  const [goalState, submitGoal] = useActionState(updateReadingGoal, null);

  const shelves: Record<TabName, ShelfStory[]> = {
    Current: shelf.current,
    Saved: shelf.saved,
    Completed: shelf.completed,
    Downloads: [],
  };
  const stories = [...shelves[activeTab]].sort((a, b) =>
    sort === 'Title' ? a.title.localeCompare(b.title) : 0,
  );

  return (
    <div className="library-page">
      <header className="library-hero">
        <div className="library-header">
          <Logo tone="light" />
          <nav aria-label="Library utilities">
            <Link href="/search" aria-label="Search stories">
              <MagnifyingGlass />
            </Link>
            <Link
              href={signedIn ? '/notifications' : '/login'}
              aria-label="Notifications"
            >
              <Bell />
            </Link>
          </nav>
        </div>
        <div className="library-hero-copy">
          <h1>My Library</h1>
          <p>
            Your stories. Your growth.
            <br />
            Your community.
          </p>
        </div>
        <Image
          className="library-hero-book"
          src="/readems/library-hero-book.png"
          alt=""
          width={360}
          height={240}
          priority
        />
      </header>

      <main className="library-main">
        <section className="reading-goal" aria-labelledby="reading-goal-title">
          <div className="reading-goal-copy">
            <h2 id="reading-goal-title">Reading Goal</h2>
            <strong>
              {goal.finished} <span>of {goal.target} books</span>
            </strong>
            <p>{goal.percent}% of your annual goal</p>
            <div
              className="goal-progress"
              aria-label={`${goal.percent} percent of annual reading goal`}
            >
              <span style={{ width: `${goal.percent}%` }} />
            </div>
            {signedIn &&
              (showGoalForm ? (
                <form action={submitGoal} className="goal-form">
                  <label htmlFor="goal-target">Books this year</label>
                  <input
                    id="goal-target"
                    name="target"
                    type="number"
                    min={1}
                    max={1000}
                    defaultValue={goal.target}
                    required
                  />
                  <button type="submit">Save goal</button>
                  <button type="button" onClick={() => setShowGoalForm(false)}>
                    Cancel
                  </button>
                  {goalState?.message && (
                    <p role="alert">{goalState.message}</p>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  className="goal-edit"
                  onClick={() => setShowGoalForm(true)}
                >
                  Change goal
                </button>
              ))}
          </div>
          <div className="goal-sparkles" aria-hidden="true">
            <Sparkle />
          </div>
          <div className="goal-status">
            <div className="goal-ring">
              <BookOpen />
            </div>
            <strong>
              {goal.pace.state === 'on track'
                ? 'On track'
                : `${goal.pace.books} ${goal.pace.books === 1 ? 'book' : 'books'} ${goal.pace.state}`}
            </strong>
            <span>
              {goal.pace.state === 'behind'
                ? 'A chapter a day catches up.'
                : 'Great momentum!'}
            </span>
          </div>
        </section>

        <div
          className="library-tabs"
          role="tablist"
          aria-label="Library sections"
        >
          {tabs.map(([label, Icon]) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === label}
              className={activeTab === label ? 'is-active' : undefined}
              key={label}
              onClick={() => setActiveTab(label)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <section className="library-shelf" aria-labelledby="shelf-heading">
          <header>
            <div>
              <h2 id="shelf-heading">My Shelf</h2>
              <span>{stories.length}</span>
            </div>
            <div className="shelf-controls">
              <button
                type="button"
                onClick={() => setSort(sort === 'Recent' ? 'Title' : 'Recent')}
                aria-label={`Sort by ${sort === 'Recent' ? 'title' : 'most recent'}`}
              >
                {sort} <CaretDown />
              </button>
            </div>
          </header>
          {activeTab === 'Downloads' ? (
            <p className="shelf-empty">
              Offline reading is not available yet, so nothing is stored on this
              device. Saved stories stay on your shelf and open whenever you are
              online.
            </p>
          ) : stories.length === 0 ? (
            <p className="shelf-empty">
              {signedIn
                ? activeTab === 'Current'
                  ? 'Nothing on the go. Open a story and it will appear here.'
                  : activeTab === 'Saved'
                    ? 'Save a story from its page to keep it for later.'
                    : 'Finish a story and it will be counted here.'
                : 'Sign in to keep a shelf of your own.'}
            </p>
          ) : (
            <div className="shelf-grid">
              {stories.map((story) => (
                <article className="shelf-card" key={story.id}>
                  <Link href={resumeHref(story)} className="shelf-cover">
                    <Image
                      src={story.coverUrl}
                      alt={`Cover of ${story.title}`}
                      fill
                      sizes="(max-width: 600px) 31vw, 240px"
                    />
                    <span>{story.percent}%</span>
                  </Link>
                  <div className="shelf-card-copy">
                    {signedIn && (
                      <button
                        type="button"
                        aria-label={
                          story.saved
                            ? `Remove ${story.title} from my library`
                            : `Save ${story.title} to my library`
                        }
                        disabled={pending}
                        onClick={() =>
                          startTransition(async () => {
                            await toggleLibraryStory(story.id);
                          })
                        }
                      >
                        <BookmarkSimple
                          weight={story.saved ? 'fill' : 'regular'}
                        />
                      </button>
                    )}
                    <h3>
                      <Link href={`/stories/${story.id}`}>{story.title}</Link>
                    </h3>
                    <p>{story.author}</p>
                    <div className="shelf-progress">
                      <span>
                        <i style={{ width: `${story.percent}%` }} />
                      </span>
                      <b>{story.percent}%</b>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="reading-lists" aria-labelledby="lists-heading">
          <header>
            <h2 id="lists-heading">My Reading Lists</h2>
            {signedIn && (
              <button
                type="button"
                onClick={() => setShowListForm(!showListForm)}
                aria-expanded={showListForm}
              >
                New List <Plus />
              </button>
            )}
          </header>
          {showListForm && (
            <form action={submitList} className="list-form">
              <label htmlFor="list-title">List name</label>
              <input
                id="list-title"
                name="title"
                required
                maxLength={60}
                placeholder="African Voices"
              />
              <label htmlFor="list-description">Description</label>
              <input
                id="list-description"
                name="description"
                maxLength={160}
                placeholder="Stories that centre our voices."
              />
              <label className="list-public">
                <input type="checkbox" name="isPublic" />
                Anyone can see this list
              </label>
              <button type="submit">Create list</button>
              {listState?.message && <p role="alert">{listState.message}</p>}
            </form>
          )}
          {lists.length === 0 ? (
            <p className="shelf-empty">
              {signedIn
                ? 'Reading lists group stories by whatever matters to you.'
                : 'Sign in to build reading lists.'}
            </p>
          ) : (
            <div className="reading-list-rows">
              {lists.map((list, index) => {
                const Icon = listIcons[index % listIcons.length];
                return (
                  <div className="reading-list-row" key={list.id}>
                    <Link href={`/library/lists/${list.id}`}>
                      <span
                        className={`reading-list-icon ${listTones[index % listTones.length]}`}
                      >
                        <Icon />
                      </span>
                      <span className="reading-list-copy">
                        <strong>{list.title}</strong>
                        <small>
                          {list.count} {list.count === 1 ? 'story' : 'stories'}{' '}
                          <i>•</i> {!list.isPublic && <LockSimple />}{' '}
                          {list.isPublic ? 'Public' : 'Private'}
                        </small>
                        {list.description && <span>{list.description}</span>}
                      </span>
                      <span className="reading-list-covers" aria-hidden="true">
                        {list.covers.map((cover) => (
                          <Image
                            key={cover}
                            src={cover}
                            alt=""
                            width={44}
                            height={62}
                          />
                        ))}
                      </span>
                      <CaretRight />
                    </Link>
                    <button
                      type="button"
                      className="list-delete"
                      aria-label={`Delete the list ${list.title}`}
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await deleteList(list.id);
                        })
                      }
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="offline-card">
          <DownloadSimple />
          <div>
            <strong>Offline Mode</strong>
            <span>Offline reading is not available yet.</span>
          </div>
          <button type="button" onClick={() => setActiveTab('Downloads')}>
            View Downloads
          </button>
        </aside>
      </main>

      <nav className="library-bottom-nav" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Explore</span>
        </Link>
        <Link href="/signup?role=creator">
          <Feather />
          <span>Write</span>
        </Link>
        <Link href="/library" aria-current="page">
          <BookOpen weight="fill" />
          <span>Library</span>
        </Link>
        <Link href={profileHref}>
          <UserCircle />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
