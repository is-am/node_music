const db = require("./db");
module.exports = {
  addMusicByObj: async (sing) =>
    await db.q(
      "insert into musics (title,time,singer,filelrc,file,uid) values (?,?,?,?,?,?)",
      Object.values(sing)
    ),
  updateMusic: async (music) =>
    await db.q(
      "update musics set title=?,time=?,singer=?,filelrc=?,file=?,uid=? where id=? ",
      Object.values(music)
    ),
  deleteMusic: async (id) =>
    await db.q("DELETE FROM musics WHERE id=? ", Object.values(id)),
  fildMusicById: async (id) =>
    await db.q("select * from musics where id=?", Object.values(id)),
  fildMusicByUid: async (uid) =>
    await db.q("select * from musics where uid=?", [uid]),
};
