const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
    try {
        // Set DNS servers to Google DNS to bypass local router DNS resolution issues (querySrv ECONNREFUSED)
        dns.setServers(["8.8.8.8", "8.8.4.4"]);

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ Database Connection Failed:", error.message);
        process.exit(1);
    }
};

module.exports = connectDB;