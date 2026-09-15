// "use client";

// import { useState, useOptimistic, useTransition } from "react";
// import { createUserAction } from "@/lib/actions";
// import { IUser } from "@/models/user";

// export default function UserManagement({ initialUsers }: { initialUsers: IUser[] }) {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [age, setAge] = useState("");
//   const [formError, setFormError] = useState("");
//   const [, startTransition] = useTransition();

//   // Optimistic UI hook
//   const [optimisticUsers, addOptimisticUser] = useOptimistic(
//     initialUsers,
//     (currentUsers: IUser[], newUser: IUser) => [newUser, ...currentUsers]
//   );

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError("");

//     // 1. Synchronous validation fix (evaluating values directly, not stale state)
//     let errorMsg = "";
//     if (!name.trim() || !email.trim()) {
//       errorMsg = "Name and email are required.";
//     } else if (!email.includes("@")) {
//       errorMsg = "Please enter a valid email address.";
//     }

//     if (errorMsg) {
//       setFormError(errorMsg);
//       return; // Stop execution cleanly
//     }

//     const payload = {
//       name,
//       email,
//       age: age ? Number(age) : undefined,
//     };

//     // 2. Trigger Optimistic UI inside transition
//     startTransition(async () => {
//       addOptimisticUser({
//         ...payload,
//         _id: `temp-${Date.now()}`, // Temporary key for rendering
//       });

//       // Clear inputs immediately for smooth UX
//       setName("");
//       setEmail("");
//       setAge("");

//       // 3. Persist to server
//       const result = await createUserAction(payload);
//       if (!result.success) {
//         setFormError(result.error || "Something went wrong.");
//       }
//     });
//   };

//   return (
//     <div className="max-w-md mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4 mb-8">
//         <div>
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full border p-2 rounded"
//           />
//         </div>
//         <div>
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full border p-2 rounded"
//           />
//         </div>
//         <div>
//           <input
//             type="number"
//             placeholder="Age"
//             value={age}
//             onChange={(e) => setAge(e.target.value)}
//             className="w-full border p-2 rounded"
//           />
//         </div>

//         {/* Display validation error safely inside JSX */}
//         {formError && <p className="text-red-500 text-sm">{formError}</p>}

//         <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
//           Add User
//         </button>
//       </form>

//       {/* Rendered Optimistic User List */}
//       <div className="space-y-2">
//         <h2 className="font-bold text-lg">User List</h2>
//         {optimisticUsers.map((user) => (
//           <div key={user._id || user.email} className="border p-3 rounded shadow-sm">
//             <p className="font-semibold">{user.name}</p>
//             <p className="text-sm text-gray-600">{user.email}</p>
//             {user.age && <p className="text-xs text-gray-500">Age: {user.age}</p>}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// --------------------------------------------------------------------





"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { createUserAction } from "@/lib/actions";
import { IUser } from "@/models/user";

export default function UserManagement({ initialUsers }: { initialUsers: IUser[] }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [formError, setFormError] = useState("");
  const [userList, setUserList] = useState<IUser[]>(initialUsers);
  const [, startTransition] = useTransition();

  const [optimisticUsers, addOptimisticUser] = useOptimistic(
    initialUsers,
    (currentUsers: IUser[], newUser: IUser) => [newUser, ...currentUsers]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim() || !email.trim()) {
      setFormError("Name and email are required.");
    } else if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
    }

    if (formError) {
      return;
    }

    const payload = {
      name,
      email,
      age: age ? Number(age) : undefined,
    };

    startTransition(async () => {
      addOptimisticUser({
        ...payload,
        _id: `temp-${Date.now()}`, // Temporary key for rendering
      });

     
      setName("");
      setEmail("");
      setAge("");

      // 3. Persist to server
      const result = await createUserAction(payload);
      if (!result.success) {
        setFormError(result.error || "Something went wrong.");
      }
    });

  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded text-yellow-300"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded text-yellow-300"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full border p-2 rounded text-yellow-300"
          />
        </div>

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add User
        </button>
      </form>

      <div className="space-y-2">
        <h2 className="font-bold text-lg">User List</h2>
        {optimisticUsers.map((user) => (
          <div key={user._id || user.email} className="border p-3 rounded shadow-sm">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            {user.age && <p className="text-xs text-gray-500">Age: {user.age}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

