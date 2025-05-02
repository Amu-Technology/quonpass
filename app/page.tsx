'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main>
      {session ? (
        <>
          <p>ようこそ、{session.user?.name}さん！</p>
          <p>ようこそ、{session.user?.email}さん！</p>
          <p>ようこそ、{session.user?.image}さん！</p>
          <p>ようこそ、{session.user?.id}さん！</p>

          <button onClick={() => signOut()}>サインアウト</button>
        </>
      ) : (
        <button onClick={() => signIn('google')}>Googleでサインイン</button>
      )}
    </main>
  );
}
