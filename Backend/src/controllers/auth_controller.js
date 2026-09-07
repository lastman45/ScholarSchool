import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
   const { fullName, email, password } = req.body;
   const name = typeof fullName === "string" ? fullName.trim() : "";
   const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
   const pass = typeof password === "string" ? password : "";

   try {
    if (!name || !normalizedEmail || !pass){
        return res.status(400).json({message: "All fields are required"});
        //TODO:Modify to identify which field specificaly
    }
    if (pass.length < 6) {
        return res.status(400).json({message: "Password must be at least 6 characters"});
        //TODO:add an alphanumeric checker
    }
    //Checks email Validity: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)){
         return res.status(400).json({message: "Invalid email format"});
    }

    const user = await User.findOne({email: normalizedEmail});
    if(user) return res.status(400).json({message:"Email already exists"})
    //TODO:add a redirect function to sign in

    //Password Hashing
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(pass, salt)

    const newUser = new User ({
        fullName: name,
        email: normalizedEmail,
        password: hashedPassword
    })

    if(newUser) {
        const savedUser =await newUser.save();
        generateToken(savedUser._id, res);

        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email,
            profilePic:newUser.profilePic,
        });

        //TODO: send a welcome email to new users
    }else {
        res.status(400).json({
            message: "Invalid user data"
        });
    }


   }catch (error){
    console.error("Error in Sign Up controller:", error);
    //Handle race-condition:unique email constraint violation
    if (error?.code === 11000 && (error.keyPattern?.email || error.keyValue?.email)){
        return res.status(409).json({message: "Email already exists"});
    }
    return res.status(500).json({message: "Internal server error"});
   }
};