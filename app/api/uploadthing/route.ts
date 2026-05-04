import { createUploadthing, type FileRouter } from "uploadthing/server";
import { createRouteHandler } from "uploadthing/next";
import User from "@/lib/model/user";
import { connectDB } from "@/lib/db";

const f = createUploadthing();

export const uploadRouter = {
  profileImg: f({
    image: { maxFileSize: "4MB" },
  })

  
  .middleware(() => {
    return {
      userId: "680f1a1a1a1a1a1a1a1a1a01",
    };
  })

  .onUploadComplete(async ({ metadata, file }) => {
    console.log("FILE FULL:", file); // 👈 ADD HERE
    try {
      await connectDB();

      const userId = "680f1a1a1a1a1a1a1a1a1a01"; 

      // 🔵 IMPORTANT: UploadThing v10 usually uses file.url
      const imageUrl = file.url;
      console.log("UserId:", metadata.userId);
      console.log("Type:", typeof metadata.userId);
      console.log("File URL:", file.ufsUrl);
      if (!imageUrl) {
        console.log("❌ No file.url returned:", file);
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profileImg: imageUrl },
        { new: true }
      );

      if (!updatedUser) {
        console.log("❌ User not found in DB");
        return;
      }

      console.log("✅ Upload success:", updatedUser);

      return { success: true, userId };

    } catch (err) {
      console.error("❌ UploadThing crash:", err);
      return;
    }
  }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});