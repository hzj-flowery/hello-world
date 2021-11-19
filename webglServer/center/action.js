
exports.analysisURL = function (url) {
    if (url == "" || url == "/") {
        return "unknow"
    }
    if (url.indexOf("api") >= 0)
        return "api"
    else if (url.indexOf("closeServer") >= 0)
        return "close"
    else if (url.indexOf("chat") >= 0)
        return "chat"
    else if (url.indexOf("upload") >= 0)
        return "upload"
    else if (url.indexOf("download") >= 0)
        return "download"
    else if (url.indexOf("copyTitle_bt") >= 0)
        return "copyTitle_bt"
    else if (url.indexOf("copyTitle_ly") >= 0)
        return "copyTitle_ly"
    else
        return "res"
}