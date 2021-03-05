import UIHelper from "./UIHelper";

export class Util {
    static remberActivityViewOpen:boolean = false;
    static fillColor(node: cc.Node, color: cc.Color = cc.Color.GREEN, opacity = 128) {
        let size = node.getContentSize();
        let g = node.addComponent(cc.Graphics);
        let originX = -node.anchorX * size.width;
        let originY = -node.anchorY * size.height;
        let maxX = size.width + originX;
        let maxY = size.height + originY;
        g.fillColor = color;
        g.moveTo(originX, originY);
        g.lineTo(maxX, originY);
        g.lineTo(maxX, maxY);
        g.lineTo(originX, maxY);
        g.fill();
        node.opacity = opacity;
    }
    static getNode(prefabPath: string, type?: any): any {
        var prefab = cc.resources.get(prefabPath);
        var node: cc.Node = cc.instantiate(prefab);
        if (!type) return node;
        var component = node.getComponent(type);
        return component ? component : node.addComponent(type);
    }

    static newSprite(texturepath: string) {
        var node: cc.Node = new cc.Node();
        var sprite: cc.Sprite = node.addComponent(cc.Sprite);
        var sf: cc.SpriteFrame = cc.resources.get(texturepath, cc.SpriteFrame);
        sprite.spriteFrame = sf;
        return sprite;
    }

    static format(str, ...args) {
        var index = 0;
        return str.replace(/(%[0-9]*[a-zA-Z0-9])/g, function (str, match, number) {
            var rep = args[index];
            var need2Num = str.indexOf('2') > 0;
            var result = rep != 'undefined' ? rep : "";
            if(need2Num && typeof(rep) == 'number' && rep < 10){
                result = '0'+result
            }
            index++;
            return result;
        });
    }

    static updateImageView(sprite: cc.Sprite, params) {
        if (!sprite) return;

        if (typeof (params) == 'string') {
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            UIHelper.loadTexture(sprite, params)
            return sprite;
        }
        var boolIgnore = params.ignoreContentAdaptWithSize;
        if (params.texture != null) {
            // var capInsets = sprite.node.getCapInsets();
            if (boolIgnore) {
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            }
            else {
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            }
            UIHelper.loadTexture(sprite, params.texture);
            // img.setCapInsets(capInsets);
        }
        if (params.visible != null) {
            sprite.node.active = params.visible;
        }
        if (params.position != null) {
            sprite.node.setPosition(params.position);
        }
        if (params.callback != null) {
            // img.addClickEventListener(function ('...') {
            //     params.callback('...');
            // });
        }
        if (params.scale != null) {
            sprite.node.setScale(params.scale);
        }
        if (params.color != null) {
            sprite.node.color = params.color;
        }
        if (params.opacity != null) {
            sprite.node.opacity = params.opacity;
        }
        return sprite;
    }

    static updateLabelByName(node: cc.Node, name: string, params) {
        var label: cc.Label = Util.getSubNodeByName(node, name).getComponent(cc.Label);
        Util.updateLabel(label, params);
    }

    static updateLabel(label: cc.Label, params) {
        if (!label) return;
        // assert(params, string.format('Invalid params: %s with name: %s', tostring(params), name));
        if (typeof (params) == 'string' || typeof (params) == 'number') {
            label.string = params.toString();
            return label;
        }
        if (params.outlineColor != null) {
            // label.enableOutline(params.outlineColor, params.outlineSize || 2);
        } else {
            // if (label.disableEffect) {
            //     label.disableEffect(cc.LabelEffect.OUTLINE);
            // }
        }
        if (params.color != null) {
            label.node.color = params.color;
        }
        if (params.textColor != null) {
            label.node.color = params.textColor;
            // label.setTextColor(params.textColor);
        }
        if (params.text != null) {
            label.string = params.text;
            // label.setString(params.text);
        }
        if (params.fontSize && typeof (params.fontSize) == 'number') {
            label.fontSize = params.fontSize;
        }
        if (params.visible != null) {
            label.node.active = params.visible;
        }
        if (params.ignoreContentSize != null) {
            // label.ignoreContentAdaptWithSize(params.ignoreContentSize);
        }
        if (params.enableShadow != null) {
            // label.enableShadow(params.enableShadow);
        }
        return label;
    }

    static getSubNodeByName(node: cc.Node, name: string) {
        if (!node) return null;
        var child: cc.Node = node.getChildByName(name);
        if (child) return child;
        if (!node.children) return null;
        for (var i: number = 0, n: number = node.children.length; i < n; i++) {
            var sub = node.children[i];
            child = Util.getSubNodeByName(sub, name);
            if (child) return child;
        }
        return null;
    }

    static getSubNodeComponent<T extends cc.Component>(node: cc.Node, name: string, type: { prototype: T }): T {
        var subNode: cc.Node = Util.getSubNodeByName(node, name);
        if (!subNode) return null;
        return subNode.getComponent(type);
    }

    static updatelabelRenderData(label: cc.Label): void {
        if (label['_updateRenderData']) label['_updateRenderData'](true);
    }

    static formatTimeStr(time: number): string {
        if (time < 0) {
            return time.toString();
        }
        else if (time >= 0 && time < 10) {
            return "0" + time.toString();
        }
        else {
            return time.toString();
        }
    }

    //最小min，最大max-1
    static getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    
    static urlencode(str:string){
        var ret="";
        for(var i=0;i<str.length;i++){
            var chr = str.charAt(i);
            if(chr == "+"){
                ret+=" ";
            }else if(chr=="%"){
                var asc = str.substring(i+1,i+3);
                if(parseInt("0x"+asc)>0x7f){
                    ret+=(parseInt("0x"+asc+str.substring(i+4,i+6))).toString();
                    i+=5;
                }else{
                    ret+=(parseInt("0x"+asc)).toString();
                    i+=2;
                }
            }else{
                ret+= chr;
            }
        }
        return ret;
    }

    static compareVersion(version1: string, version2: string): 1 | 0 | -1 {
        let v1 = version1.split('.');
        let v2 = version2.split('.');

        const len = Math.max(v1.length, v2.length);

        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }

        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);

            if (num1 > num2) {
                return 1;
            } else if (num1 < num2) {
                return -1;
            }
        }

        return 0;
    }
}
