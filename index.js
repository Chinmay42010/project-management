import dotenv from "dotenv"

process.env.username

dotenv.config({
    path:"./.env",
})

const myusername = process.env.username;


console.log(`Start of backend project`);
console.log(myusername);
