
export default class BigImagesNode extends cc.Component {

    static parseImgPath(imgPath: string): string[] {
        var frontStr: string = imgPath;
        var index: number = frontStr.lastIndexOf('/');
        var imagePath: string = index >= 0 ? frontStr.substr(0, index + 1) : "";
        var imageName: string = index >= 0 ? frontStr.substr(index + 1, frontStr.length - index - 1) : frontStr;
        return [imagePath, imageName];
    }

    static getImages(path: string) {
        var arr: string[] = BigImagesNode.parseImgPath(path);
        var imagePath = arr[0];
        var imageName: string = arr[1];
        var noExtPath: string = imagePath + imageName;
        var jsonAsste: cc.JsonAsset = cc.resources.get(noExtPath, cc.JsonAsset);
        var jsonCfg = jsonAsste.json;
        var imagePaths: string[] = [];
        for (var k in jsonCfg.children) {
            var v = jsonCfg.children[k];
            var childPath = imagePath + v.name;
            childPath = childPath.replace(".jpg", "");
            childPath = childPath.replace(".png", "");
            imagePaths.push(childPath);
        }
        return imagePaths;
    }

    private imagePath: string;
    private jsonCfg: any;

    setUp(path: string): void {
        var arr: string[] = BigImagesNode.parseImgPath(path);
        this.imagePath = arr[0];
        var imageName: string = arr[1];
        var noExtPath: string = this.imagePath + imageName;
        var spriteFrame: cc.SpriteFrame = cc.resources.get(noExtPath, cc.SpriteFrame);
        if (spriteFrame) {
            var childNode: cc.Node = new cc.Node();
            var sp = childNode.addComponent(cc.Sprite);
            let rect = spriteFrame.getRect();
            sp.spriteFrame = spriteFrame;
            childNode.setContentSize(rect.width, rect.height);
            childNode.setAnchorPoint(cc.v2(0, 0));
            this.node.addChild(childNode);
            return;
        }
        var jsonAsste: cc.JsonAsset = cc.resources.get(noExtPath, cc.JsonAsset);
        if (!jsonAsste || !jsonAsste.json) return;

        this.jsonCfg = jsonAsste.json;

        this.node.setContentSize(this.jsonCfg.width, this.jsonCfg.height);
        var arr: string[] = [];
        for (var k in this.jsonCfg.children) {
            var v = this.jsonCfg.children[k];
            var childPath = this.imagePath + v.name;
            childPath = childPath.replace(".jpg", "");
            childPath = childPath.replace(".png", "");
            arr.push(childPath);
        }
        cc.resources.load(arr, cc.SpriteFrame, this.onLoadRes.bind(this));
    }

    private onLoadRes(err, resource): void {
        // console.log(err, resource);
        for (var k in this.jsonCfg.children) {
            var v = this.jsonCfg.children[k];
            var childPath = this.imagePath + v.name;
            childPath = childPath.replace(".jpg", "");
            childPath = childPath.replace(".png", "");
            var texture2d: cc.SpriteFrame = cc.resources.get(childPath, cc.SpriteFrame);
            if (!texture2d) {
                console.warn('unload res: ', childPath);
                continue;
            }
            var childNode: cc.Node = new cc.Node();
            var sp = childNode.addComponent(cc.Sprite);
            sp.spriteFrame = texture2d;
            childNode.setAnchorPoint(0, 0);
            childNode.setPosition(v.x, v.y);
            this.node.addChild(childNode);
        }
    }
    onDestroy() { }
}