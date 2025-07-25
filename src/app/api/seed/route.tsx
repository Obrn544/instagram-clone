import { NextResponse } from 'next/server';

import { promises as fs } from 'fs';
import mime from 'mime';
import path from 'path';
import bcrypt from 'bcrypt';
import sharp from 'sharp';

import prisma from '@/core/config/prisma';
import { initialData } from '@/seed/seed';

import { changeProfilePhoto } from '@/features/profile/actions/change-profile-photo';
import { deleteAllProfilePhotos } from '@/seed/actions/delete-all-profile-photos';
import { createPost } from '@/features/posts/actions/create-post';

export async function POST() {
  try {
    await prisma.like.deleteMany();
    await prisma.commentLike.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.postImages.deleteMany();
    await prisma.post.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.recentSearch.deleteMany();
    await prisma.user.deleteMany();
    await deleteAllProfilePhotos();

    for (const user of initialData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await prisma.user.create({
        data: {
          email: user.email,
          fullname: user.fullname,
          username: user.username,
          password: hashedPassword,
          bio: user.bio,
        },
      });

      const filePath = path.join(
        process.cwd(),
        'src',
        'seed',
        'profile_photos',
        path.basename(user.profile_photo),
      );

      try {
        await fs.access(filePath);
        const fileBuffer = await fs.readFile(filePath);
        const base64Image = fileBuffer.toString('base64');

        await changeProfilePhoto(base64Image, user.username);
      } catch (uploadError) {
        console.error(
          `Error uploading photo for ${user.username}:`,
          uploadError,
        );
      }
    }

    for (const post of initialData.posts) {
      const user = await prisma.user.findUnique({
        where: { username: post.userUsername },
      });

      const firstImage = post.imagesUrl[0];
      const filePath = path.join(
        process.cwd(),
        'src',
        'seed',
        'posts_images',
        path.basename(firstImage),
      );

      const fileBuffer = await fs.readFile(filePath);
      const metadata = await sharp(fileBuffer).metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('No se pudo obtener tamaño de la imagen');
      }

      const imageDimensions = `${metadata.width}/${metadata.height}`;

      const databasePost = await prisma.post.create({
        data: {
          caption: post.caption,
          authorId: user!.id,
          aspect_ratio: post.aspect_ratio,
          first_image_dimensions: imageDimensions,
        },
      });

      for (const postImage of post.imagesUrl) {
        const filePath = path.join(
          process.cwd(),
          'src',
          'seed',
          'posts_images',
          path.basename(postImage),
        );

        try {
          await fs.access(filePath);
          const fileBuffer = await fs.readFile(filePath);

          const mimeType = mime.getType(filePath);
          const base64Body = fileBuffer.toString('base64');
          const base64Image = `data:${mimeType};base64,${base64Body}`;

          const uploadData = await createPost(base64Image, databasePost.id);

          if (uploadData.error) {
            throw new Error(uploadData.error);
          }
        } catch (uploadError) {
          console.error(`Error uploading photo for ${post}:`, uploadError);
        }
      }
    }

    return NextResponse.json(
      { message: 'Seed executed successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('[SEED_ERROR]', error);
    return NextResponse.json(
      { message: 'Failed to execute seed' },
      { status: 500 },
    );
  }
}
