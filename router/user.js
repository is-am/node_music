const Router = require("koa-router");
let userRouter = new Router();

let userController = require("../controllers/user");

userRouter
  //注册页面
  .get("/user/register", userController.showRegister)
  //验证用户是否已存在
  .post("/user/check-username", userController.checkUsername)
  //注册用户
  .post("/user/do_register", userController.doRegister)
  //用户登录
  .post("/user/do-login", userController.doLogin)
  //用户退出
  .get("/user/logout", userController.logout)
  //验证码
  .get("/user/get-pic", userController.getPic)
  //登录页面
  .get("/user/login", async (ctx) => {
    ctx.render("login", {
      host: "127.0.0.1:9999",
    });
  });
module.exports = userRouter;
