import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  Gear,
  SquaresFour,
  Users,
} from '@phosphor-icons/react/dist/ssr';
import { CreatorPlatformNavigation } from './creator-platform-navigation';
import './creator-profile.css';

export function CreatorProfile({
  user,
}: {
  user: {
    fullName: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  };
}) {
  return (
    <main className="creator-profile-page">
      <section className="creator-profile-cover" />
      <section className="creator-profile-card">
        <Image
          src={user.avatarUrl || '/readems/community-daniel.png'}
          alt=""
          width={104}
          height={104}
        />
        <h1>{user.fullName}</h1>
        <p>@{user.username}</p>
        <span>
          {user.bio ||
            'Creator, storyteller and member of the Readems community.'}
        </span>
        <div className="creator-profile-stats">
          <b>
            <Users />0<small>Followers</small>
          </b>
          <b>
            <BookOpen />0<small>Stories</small>
          </b>
        </div>
        <div className="creator-profile-actions">
          <Link href="/creator/studio">
            <SquaresFour />
            Open Creator Studio
          </Link>
          <Link href="/creator/settings">
            <Gear />
            Edit Profile
          </Link>
        </div>
      </section>
      <CreatorPlatformNavigation active="profile" />
    </main>
  );
}
