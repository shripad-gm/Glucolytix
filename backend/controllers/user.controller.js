import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const getUser = async (req, res) => {
    const username= req.params;
    try {
        const user = await User.findOne({ username}).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getUser controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateUser = async (req, res) => {
   const { name, email, password, gender, height, weight, age } = req.body;
    userid= req.user._id;
    try {
        let user = await User.findById({ _id: userid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if((!currentPassword&&newpassword)||(currentPassword&&!newpassword)){
            return res.status(400).json({ error: "Please provide current password and new password" });
        }
        if(currentPassword&&newpassword){
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            user.password = hashedPassword;
        }
        user.fullName = fullName || user.fullName;
        user.email = email || user.email
        user.gender = gender || user.gender;
        user.height = height || user.height;
        user.weight = weight || user.weight;
        user.age=age||user.age;
        await user.save();
        res.status(200).json(user); 
    } catch (error) {
        console.log("Error in updateUser controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });       
    }
}

export const deleteUser = async (req, res) => {
    const userid= req.user._id;
    try {
        const user = await User.findByIdAndDelete({ _id: userid });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.log("Error in deleteUser controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}