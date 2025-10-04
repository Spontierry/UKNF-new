import { register } from "@/actions/auth";
import { db } from "@/db";

export default async function Home() {
  const user = await db.query.user.findMany();
  return (
    <main>
      <div>Hello world!</div>
      <form action={register}>
        <input name="name" />
        <input name="email" />
        <button type="submit">Register</button>
      </form>
    </main>
  );
}
