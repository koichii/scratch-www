var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'www',
    serializers: {req: bunyan.stdSerializers.req}
});

var assets = {}
var assets_data = {}

// next(err)
assets.file_put = function(file, data, next) {
    assets_data[file] = data
    return next(null)
}

// next(err, data)
assets.file_get = function(file, next) {
    if (assets_data[file]) {
        return next(null, assets_data[file])
    }
    //console.log("File not found in ASSETS !!!")
    return next("File not found", null)
}

var thumbnail_data = {}

// next(err)
assets.thumbnail_put = function(file, data, next) {
    thumbnail_data[file] = data
    return next(null)
}

// next(err, data)
assets.thumbnail_get = function(file, next) {
    if (thumbnail_data[file]) {
        return next(null, thumbnail_data[file])
    }
    //console.log("!! thumbnail not found !!")
    return next("File not found", null)
}

var proj_json = {}

assets.json_put = function(id, json, next) {
    proj_json[id] = json
    return next(null)
}

assets.json_get = function(id, callback) {
    if (proj_json[id]) {
        return callback(null, proj_json[id])
    }
    return callback("not found", null)
}

var last_project_id = 100000000

var def_proj_info = {
    "id":null,
    "title":"ななし",
    "description":"",
    "instructions":"",
    "visibility":"visible","public":false,"comments_allowed":true,"is_published":false,
    "author":{
        "id":null,
        "username":"",
        "scratchteam":false,
        "history":{ "joined":"1900-01-01T00:00:00.000Z" },
        "profile":{ "id":null, "images":{ "32x32":null }}
    },
    "image": null,
    "images":{ "282x218":null, "216x163":null, "200x200":null, "144x108":null, "135x102":null, "100x80":null},
    "history":{"created":"1900-01-01T00:00:00.000Z","modified":"1900-01-01T00:00:00.000Z","shared":null},
    "stats":{"views":0,"loves":0,"favorites":0,"remixes":0},
    "remix":{"parent":null,"root":null},
    "project_token":null
}

var proj_info_data = {}

assets.info_create = function(user, json, next) {
    last_project_id += 1
    var info = Object.assign({}, def_proj_info);
    info.id = last_project_id
    info.author.id = user.id
    info.author.username = user.username
    info.image = `//192.168.0.10:8333/BACKPACK_HOST/thumbnail_${last_project_id}.png`
    console.log("info.author:", info.author)
    proj_info_data[last_project_id] = info
    assets.json_put(last_project_id, json, ()=>{
        return next(last_project_id)
    })
}

assets.info_get = function(id, next) {
    if (proj_info_data[id]) {
        console.log("INFO:")
        logger.info(proj_info_data[id])
        return next(null, proj_info_data[id])
    }
    return next("!Noot Found!", null)
}

assets.info_put = function(id, data, next) {
    if (! proj_info_data[id]) {
        return next("!Noot Found!", null)
    }
    //console.log(proj_info_data[id])
    Object.assign(proj_info_data[id], data);
    //console.log(proj_info_data[id])
    return next(null, proj_info_data[id])
}

/*
    proj_info_data[last_project_id] = {info:info, json:json}
*/
assets.get_all_projects = function(next) {

    var projects = []
    Object.keys(proj_info_data).forEach((id)=>{

        var info0 = proj_info_data[id]
        var info = new Object()
        info.id = id
        info.thumbnail_url = info0.image
        info.itle = info0.title
        info.creator = info0.author.username
        info.type = "project"
        info.love_count=0
        //console.log(info)
        projects.push(info)
    })
    return next(projects)    
}
module.exports = assets
