'use server';

import prisma from '@/core/config/prisma';
import { getAuthenticatedUser } from '@/features/auth/actions/get-authenticated-user';

export const getPosts = async () => {
  const authenticatedUser = await getAuthenticatedUser();

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        {
          author: {
            followers: {
              some: {
                followerId: authenticatedUser.id,
              },
            },
          },
        },
        {
          authorId: authenticatedUser.id,
        },
      ],
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      author: {
        select: {
          profile_photo: true,
          username: true,
          id: true,
        },
      },
      id: true,
      caption: true,
      createdAt: true,
      location: true,
      authorId: true,
      aspect_ratio: true,
      first_image_dimensions: true,
      postImages: {
        select: {
          id: true,
          imageUrl: true,
        },
      },
      likes: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          postId: true,
          userId: true,
          user: {
            select: {
              username: true,
              profile_photo: true,
              fullname: true,
              id: true,
            },
          },
        },
      },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          postId: true,
          text: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              profile_photo: true,
            },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              parentId: true,
              postId: true,
              text: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  profile_photo: true,
                },
              },
              commentLike: {
                orderBy: { createdAt: 'desc' },
                select: {
                  id: true,
                  userId: true,
                  commentId: true,
                  user: {
                    select: {
                      username: true,
                      profile_photo: true,
                      fullname: true,
                      id: true,
                    },
                  },
                },
              },
            },
          },
          commentLike: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              userId: true,
              commentId: true,
              user: {
                select: {
                  username: true,
                  profile_photo: true,
                  fullname: true,
                  id: true,
                },
              },
            },
          },
        },
      },
      savedBy: {
        select: {
          id: true,
          user: {
            select: {
              username: true,
              profile_photo: true,
            },
          },
        },
      },
    },
  });

  return posts;
};
