import { ConfigNameConst } from "../../const/ConfigNameConst";
import { G_ConfigLoader } from "../../init";
import { Path } from "../../utils/Path";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import UIHelper from "../../utils/UIHelper";
import { StorySpineNode } from "../node/StorySpineNode";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CommonStoryAvatar2 extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panel_1: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageAvatar: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeAvatar: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelAvatar: cc.Node = null;
    _spine: StorySpineNode;


    updateUI(heroId, limitLevel?, limitRedLevel?) {
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, heroId, null, null, limitLevel, limitRedLevel);
        var resData = param.res_cfg;
        if (resData.story_res_spine != 0) {
            this._createHeroSpine(resData.story_res_spine);
            this._imageAvatar.node.active = (false);
        } else {
            this._createHeroImage(resData.story_res);
            if (this._spine) {
                this._spine.node.active = (false);
            }
        }
    }
    _createHeroSpine(spineId) {
        if (!this._spine) {
            this._spine = StorySpineNode.create(1 / this.node.scale, cc.size(1024, 1024))
            this._nodeAvatar.addChild(this._spine.node);
        }
        this._spine.setAsset(Path.getStorySpine(spineId));
        this._spine.setAnimation('idle', true);
        this._spine.node.active = (true);
        this.node.setScale(1);
    }
    _createHeroImage(imageId) {
        var imgPath = Path.getChatRoleRes(imageId);
        //this._imageAvatar.ignoreContentAdaptWithSize(true);
        UIHelper.loadTexture(this._imageAvatar, imgPath);
        this._imageAvatar.node.active = (true);
    }
    updateUIByResId(resId) {
        var HeroRes = G_ConfigLoader.getConfig(ConfigNameConst.HERO_RES);
        var resData = HeroRes.get(resId);
        if (resData.story_res_spine != 0) {
            this._createHeroSpine(resData.story_res_spine);
            this._imageAvatar.node.active = (false);
        } else {
            this._createHeroImage(resData.story_res);
            if (this._spine) {
                this._spine.node.active = (false);
            }
        }
    }
    setAvatarPositionY(posY) {
        this._nodeAvatar.y = (posY);
    }
    setAvatarScale(scale) {
        this._nodeAvatar.setScale(scale);
    }    
}
