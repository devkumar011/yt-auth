import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: [true,"username is required"],
        unique: [true,"username must be unique"]
    },
    email:{
            type: String,
            required:[ true,"Emial is required"],
            unique: [true, "Email must be unique"]
              
    },
    password:{
        type: String,
        required: [true,"Password is required"]
    }
})

const usermodel = mongoose.model("User", userSchema);
export default usermodel;