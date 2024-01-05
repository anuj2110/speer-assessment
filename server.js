const app = require("./app");
const mongoose = require("mongoose");
require('dotenv').config()

const port = 3000
mongoose.connect(process.env.MONGO_URI); 

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
