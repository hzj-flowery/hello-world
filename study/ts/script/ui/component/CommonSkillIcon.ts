import { Path } from "../../utils/Path";
import CommonUI from "./CommonUI";
import { assert } from "../../utils/GlobleFunc";
import { G_ConfigLoader } from "../../init";
import { ConfigNameConst } from "../../const/ConfigNameConst";
import { UIPopupHelper } from "../../utils/UIPopupHelper";


var SKILL_TEXT_RES = {
    1: 'img_skill_signet01',
    2: 'img_skill_signet02',
    3: 'img_skill_signet03',
    4: 'img_skill_signet01'
};

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonSkillIcon extends cc.Component {

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillBg: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillIcon: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageSkillText: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelTouch: cc.Node = null;

    private _skillId:number;
    private _canClick:boolean;
    private _baseId:number;
    private _starLevel:number;


    onLoad() {
        this._panelTouch.on(cc.Node.EventType.TOUCH_END, this._onTouchCallBack, this);
    }
    updateUI(skillId, canClick?, baseId?, starLevel?) {
        this._skillId = skillId;
        this._canClick = canClick;
        this._baseId = baseId;
        this._starLevel = starLevel;
        //临界值修改
        if (!skillId||skillId == 0) {
            this._imageSkillBg.addComponent(CommonUI).loadTexture(Path.getUICommon('img_skill_board01b'));
            this._imageSkillIcon.node.active = (false);
            this._imageSkillText.node.active = (false);
        } else {
            this._imageSkillBg.addComponent(CommonUI).loadTexture(Path.getUICommon('img_skill_board01'));
           
            var config =  G_ConfigLoader.getConfig(ConfigNameConst.HERO_SKILL_ACTIVE).get(skillId);
          //assert((config, cc.js.formatStr('hero_skill_active config can not find id = %d', skillId));
            var skillIconRes = config.skill_icon;
            var textRes = SKILL_TEXT_RES[config.skill_type];
          //assert((textRes, cc.js.formatStr('hero_skill_active config skill_type is wrong, skill_type = %d', config.skill_type));
            this._imageSkillIcon.addComponent(CommonUI).loadTexture(Path.getCommonIcon('skill', skillIconRes));
            this._imageSkillText.addComponent(CommonUI).loadTexture(Path.getTextSignet(textRes));
            this._imageSkillIcon.node.active = (true);
            this._imageSkillText.node.active = (true);
        }
    }
    _onTouchCallBack() {
        if (this._canClick && this._skillId > 0) {
            UIPopupHelper.popupSkillDes(this._imageSkillBg.node, this._skillId, this._baseId, this._starLevel)
        }
    }


}