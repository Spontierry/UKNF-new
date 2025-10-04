import { db } from "@/db";

export default async function Home() {
  const user = await db.query.user.findMany();
  return (
    <main>
      <div>Hello world!</div>
      <div>{JSON.stringify(user)}</div>
    </main>
  );
}
