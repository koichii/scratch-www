const router = require('express').Router()
const assets = require('./assets')
const users = require('./users')
const axios = require('axios')
const bodyParser = require('body-parser');
const rawParser = bodyParser.raw({type:function(){return true}})

/*
*/
router.get("^/projects(/editor|(/\\d+(/editor|/fullscreen)?)?)?/?(\\?.*)?$", function (req, res, next) {
    req.url = "/projects.html"
    return next()
})

router.get('/', function (req, res, next) {
    req.url = "/splash.html"
    return next()
})
router.get('/mystuff', function (req, res, next) {
    req.url = "/splash.html"
    return next()
})

/*
定期的に呼ばれるので、現在のセッションの状況を返す
リクエスト URL: https://scratch.mit.edu/session/
リクエスト メソッド: GET
*/
router.get('/session', function (req, res, next) {
    users.session((response)=> {
        return res.json(response)
    })
})
/*
    logout
*/
router.post('/accounts/logout/', function (req, res, next) {
    users.logout(()=>{
        return res.redirect('/');
    })
})
/*
    login request.post("https://scratch.mit.edu/accounts/login/", data = {username: "1000re", password: "9999", useMessages: true})
*/
router.post('/accounts/login/', function (req, res, next) {
    //console.log('!!/accounts/login/', req.body);
    var username = req.body.username
    users.login(req.body, (response)=>{
        return res.json(response);
    })
})

/*
【直ちに保存】で呼ばれる
リクエスト URL: http://192.168.0.10:8333/internalapi/project/thumbnail/100000002/set/
リクエスト メソッド: POST
accept-ranges: bytes content-encoding: gzip
{"status":"ok","content-length":12844,"content-name":"782238738","autosave-internal":"120","result-code":0}
*/
router.post('/internalapi/project/thumbnail/:id/set/', rawParser, function (req, res, next) {
    //console.log("/internalapi/project/thumbnail/:id/set/")
    //console.log(req.body)
    var id = req.params.id
    assets.file_put(`thumbnail_${id}.png`, req.body, ()=>{
        return res.json({ 
            "status":"ok","content-name":id,"autosave-internal":"120","result-code":0
        });
    })
})



/*
    API_HOST: project 情報　読み込み
    http://192.168.0.10:8333/API_HOST/projects/773136774
    https://api.scratch.mit.edu/projects/701216658
*/
router.get('/API_HOST/projects/:id', function (req, res, next) {
    var id = req.params.id
    assets.info_get(id, (err, info)=>{
        if (!err) {
            return res.json(info);
        }
        console.log("!!!projects.get_info err:", err)
        axios.get('https://api.scratch.mit.edu/projects/'+id)
        .then(function (response) {
          // handle success
          //console.log(response.data);
          return res.json(response.data)
        })
        .catch(function (error) {
          // handle error
          console.log(error);
          return next(error);
        })
    })
})

/*
    API_HOST: project 情報　更新
    リクエスト URL: http://192.168.0.10:8333/API_HOST/projects/100000001
    リクエスト メソッド: PUT
    {title: "ななし44"}
*/
router.put('/API_HOST/projects/:id', function (req, res, next) {
    //console.log("/API_HOST/projects/:id:", req.body)
    var id = req.params.id
    assets.info_put(id, req.body, (err, response)=>{
        return res.json(response);
    })
})

/*
    API_HOST: featured
http://192.168.0.10:8333/API_HOST/proxy/featured
*/
router.get('/API_HOST/proxy/featured', function (req, res, next) {
    assets.get_all_projects((projects)=>{
        var featured = {
            "community_newest_projects": projects,
            "community_most_remixed_projects": [],
            "scratch_design_studio": [], 
            "community_featured_studios": [], 
            "community_most_loved_projects": [], 
            "community_featured_projects": projects
        }
        return res.json(featured);
    })
})

/*
    project 新規作成
    リクエスト URL: http://192.168.0.10:8333/PROJECT_HOST/
    リクエスト メソッド: POST
  */
router.post('/PROJECT_HOST/', function (req, res, next) {
    //console.log('!! new project:', req.body);
    users.session((session) => {
        //console.log("user:", user)
        assets.info_create(session.user, req.body, (id)=>{
            var project = {
                "status":"ok",
                "content-name":id,
                "content-title":"VW50aXRsZWQtNA==",
                "autosave-interval":"120"
            }
            return res.json(project);
        })
    })
})

/*
    project コード書込     【直ちに保存】で呼ばれる
    http://192.168.0.10:8333/PROJECT_HOST/
  */
router.put('/PROJECT_HOST/:id', function (req, res, next) {
    var id = req.params.id
    //console.log('!! write project');
    //console.log(req.params, req.body);
    assets.json_put(id, req.body, ()=>{
        var project = {
            //"status":"ok","content-name":id,"content-title":"VW50aXRsZWQtNg==","autosave-interval":"120"
            "status":"ok","content-name":id,"autosave-interval":"120"
        }
        return res.json(project);
    })
})

/*
    project コード読出
    https://projects.scratch.mit.edu/701216658?token=1672734076_6c28d0791242923bdecd2ea69cc8e747ae01f072a7d453cd288b30a10c7542a2d18065eeca135cdf5e275264bd669b6b6ca169ac7985ec7f1c1c91bd3cda66f0
    http://192.168.0.10:8333/PROJECT_HOST/773136774?token=1672278928_3a

リクエスト URL: http://192.168.0.10:8333/PROJECT_HOST/100000001?token=1672365652_df30ba4d0efe045f379e6bcf386b6b459c455d248b9472dbaf2909a1b4d23684cc26655ba2656d50b932c25c3a565688bff89a926d1fbda3d8a00eb71f228efa
リクエスト メソッド: GET
ステータス コード: 304 OK

  */
router.get('/PROJECT_HOST/:id', function (req, res, next) {
    var id = req.params.id
    assets.json_get(id, (err, project)=>{
        if (!err) {
            return res.json(project);
        }
        axios.get('https://projects.scratch.mit.edu/'+id+'?token='+req.query.token)
        .then(function (response) {
          // handle success
          //console.log(response.data);
          return res.json(response.data)
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            return next(error);
        })
    })
})


/*
リクエスト URL: http://192.168.0.10:8333/ASSET_HOST/5e6341d9adb469f30f2eaa9b39b9e3c7.svg
リクエスト メソッド: POST
*/
router.post('/ASSET_HOST/:file', rawParser, function (req, res, next) {
    var file = req.params.file
    //console.log("=============/:file=============");
    //console.log(file, req.body)
    assets.file_put(file, req.body, (err)=>{
        return res.json({
            "status":"ok",
            "content-name":file
        });
    })
})

/*
    /BACKPACK_HOST/4fa0f6ea1f95fabce7a6169159c12e90.svg
*/
router.get('/BACKPACK_HOST/:file', function (req, res, next) {
    var file = req.params.file
    assets.file_get(file, (err, data)=>{
        if (err) { return next(); }
        //console.log("get internal asset!!")
        res.set({'Content-Disposition': `attachment; filename=${file}`})
        return res.status(200).send(data)
    })
})

module.exports = router
