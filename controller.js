const baseController = require('controllers/base.js');
const yapi = require('yapi.js');
const axios = require('axios');
const JSON5 = require('json5');

class RapController extends baseController {
  constructor(ctx) {
    super(ctx)
  }

  /**
   * RAP接口
   * @interface /rap/get
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number} id 接口id，不能为空
   * @param {String} cookie cookie，不能为空
   * @returns {Object}
   * **/
  async rapJson(ctx) {
    // let id = ctx.request.url.split('?')[1].split('=')[1]
    let project_id = ctx.request.query.project_id;
    let rap_project_id = ctx.request.query.id;
    let cookie = ctx.request.query.cookie;
    if (!project_id || !/^\d+$/g.test(rap_project_id)) {
      return (ctx.body = yapi.commons.resReturn(null, 400, '请填写正确的项目id'));
    }
    let result
    let project = await this.projectModel.getBaseInfo(project_id);
    if (project.project_type === 'private') {
      if ((await this.checkAuth(project._id, 'project', 'view')) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, '没有权限'));
      }
    }
    await axios.get(global.importRap.origin+'/backend/repository/get?id='+rap_project_id, {
      headers: {
        "Cookie": "koa.sid=P8T0b_9E2vH_FHzJxW6jyQODJPRqsTm2; koa.sid.sig=27k_fX44DT1ZJ-dPicUMfEJ-tBk"
      }
    }).then(res => {
      let data = res.data.data
      if (data && data.modules) {
        let modules = data.modules
        result = yapi.commons.resReturn(modules);
      } else {
        result = yapi.commons.resReturn(null, 400, '查询数据失败，请确认rap地址正确，以及projectId存在')
      }
    })
    ctx.body = result;
  }

}

module.exports = RapController;
