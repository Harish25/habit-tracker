"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  forcePathStyle: false, 
  endpoint: `https://tor1.digitaloceanspaces.com`, 
  region: "tor1", 
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  }
});

export async function createHabit(
  userId: number, 
  name: string, 
  description?: string 
) {
  const newHabit = await db.habit.create({
    data: {
      creatorId: userId,
      name: name,
      description: description || "", 
    },
  });
  
  revalidatePath("/dashboard");
  return newHabit;
}

export async function logHabit(formData: FormData, userId: number, habitId: number) {
  const notes = formData.get("notes") as string || "";
  const file = formData.get("image") as File | null;
  
  let finalProofUrl = null;

  // 2. Handle File Upload if present
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Path: users/1/habits/5/1710547200-filename.jpg
      const fileKey = `users/${userId}/habits/${habitId}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read', 
      }));

      finalProofUrl = `https://${process.env.DO_SPACES_BUCKET}.tor1.digitaloceanspaces.com/${fileKey}`;
    } catch (error) {
      console.error("DigitalOcean Upload Error:", error);
    }
  }

  // 3. Save to Database using your specific proofFileUrl field
  await db.habitLog.create({
    data: {
      userId: userId,
      habitId: habitId,
      dateCompleted: new Date(),
      notes: notes,
      proofFileUrl: finalProofUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/habits/${habitId}`);
}