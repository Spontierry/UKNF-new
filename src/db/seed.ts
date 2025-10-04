import { db } from "./index";
import { user, organization } from "./schema/auth";
import { nanoid } from "nanoid";

export async function seedDatabase() {
  try {
    // Create organizations
    const uknfOrg = await db
      .insert(organization)
      .values({
        id: nanoid(),
        name: "UKNF - Polish Financial Supervision Authority",
        type: "uknf",
      })
      .returning();

    const clientOrg = await db
      .insert(organization)
      .values({
        id: nanoid(),
        name: "ABC Financial Corp",
        type: "client",
      })
      .returning();

    // Create users
    const uknfAdmin = await db
      .insert(user)
      .values({
        id: nanoid(),
        name: "Jan Kowalski",
        email: "jan.kowalski@uknf.gov.pl",
        role: "admin",
        organizationId: uknfOrg[0].id,
        emailVerified: true,
      })
      .returning();

    const uknfEmployee = await db
      .insert(user)
      .values({
        id: nanoid(),
        name: "Anna Nowak",
        email: "anna.nowak@uknf.gov.pl",
        role: "employee",
        organizationId: uknfOrg[0].id,
        emailVerified: true,
      })
      .returning();

    const clientAdmin = await db
      .insert(user)
      .values({
        id: nanoid(),
        name: "Piotr Wiśniewski",
        email: "piotr.wisniewski@abcfincorp.com",
        role: "admin",
        organizationId: clientOrg[0].id,
        emailVerified: true,
      })
      .returning();

    const clientEmployee = await db
      .insert(user)
      .values({
        id: nanoid(),
        name: "Maria Kowalczyk",
        email: "maria.kowalczyk@abcfincorp.com",
        role: "employee",
        organizationId: clientOrg[0].id,
        emailVerified: true,
      })
      .returning();

    console.log("Database seeded successfully!");
    console.log("Created users:", {
      uknfAdmin: uknfAdmin[0].email,
      uknfEmployee: uknfEmployee[0].email,
      clientAdmin: clientAdmin[0].email,
      clientEmployee: clientEmployee[0].email,
    });

    return {
      uknfAdmin: uknfAdmin[0],
      uknfEmployee: uknfEmployee[0],
      clientAdmin: clientAdmin[0],
      clientEmployee: clientEmployee[0],
    };
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
