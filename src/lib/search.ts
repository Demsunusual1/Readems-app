import { prisma } from './prisma';
import { getGroups, type GroupSummary } from './groups';
import { searchPeople, type PersonSummary } from './people';
import { listStories, type StoryCard } from './stories';
import type { CommunityPost } from './community';

export type SearchPost = {
  id: string;
  body: string;
  createdAt: Date;
  author: { name: string; username: string; avatarUrl: string | null };
  groupId: string | null;
};

export type SearchResults = {
  term: string;
  stories: StoryCard[];
  people: PersonSummary[];
  groups: GroupSummary[];
  posts: SearchPost[];
  total: number;
  top: { kind: 'story' | 'person' | 'group' | 'post'; href: string } | null;
};

const empty = (term: string): SearchResults => ({
  term,
  stories: [],
  people: [],
  groups: [],
  posts: [],
  total: 0,
  top: null,
});

export async function search(
  rawTerm: string,
  viewerId: string | null,
): Promise<SearchResults> {
  const term = rawTerm.trim();
  if (term.length < 2) return empty(term);

  const [stories, people, groups, postRows] = await Promise.all([
    listStories({ query: term, limit: 12 }),
    searchPeople(term, viewerId, 8),
    getGroups({ viewerId, query: term, take: 8 }),
    prisma.post.findMany({
      where: { body: { contains: term, mode: 'insensitive' }, groupId: null },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        author: { select: { fullName: true, username: true, avatarUrl: true } },
      },
    }),
  ]);

  const posts: SearchPost[] = postRows.map((post) => ({
    id: post.id,
    body: post.body,
    createdAt: post.createdAt,
    groupId: post.groupId,
    author: {
      name: post.author.fullName,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
    },
  }));

  // A story is what most people are looking for; a person is the next best
  // answer, then a group, then something somebody wrote in the feed.
  const top = stories[0]
    ? { kind: 'story' as const, href: `/stories/${stories[0].id}` }
    : people[0]
      ? { kind: 'person' as const, href: `/u/${people[0].username}` }
      : groups[0]
        ? { kind: 'group' as const, href: `/groups/${groups[0].id}` }
        : posts[0]
          ? { kind: 'post' as const, href: '/community' }
          : null;

  return {
    term,
    stories,
    people,
    groups,
    posts,
    total: stories.length + people.length + groups.length + posts.length,
    top,
  };
}

export type { CommunityPost };
