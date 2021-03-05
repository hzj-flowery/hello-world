import { config } from "../config";

/**
 * 分辨率适配管理器
 */
export class ResolutionManager {

    private _designSize: cc.Size;
    private _deviceOffset: number;

    constructor() {
        this.setDesignSize();
    }

    public setDesignSize() {
        let ratio = cc.view.getFrameSize().width / cc.view.getFrameSize().height;
        if (ratio > 1.8) {
            config.CC_DESIGN_RESOLUTION.width = 1400;
            config.CC_DESIGN_RESOLUTION.height = 640;
            config.CC_DESIGN_RESOLUTION.autoscale = "FIXED_HEIGHT";
        }
        else {
            config.CC_DESIGN_RESOLUTION.width = 1136;
            config.CC_DESIGN_RESOLUTION.height = 640;
            config.CC_DESIGN_RESOLUTION.autoscale = "FIXED_WIDTH";
        }

        this._designSize = new cc.Size(Math.min(config.CC_DESIGN_RESOLUTION.width, cc.winSize.width),
            Math.min(config.CC_DESIGN_RESOLUTION.height, cc.winSize.height));

        this._deviceOffset = null;

        let resolutionPolicy: number = config.CC_DESIGN_RESOLUTION.autoscale == "FIXED_HEIGHT" ?
            cc.ResolutionPolicy.FIXED_HEIGHT : cc.ResolutionPolicy.FIXED_WIDTH;
        cc.view.setDesignResolutionSize(config.CC_DESIGN_RESOLUTION.width, config.CC_DESIGN_RESOLUTION.height, resolutionPolicy);
    }

    public doLayout(node: cc.Node) {
        if (node) {
            var bangSize = this.getBangDesignCCSize();
            node.setContentSize(bangSize);
            node.setAnchorPoint(0.5, 0.5);
            node.setPosition(0, 0);
            let widget: cc.Widget = node.getComponent(cc.Widget);
            if (widget != null) {
                widget.isAlignHorizontalCenter = true;
                widget.isAlignVerticalCenter = true;
            }
        }
    }

    /**
     * 获取减去刘海的设计分辨率尺寸
     */
    public getBangDesignCCSize(): cc.Size {
        var bangWidth = this.getBangDesignWidth();
        return cc.size(bangWidth, this._designSize.height);
    }

    /**
     * 获取减去刘海的设计分辨率尺寸
     */
    public getBangDesignSize(): number[] {
        var bangWidth = this.getBangDesignWidth();
        return [
            bangWidth,
            this._designSize.height
        ];
    }

    /**
     * 获取减去刘海的设计分辨率宽度
     */
    public getBangDesignWidth() {
        var bangWidth = this._designSize.width - this.getBangOffset() * 2;
        return bangWidth;
    }

    /**
     * 获取设计分辨率中心点位置
     */
    public getDesignCCPoint() {
        return new cc.Vec2(this._designSize.width * 0.5, this._designSize.height * 0.5);
    }

    /**
     * 获取设计分辨率
     */
    public getDesignCCSize() {
        return this._designSize;
    }

    /**
     * 获取设计分辨率
     */
    public getDesignSize() {
        return [
            this._designSize.width,
            this._designSize.height
        ];
    }

    /**
     * 设计分辨率宽度
     */
    public getDesignWidth() {
        return this._designSize.width;
    }

    /**
     * 设计分辨率高度
     */
    public getDesignHeight() {
        return this._designSize.height;
    }

    public getDeviceOffset() {
        if (cc.view.getFrameSize().width / cc.view.getFrameSize().height >= 2.0) {
            return 50;
        }
        else {
            return 0;
        }
        // var name = NativeAgent.callStaticFunction('getDeviceModel', null, 'string');TODO:
        // function matchIPhoneXS(name) {
        //     var matchTable = {};
        //     matchTable['iPhone11,2'] = 50;
        //     matchTable['iPhone11,4'] = 50;
        //     matchTable['iPhone11,6'] = 50;
        //     matchTable['iPhone11,8'] = 50;
        //     if (matchTable[name] != null) {
        //         return matchTable[name];
        //     }
        //     return null;
        // }
        // if (name != null && name != '') {
        //     var iPhonexs_offset = matchIPhoneXS(name);
        //     if (iPhonexs_offset) {
        //         return iPhonexs_offset;
        //     }
        //     var device = require('app.config.device');
        //     var cfg = device.get(name);
        //     if (cfg) {
        //         return cfg.offset;
        //     }
        // }TODO:
    }

    /**
     * 获取设备刘海偏移量
     */
    public getBangOffset() {
        if (this._deviceOffset == null) {
            this._deviceOffset = this.getDeviceOffset();
        }
        return this._deviceOffset;
    }
}