import { handler } from "../../utils/handler";

export default class CommonUI extends cc.Component {
    constructor() {
        super();
    }

    private _loadTexturePath: string = "";
    onEnable(): void {

    }
    private _callBack;
    public loadTexture(str: string,callBack?): void {
        if (this.node.getComponent(cc.Sprite)) {
            this._loadTexturePath = str;
            if (str.indexOf("undefined") >= 0) {
                cc.error("传入的路径有问题");
                return;
            }
            this._callBack = callBack;
            cc.resources.load(str, cc.SpriteFrame, handler(this, this.onLoadTextureCallBack));
        }
    }
    private onLoadTextureCallBack(err, sf): void {
        if (!sf&&(err||this._loadTexturePath.indexOf("icon/itemmini")>=0)) {
            var strArr = this._loadTexturePath.split("/");
            var newPath = "";
            var endSpriframeName = "";
            if (strArr.length >= 2) {
                endSpriframeName = strArr[strArr.length - 1];
                for (var j = 0; j < strArr.length - 1; j++) {
                    if (j > 0)
                        newPath = newPath + "/" + strArr[j];
                    else
                        newPath = strArr[j];
                }
                //newPath = newPath + ".plist";
                //加载SpriteAtlas(图集)，并获取其中一张图片
                cc.resources.load(newPath, cc.SpriteAtlas, function (err, atlas) {
                    if (err) {
                        cc.error("加载纹理失败------Path:"+this._loadTexturePath+" newPath:"+newPath);
                        return;
                    }
                    if (this.node == null) {
                        console.log("加载图片成功，但当前对象已经被销毁 ");
                        return;
                    }
                    var sp = this.getComponent(cc.Sprite);
                    sp.spriteFrame = atlas.getSpriteFrame(endSpriframeName);
                    if(this._callBack)this._callBack(sp.spriteFrame);
                }.bind(this));
            }
            else {
                cc.error("加载纹理失败------", this._loadTexturePath);
                return;
            }
        }
        else {
            if (this.node == null) {
                console.log("加载图片成功，但当前对象已经被销毁 ");
                return;
            }
            this.node.getComponent(cc.Sprite).spriteFrame = sf;
            if(this._callBack)this._callBack(sf);
        }
    }
}