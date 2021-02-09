import { G_GameAgent, G_NativeAgent, G_UserData } from "../init";

export namespace WxUtil {
    export function shareAppMessage(title: string, imageUrl: string, query?: Object) {
        query = query ||{ "uerId": G_UserData.getBase().getId(), "serverId": G_GameAgent.getLoginServer().getServer()};
        console.log('share query', query);
        var shareContent = {
            title: title,
            imageUrl: imageUrl || "wxlocal/share.png",
            query: obj2query(query),
        }

        share(shareContent);
    }

    function share(content: any) {
        let shareFunc = wx.shareAppMessage
        shareFunc(content);
    }

    export function obj2query(obj: any): string {
        if (!obj) {
            return '';
        }
        var arr: string[] = [];
        for (var key in obj) {
            arr.push(key + '=' + obj[key]);
        }
        return arr.join('&');
    }
}