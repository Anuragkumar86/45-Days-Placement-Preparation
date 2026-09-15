// import { getUsers } from "@/lib/actions";
// import UserManagement from "@/components/UserManagement";

// // React Server Component (Async allowed here)
// export default async function Page() {
//   const users = await getUsers();

//   return (
//     <main className="p-8">
//       <h1 className="text-2xl font-bold text-center mb-6">User Directory</h1>
//       <UserManagement initialUsers={users} />
//     </main>
//   );
// }


// -----------------------------------------------------------------------------












import { getUsers } from "@/lib/actions";
import UserManagement from "@/components/UserManagement";

export default async function Page() {
  const users = await getUsers();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-center mb-6">User Directory</h1>
      <UserManagement initialUsers={users} />
    </main>
  );
}