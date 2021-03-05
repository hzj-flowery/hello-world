/**
 * 主要用于特效的创建帮助类
 */
export default class EffectHelper {

    public static loadEffectRes(res: string, type: typeof cc.Asset, callback: Function) {
        cc.resources.load(res, type, function (err, res) {
            if (err) {
                console.error("[EffectHelper] loadEffectRes", err);
            }
            callback(res);
        });
    }

    public static loadEffectResList(resList: string[], resType: typeof cc.Asset[], callback: Function) {
        let loadNum: number = resList.length;
        let loadedNum: number = 0;
        let loadedResList: Array<any> = new Array<any>(resList.length);
        for (let i = 0; i < resList.length; i++) {
            cc.resources.load(resList[i], resType[i], function (i: number, err, res) {
                if (err) {
                    console.error("[EffectHelper] loadEffectResList", err);
                }

                loadedResList[i] = res;

                loadedNum++;
                if (loadedNum >= loadNum) {
                    callback(loadedResList);
                }
            }.bind(this, i));
        }
    }

    public static getColorOffset(color) {
        return new cc.Vec4(color.red / 255, color.green / 255, color.blue / 255, color.alpha / 255);
    }

    public static createDrawNode(mask_info): cc.Node {
        // TODO:mask
        console.warn("[EffectHelper] createDrawNode")
        var mask: cc.Mask = new cc.Node().addComponent(cc.Mask);
        mask.node.setContentSize(mask_info.width);
        if (mask_info.mask_type == 'circle') {
            mask.type = cc.Mask.Type.ELLIPSE;
            mask.segements = 200;
        } else {
            mask.type = cc.Mask.Type.RECT;
        }
        return mask.node;
    }

    public static parseJson(effectJson: any): any {
        if (effectJson == null) {
            return;
        }

        effectJson = this.parseFloat(effectJson, "scale");
        effectJson = this.parseFloat(effectJson, "frames");
        effectJson = this.parseFloat(effectJson, "x");
        effectJson = this.parseFloat(effectJson, "y");
        effectJson = this.parseFloat(effectJson, "dx");
        effectJson = this.parseFloat(effectJson, "dy");
        effectJson = this.parseFloat(effectJson, "rotation");
        effectJson = this.parseFloat(effectJson, "scaleX");
        effectJson = this.parseFloat(effectJson, "scaleY");
        effectJson = this.parseFloat(effectJson, "opacity");
        effectJson = this.parseFloat(effectJson, "red_original");
        effectJson = this.parseFloat(effectJson, "green_original");
        effectJson = this.parseFloat(effectJson, "blue_original");
        effectJson = this.parseFloat(effectJson, "alpha_original");

        for (const key in effectJson) {
            if (typeof effectJson[key] == "object") {
                effectJson[key] = this.parseJson(effectJson[key]);
            }
        }

        return effectJson;
    }

    private static parseFloat(json: any, key: any) {
        if (json[key] != null) {
            json[key] = parseFloat(json[key]);
        }
        return json;
    }
}