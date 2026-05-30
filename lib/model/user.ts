import mongoose, {Types} from "mongoose";
export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  password: string;
  profileImg?: string;
  projects? : Types.ObjectId[];
  isEmailVerified: boolean;
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
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },
    phone: String,
    address: String
  },

  organization: {
    jobTitle: String,
    department: String,
    workPlace: String,
    workAddress: String
  },

  profileImg: String,
  isEmailVerified: { type: Boolean, default: false },
  projects :  [{
    type : mongoose.Schema.Types.ObjectId,
    ref : "Project"
  }]
   
}, { timestamps: true });

const User =
  mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);

export default User;