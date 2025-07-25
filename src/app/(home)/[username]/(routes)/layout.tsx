import { getAuthenticatedUser } from '@/features/auth/actions/get-authenticated-user';
import { getUserByUsername } from '@/features/profile/actions/get-user-by-username';
import { ProfileNavigation } from '@/features/profile/components/ProfileNavigation';
import { UserProfileInfo } from '@/features/profile/components/UserProfileInfo';
import { HeaderPageMobile } from '@/core/shared/components/HeaderPageMobile';

type Params = Promise<{ username: string }>;

export default async function RoutesLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Params;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);
  const authenticatedUser = await getAuthenticatedUser();

  const isAuthenticatedUser = user.username === authenticatedUser.username;

  return (
    <>
      <HeaderPageMobile username={username} />
      <UserProfileInfo user={user} isAuthenticatedUser={isAuthenticatedUser} />
      <ProfileNavigation
        username={user.username}
        isAuthenticatedUser={isAuthenticatedUser}
      />
      {children}
    </>
  );
}
