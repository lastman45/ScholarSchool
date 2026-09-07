import express from 'express';
import dotenv from "dotenv";
import path from "path";

import authRoutes from "./routes/auth_route.js"
import messageRoutes from "./routes/message_route.js"
import { connectDB } from './lib/db.js';
import { error } from 'console';

dotenv.config();

const app = express();
const __dirname = path.resolve();

const PORT = process.env.PORT || 3000;

app.use(express.json())//middleware that gives access to the fields user sends


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//Make ready for deployment
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req,res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"))
    })
}


app.listen(PORT, () => {
     console.log('Server is running on port:' + PORT)
     connectDB();
    });


//TODO:switch to this when done
/*connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on PORT: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to connect to MONGODB:", error);
        process.exit(1);
    }); */