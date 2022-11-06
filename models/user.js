const db = require("./db.js");
module.exports = {
  getUsers: async () => await db.q("select * from node_music", []),
  findUserByUsername: async (username) =>
    await db.q("select * from node_music where username = ?", username),
  registerUser: async (...user) =>
    await db.q(
      "insert into node_music (username,password,email) values (?,?,?)",
      user
    ),
};
