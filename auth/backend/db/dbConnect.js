import mongoose from "mongoose";

const connectDB = async() => {
    // await mongoose.connect(process.env.MONGO_URI || "mongodb://Gagan:gagan@cluster0.fkloojo.mongodb.net/?appName=Cluster0", {}).then(() => {
    //     console.log("MongoDB connected");
    // }).catch((err) => {
    //     console.error("MongoDB connection error:", err);
    // })

    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/onion-auth", {})
        console.log("MongoDB connected");   
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

export default connectDB;