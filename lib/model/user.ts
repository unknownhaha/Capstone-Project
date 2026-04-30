import mongoose, {Types} from "mongoose";
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  password: string;
  profileImg?: string;

  contact: {
    email: string;
    phone?: string;
    address?: string;
  };

  organization?: {
    jobTitle?: string;
    department?: string;
    workPlace?: string;
    workAddress?: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}
const userSchema = new mongoose.Schema<IUser>({
  
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true, select: false } ,
  contact: {
    email: { type: String, required: true, unique: true },
    phone: String,
    address: String
  },

  organization: {
    jobTitle: String,
    department: String,
    workPlace: String,
    workAddress: String
  },

  profileImg: String

}, { timestamps: true });

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;