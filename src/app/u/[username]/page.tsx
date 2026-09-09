import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BookOpen,
  Compass,
  House,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr';
import { dashboardForRole, getCurrentUser } from '@/lib/auth';
import { getProfile } from '@/lib/people';
import { FollowButton } from '@/components/follow-button';
import { Logo } from '@/components/ui/logo';
import '@/components/profile.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username, null);
  return {
    title: profile
      ? `${profile.name} (@${profile.username}) | Readems`
      : 'Profile not found | Readems',
    description: profile?.bio ?? undefined,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const viewer = await getCurrentUser();
  const profile = await getProfile(username, viewer?.id ?? null);
  if (!profile) notFound();

  return (
    <div className="profile-page">
      <header className="profile-hero">
        <Logo tone="light" />
        <div className="profile-identity">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt=""
              width={104}
              height={104}
              className="profile-avatar"
            />
          ) : (
            <UserCircle size={104} className="profile-avatar" />
          )}
          <div>
            <h1>{profile.name}</h1>
            <p>@{profile.username}</p>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          </div>
          {profile.isMe ? (
            <Link className="profile-edit" href="/settings">
              Edit profile
            </Link>
          ) : (
            <FollowButton
              personId={profile.id}
              username={profile.username}
              name={profile.name}
              following={profile.isFollowing}
              signedIn={Boolean(viewer)}
            />
          )}
        </div>
        <dl className="profile-stats">
          <div>
            <dt>{profile.followers}</dt>
            <dd>{profile.followers === 1 ? 'Follower' : 'Followers'}</dd>
          </div>
          <div>
            <dt>{profile.following}</dt>
            <dd>Following</dd>
          </div>
          <div>
            <dt>{profile.storyCount}</dt>
            <dd>{profile.storyCount === 1 ? 'Story' : 'Stories'}</dd>
          </div>
        </dl>
      </header>

      <main className="profile-main">
        <h2>{profile.isMe ? 'Your published stories' : 'Published stories'}</h2>
        {profile.stories.length === 0 ? (
          <p className="profile-empty">
            {profile.isMe
              ? 'Nothing published yet. A story appears here once it goes live.'
              : `${profile.name} has not published a story yet.`}
          </p>
        ) : (
          <ul className="profile-stories">
            {profile.stories.map((story) => (
              <li key={story.id}>
                <Link href={`/stories/${story.id}`}>
                  <Image src={story.coverUrl} alt="" width={96} height={132} />
                  <span>
                    <strong>{story.title}</strong>
                    <small>
                      {story.genre} <i>•</i> {story.chapterCount}{' '}
                      {story.chapterCount === 1 ? 'chapter' : 'chapters'}
                    </small>
                    <span className="profile-synopsis">{story.synopsis}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <nav className="profile-bottom-nav" aria-label="Primary navigation">
        <Link href="/">
          <House />
          <span>Home</span>
        </Link>
        <Link href="/discover">
          <Compass />
          <span>Explore</span>
        </Link>
        <Link href="/library">
          <BookOpen />
          <span>Library</span>
        </Link>
        <Link href={viewer ? dashboardForRole(viewer.role) : '/login'}>
          <UsersThree />
          <span>{viewer ? 'Dashboard' : 'Sign in'}</span>
        </Link>
      </nav>
    </div>
  );
}
