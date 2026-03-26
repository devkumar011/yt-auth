import dotenv from "dotenv";

// ?? Force correct path
dotenv.config({ path: "./.env" });

console.log("DEBUG ENV:", process.env.MONGO_URI);

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in .env file");
}
if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in .env file");
}


const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET
};

export default config;