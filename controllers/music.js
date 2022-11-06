const musicModel = require("../models/music");
const path = require("path");
const { request } = require("http");
function optUpload(ctx) {
  /**
   * 没有获取id
   */
  // console.log(ctx.request.files); //文件
  // console.log("====================================");
  // console.log(ctx.request.body); //字符串
  //接收请求数据
  //1.获取字符串数据
  let { title, singer, time } = ctx.request.body;
  //2.获取文件=>保存文件的网络路径（方便 /public 请求返回）
  let { file, filelrc } = ctx.request.files;
  //  保存文件的绝对路径也可以，但是麻烦
  let saveSingObj = {
    title,
    singer,
    time,
  };
  //    歌词可选
  //为了后面微信小程序，也能调用这个接口，默认的数据
  saveSingObj.filelrc = "no upload filelrc";
  if (filelrc) {
    //                                            filelrc.path文件路径  .base加后缀
    saveSingObj.filelrc = "/public/files/" + path.parse(filelrc.path).base;
  }
  //歌曲不能为空
  if (!file) {
    ctx.throw("歌曲必须上传");
    return;
  }
  //处理歌曲路径
  saveSingObj.file = "/public/files/" + path.parse(file.path).base;
  //加入用户id，判断这首歌是谁的,未来使用session
  saveSingObj.uid = 1;
  // console.log(saveSingObj);
  return saveSingObj;
}
module.exports = {
  //添加音乐
  addMusic: async (ctx, next) => {
    let saveSingObj = optUpload(ctx);
    //3.插入数据到数据库
    let result = await musicModel.addMusicByObj(saveSingObj);
    //4.响应结果给用户
    ctx.body = {
      //ajax接收到的状态信息
      code: "001",
      msg: result.message,
    };
  },
  //更新音乐
  updateMusic: async (ctx, next) => {
    console.log(ctx.request);
    let saveSingObj = optUpload(ctx);
    //获取id
    let { id } = ctx.request.body;
    //给saveSingObj添加上id
    Object.assign(saveSingObj, { id });
    //更新数据
    let result = await musicModel.updateMusic(saveSingObj);
    //4.响应结果给用户
    if (result.affectedRows !== 1) {
      //没有更新成功(throw是针对页面的操作，这里是ajax请求，返回状态码002)
      ctx.body = {
        //ajax接收到的状态信息
        code: "002",
        msg: "更新失败" + result.message,
      };
      return;
    }
    ctx.body = {
      //ajax接收到的状态信息
      code: "001",
      msg: "更新成功",
    };
  },
  // 删除音乐
  deleteMusic: async (ctx, next) => {
    //接收请求URL中的查询字符串
    let id = ctx.request.body;
    // console.log(id);
    // 删除音乐
    let result = await musicModel.deleteMusic(id);
    // console.log(result);
    //判断删除是否成功
    if (result.affectedRows !== 1) {
      ctx.body = {
        //ajax接收到的状态信息
        code: "002",
        msg: "删除失败" + result.message,
      };
      return;
    }
    ctx.body = {
      //ajax接收到的状态信息
      code: "001",
      msg: "删除成功",
    };
  },
  //编辑音乐的页面
  showEdit: async (ctx, next) => {
    //通过 ctx.request.body 在网页中获取不到数据，但在postman中可以获取
    let id = ctx.request.query;
    // console.log(ctx.request);
    //通过id查询音乐
    let musics = await musicModel.fildMusicById(id);
    //判断是否有该歌曲
    if (musics.length === 0) {
      ctx.throw("歌曲不存在");
      return;
    }
    // console.log(musics);
    let music = musics[0];
    //渲染edit页面
    ctx.render("edit", { music: music });
  },

  showIndex: async (ctx, next) => {
    let uid = ctx.session.user.id;
    // console.log(uid);
    let musics = await musicModel.fildMusicByUid(uid);
    // console.log(musics);
    ctx.render("index", { musics });
  },
};
