const userModel = require("../models/user");
const captchapng = require("captchapng2");
module.exports = {
  showRegister: async (ctx, next) => {
    // let users = await userModel.getUsers();
    // console.log(users);
    ctx.render("register");
  },
  /*判断用户是否存在*/
  checkUsername: async (ctx, next) => {
    //处理接收请求之类的繁琐事务，唯独不CRDU(操作数据)
    let { username } = ctx.request.body; //解构
    //查询数据库中是否存在该用户
    let users = await userModel.findUserByUsername(username);
    //判断users数组的长度是否为0
    if (users.length === 0) {
      ctx.body = { code: "001", msg: "可以注册" };
      return;
    }
    //不为0，就是已存在用户
    ctx.body = { code: "002", msg: "用户已存在" };
  },
  /*注册用户*/
  doRegister: async (ctx, next) => {
    //做异常捕获
    console.log(ctx.session.v_code);
    try {
      let { username, password, email, v_code } = ctx.request.body; //解构
      //v_code和ctx.session.v_code进行比较
      if (v_code !== ctx.session.v_code) {
        ctx.body = {
          code: "002",
          msg: "验证码不匹配",
        };
        return;
      }

      //查询数据库中是否存在该用户
      let users = await userModel.findUserByUsername(username);
      if (users.length !== 0) {
        ctx.body = { code: "002", msg: "用户已存在" };
        return;
      }
      let user = await userModel.registerUser(username, password, email);
      //判断是否插入数据成功
      if (user.affectedRows === 1) {
        ctx.body = { code: "001", msg: "注册成功" };
        return;
      }
      //不等于1的情况会发生在id冲突，就不插入数据
      ctx.body = { code: "002", msg: use.message };
    } catch (e) {
      //根据 e 的一些 code 判断错误，返回页面
      ctx.throw("002");
    }
  },
  /**用户登录 */
  doLogin: async (ctx, next) => {
    //1.接收参数
    let { username, password } = ctx.request.body; //解构
    //查询数据库中是否存在该用户
    let users = await userModel.findUserByUsername(username);
    //判断users数组的长度是否为0
    if (users.length === 0) {
      ctx.body = { code: "002", msg: "用户名或者密码不正确" };
      return;
    }
    //2.查询用户名相关的用户
    let user = users[0]; //注册必须控制死，不能存在相同用户名的数据

    //3.对比密码是否一致，
    if (user.password === password) {
      //如果密码正确，认证用户 session 放属性区分是否登录
      ctx.body = { code: "001", msg: "登录成功", user };
      //挂在session用户认证判断
      ctx.session.user = user;
      return;
    }
    //响应 json 结果：code：002
    ctx.body = { code: "002", msg: "用户名或者密码不正确", user };
  },
  //获取验证码
  getPic: (ctx, next) => {
    let rand = parseInt(Math.random() * 9000 + 1000);
    //储存rand,之后进行比较验证码
    ctx.session.v_code = rand + "";
    let png = new captchapng(80, 30, rand);
    ctx.body = png.getBuffer();
  },
  //用户退出
  logout: async (ctx, next) => {
    //1.清除session上的user
    //2.重定向到/user/login
    ctx.session.user = null;
    ctx.redirect("/user/login");
  },
};
