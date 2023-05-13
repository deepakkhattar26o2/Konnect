import { model, Schema } from "mongoose";
import { IUser } from "../../TypeDefs";
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    require: true,
    matches:
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|mil|biz|info|mobi|name|aero|jobs|museum)\b/,
  },
  firstName: { type: String, require: true },
  lastName: { type: String, require: true },
  password: { type: String, require: true, min: 4 },
});

const User = model<IUser>("User", UserSchema);

export { User, IUser };
