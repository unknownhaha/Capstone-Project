import { createUploadthing, type FileRouter, UploadThingError } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";
import { auth } from "@/auth";
import User from "@/lib/model/user";
import { connectDB } from "@/lib/db";

export const runtime = "nodejs";

const f = createUploadthing();

export const uploadRouter = {
  profileImg: f({
    image: { maxFileSize: "8MB" },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        await connectDB();

        const userId = metadata.userId;
        const imageUrl = file.ufsUrl ?? file.url ?? (file as any).appUrl ?? (file as any).fileUrl;

        if (!imageUrl) {
          return;
        }

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { profileImg: imageUrl },
          { new: true }
        );

        if (!updatedUser) {
          console.error("[uploadthing] profileImg: user not found", userId);
          return;
        }

        return { success: true, userId };
      } catch (err) {
        console.error("[uploadthing] profileImg:", err);
      }
    }),

  inspectionImg: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url ?? (file as any).appUrl ?? (file as any).fileUrl };
    }),

  projectCoverImg: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await auth();
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url ?? (file as any).appUrl ?? (file as any).fileUrl };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});