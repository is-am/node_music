const Router = require("koa-router");
const musicControllers = require("../controllers/music");
let musicRouter = new Router();
musicRouter
  //添加的请求行为在 restful 中，更好的请求规则
  //要求添加=>post
  .post("/music/add-music", musicControllers.addMusic)
  //更新音乐
  .put("/music/update-music", musicControllers.updateMusic)
  //删除音乐
  .delete("/music/delete-music", musicControllers.deleteMusic)
  //音乐列表
  .get("/music/index", musicControllers.showIndex)
  //添加音乐
  .get("/music/add", async (ctx) => {
    ctx.render("add");
  })
  //编辑音乐
  .get("/music/edit", musicControllers.showEdit);
module.exports = musicRouter;
