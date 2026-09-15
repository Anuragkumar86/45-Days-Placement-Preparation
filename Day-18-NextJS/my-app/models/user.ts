import { Schema, models, model } from "mongoose";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  age?: number;
  createdAt?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  age: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },
});

const User = models.User || model<IUser>("User", UserSchema);
export default User;