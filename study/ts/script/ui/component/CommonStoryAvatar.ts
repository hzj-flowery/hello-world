import { ConfigNameConst } from "../../const/ConfigNameConst";
import { G_ConfigLoader } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { SpineNode } from "../node/SpineNode";
import { StorySpineNode } from "../node/StorySpineNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonStoryAvatar extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _imageAvatar: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeAvatar: cc.Node = null;

    private _spine: SpineNode | StorySpineNode;

    public updateUI(heroId, limitLevel?, limitRedLevel?) {
        this._imageAvatar.active = false;
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel, limitRedLevel);
        var resData = param.res_cfg;
        if (resData.story_res_spine != 0) {
            this._createHeroSpine(resData.story_res_spine);
            this._imageAvatar.active = (false);
        } else {
            this._createHeroImage(resData.story_res);
            if (this._spine) {
                this._spine.node.active = (false);
            }
        }
    }

    public onEnable() {
        if (this._spine) {
            this._spine.setAnimation('idle', true);
        }
    }

    private _createHeroSpine(spineId) {
        this._createSpine(Path.getStorySpine(spineId), true);
    }
    private _createHistorySpine(spineId) {
        this._createSpine(Path.getSpine(spineId), false);
    }

    public playIdleAni(): void {
        this._spine.setAnimation('idle', true);
    }

    private _createSpine(spinePath: string, isStorySpine: boolean) {
        if (this._spine == null) {
            if (isStorySpine) {
                this._spine = StorySpineNode.create(1, cc.size(1024, 1024))
            }
            else {
                this._spine = SpineNode.create(1, cc.size(1024, 1024));
            }
            this._nodeAvatar.addChild(this._spine.node);
        }
        this._spine.setAsset(spinePath);
        this._spine.setAnimation('idle', true);
        this._spine.node.active = (true);
    }

    private _createHeroImage(imageId) {
        var imgPath = Path.getChatRoleRes(imageId);
        let sprite: cc.Sprite = this._imageAvatar.getComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        UIHelper.loadTexture(sprite, imgPath);
        this._imageAvatar.active = (true);
    }

    public updateUIByResId(resId) {
        var resData = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES).get(resId);
        if (resData.story_res_spine != 0) {
            this._createHistorySpine(resData.story_res_spine);
            this._imageAvatar.active = (false);
        } else {
            this._createHeroImage(resData.story_res);
            if (this._spine) {
                this._spine.node.active = (false);
            }
        }
    }
}