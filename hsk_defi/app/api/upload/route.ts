import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const Bucket = process.env.AMPLIFY_BUCKET!;
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("img") as File[];

    if (files.length === 0) {
      return new Response(JSON.stringify({ error: "No image uploaded" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const file = files[0];
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer); // Uint8Array instead of Buffer for edge compatibility

    await s3.send(
      new PutObjectCommand({
        Bucket,
        Key: file.name,
        Body: body,
        ContentType: file.type || "image/jpeg",
      })
    );

    return new Response(JSON.stringify({ message: "OK" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("S3 upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
