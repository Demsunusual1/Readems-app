import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, Globe, LockSimple } from '@phosphor-icons/react/dist/ssr';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readableStoryWhere } from '@/lib/stories';
import { RemoveFromList } from '@/components/remove-from-list';
import '@/components/reader-library.css';

async function loadList(listId: string, viewerId: string | null) {
  const list = await prisma.readingList.findUnique({
    where: { id: listId },
    include: {
      user: { select: { id: true, fullName: true, username: true } },
      items: {
        orderBy: { addedAt: 'desc' },
        where: { story: readableStoryWhere() },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              coverUrl: true,
              genre: true,
              author: { select: { fullName: true } },
            },
          },
        },
      },
    },
  });
  if (!list) return null;
  if (!list.isPublic && list.user.id !== viewerId) return null;
  return list;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  const user = await getCurrentUser();
  const list = await loadList(listId, user?.id ?? null);
  return {
    title: list ? `${list.title} | Readems` : 'List not found | Readems',
  };
}

export default async function ReadingListPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  const user = await getCurrentUser();
  const list = await loadList(listId, user?.id ?? null);
  if (!list) notFound();
  if (!user && !list.isPublic) redirect('/login');
  const owned = list.user.id === user?.id;

  return (
    <div className="library-page list-page">
      <header className="library-hero">
        <div className="library-header">
          <Link href="/library" aria-label="Back to my library">
            <ArrowLeft />
          </Link>
        </div>
        <div className="library-hero-copy">
          <h1>{list.title}</h1>
          {list.description && <p>{list.description}</p>}
          <p className="list-meta">
            {list.isPublic ? <Globe /> : <LockSimple />}{' '}
            {list.isPublic ? 'Public list' : 'Private list'} <i>•</i>{' '}
            {list.items.length} {list.items.length === 1 ? 'story' : 'stories'}{' '}
            <i>•</i> by {list.user.fullName}
          </p>
        </div>
      </header>
      <main className="library-main">
        {list.items.length === 0 ? (
          <p className="shelf-empty">
            Nothing here yet. Add stories to this list from a story page.
          </p>
        ) : (
          <ul className="list-stories">
            {list.items.map((item) => (
              <li key={item.storyId}>
                <Link href={`/stories/${item.story.id}`}>
                  <Image
                    src={item.story.coverUrl}
                    alt=""
                    width={64}
                    height={90}
                  />
                  <span>
                    <strong>{item.story.title}</strong>
                    <small>
                      {item.story.author.fullName} <i>•</i> {item.story.genre}
                    </small>
                  </span>
                </Link>
                {owned && (
                  <RemoveFromList
                    listId={list.id}
                    storyId={item.storyId}
                    title={item.story.title}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
