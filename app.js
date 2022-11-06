const Koa = require("koa");
const path = require("path"); //核心对象

//创建服务器
let app = new Koa();

//引入router
const userRouter = require("./router/user");
const musicRouter = require("./router/music");
// const bodyParser = require("koa-bodyparser");//涉及文件上传，这个不适合
const formidable = require("koa-formidable");
const session = require("koa-session");

//开启服务器
app.listen(9999, () => {
  console.log("服务器启动  127.0.0.1:9999");
});

//模板渲染
const render = require("koa-art-template");
// const bodyParser = require("body-parser");
render(app, {
  root: path.join(__dirname, "views"),
  extname: ".html",
  //开发的配置 debug:true 不压缩混淆/实时读取文件(静态内容及时得到更新)
  debug: process.env.NODE_ENV !== "production",
});

//引进路由中间件

//中间件使用列表 app.use

//2022/5/24 没看懂的处理异常
app.use(async (ctx, next) => {
  try {
    //先放行
    await next();
  } catch (e) {
    //根据之前的 userController.doRegister
    //e.code之类的状态码是002
    ctx.render("error", { msg: "002状态错误，原因是......" });
  }
});

//为了给 static 重写URL
app.use(async (ctx, next) => {
  //处理静态资源
  //判断 ctx.url 是不是以 /public 开头的
  if (ctx.url.startsWith("/public")) {
    //重写URL
    ctx.url = ctx.url.replace("/public", "");
  }

  if (ctx.url === "/") {
    ctx.url = "/user/login";
  }
  //放行
  await next();
});

//处理静态资源
app.use(require("koa-static")(path.resolve("./public")));

//处理session
let store = {
  storage: {},
  set(key, session) {
    this.storage[key] = session;
  },
  get(key) {
    return this.storage[key];
  },
  destrey(key) {
    delete this.storage[key];
  },
};
app.keys = ["test"]; //基于test字符串进行签名的运算，为的是保证数据不被篡改
app.use(session(store, app));

//判断某些页面url的时候是否有session上的url（登录）
app.use(async (ctx, next) => {
  //判断是否已/user开头,是就直接放行
  if (ctx.url.startsWith("/user")) {
    await next();
    return;
  }
  if (!ctx.session.user) {
    ctx.body = `
    <div>还没登录，请去<a href='/user/login'>登录</a></div>
    `;
  }
  await next();
});

//必须在每次请求挂载新的数据与视图的桥梁（在session之后）
app.use(async (ctx, next) => {
  //如果是express 就是app.locals 视图与数据的桥梁
  ctx.state.user = ctx.session.user; //state数据与视图的桥梁
  //最终都放行
  await next();
});

//处理请求体数据 ctx.request.body 获取
// app.use(bodyParser());//koa-bodyparser只能处理字符数据，不能处理上传文件之类的

//处理文件及字符串
app.use(
  formidable({
    //设置上传目录，否则在用户的temp目录下
    uploadDir: path.resolve("./public/files"),
    //默认根据文件算法生成hash字符串(文件名)，无后缀
    keepExtensions: true, //保持后缀名
  })
);

//路由
app.use(userRouter.routes());
app.use(musicRouter.routes());

app.use(userRouter.routes()); //处理405方法不匹配和501方法未实现
//中间件使用列表    结束
