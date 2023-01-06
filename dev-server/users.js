
var user_1000kks = 
{
  "user": {
    "id": 10001,
    "banned":  false,
    "username": "1000kks",
    "token": null,
    "thumbnailUrl": null,
    "dateJoined": "1900-01-01T00:00:00.000Z",
    "email": "kito@j-code.org"
  },
  "permissions": {
    "admin": false,
    "scratcher": true,
    "new_scratcher": false,
    "invited_scratcher": false,
    "social": true,
    "educator": false,
    "educator_invitee": false,
    "student": true,
    "mute_status": {}
},
  "flags": {
    "must_reset_password": false,
    "must_complete_registration": false,
    "has_outstanding_email_confirmation": false,
    "show_welcome": false,
    "confirm_email_banner": false,
    "unsupported_browser_banner": false,
    "project_comments_enabled": false,
    "gallery_comments_enabled": false,
    "userprofile_comments_enabled": false,
    "everything_is_totally_normal": false
}
}

const user_1001re =
{
    "user": {
      "id": 69683095,
      "banned":  false,
      "username": "1001re",
      "token": "ebfd0d9199ff4bd286a4245414660b01:Jy3Bwtq3Ip4Gl4fIwsDBepM4raU",
      "thumbnailUrl": "//cdn2.scratch.mit.edu/get_image/user/69683095_32x32.png",
      "dateJoined": "2021-01-06T07:10:56",
      "email": "1000re@j-code.org",
      "classroomId": 367806
    },
    "permissions": {
      "admin": false,
      "scratcher": true,
      "new_scratcher": false,
      "invited_scratcher": false,
      "social": true,
      "educator": false,
      "educator_invitee": false,
      "student": true,
      "mute_status": {}
    },
    "flags": {
      "must_reset_password": false,
      "must_complete_registration": false,
      "has_outstanding_email_confirmation": false,
      "show_welcome": true,
      "confirm_email_banner": true,
      "unsupported_browser_banner": true,
      "project_comments_enabled": true,
      "gallery_comments_enabled": true,
      "userprofile_comments_enabled": true,
      "everything_is_totally_normal": false
    }
}
const user_logout =
{
    "flags": {
      "project_comments_enabled": true,
      "gallery_comments_enabled": true,
      "userprofile_comments_enabled": true,
      "everything_is_totally_normal": false
    }
}

var session_user = user_logout

var users = {}
users.find = function(username) {
  return user;
}

users.session = function(next) {
  return next(session_user)
}

/*
  req: { username: '1000kks', password: '3', useMessages: true }
  next (response)
*/

users.login = function(req, next) {
    var username = req.username
    if (username == user_1000kks.user.username) {
        console.log("!! user_1000kks")
        session_user = user_1000kks
    } else if (username == user_1001re.user.username) {
        session_user = user_1001re
    } else {
        session_user = user_logout
        return next([{
            id: null,
            username: username,
            token: null,

            success: 0,
            messages: [],
            msg: "ユーザー名またはパスワードが間違っています",
            num_tries: 1,
        }])
    }
    return next([{
        id: session_user.user.id,
        username: username,
        token: session_user.user.token,
        success: 1,
        messages: [],
        msg: "",
        num_tries: 1,
    }])
}  

users.logout = function(next) {
  session_user = user_logout
  return next(session_user)
}

module.exports = users
