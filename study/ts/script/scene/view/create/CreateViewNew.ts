import { AudioConst } from "../../../const/AudioConst";
import { G_AudioManager, G_EffectGfxMgr, G_GameAgent, G_NativeAgent, G_Prompt, G_RoleListManager, G_SceneManager, G_UserData } from "../../../init";
import { EffectGfxType } from "../../../manager/EffectGfxManager";
import { SpineNode } from "../../../ui/node/SpineNode";
import { Path } from "../../../utils/Path";
import { TextHelper } from "../../../utils/TextHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import NodeInput from "./NodeInput";
import ALDStatistics from "../../../utils/ALDStatistics";
import { FontCheck } from "../../../utils/logic/FontCheck";
import { handler } from "../../../utils/handler";
import { WxUserInfo } from "../../../utils/WxUserInfo";
import { config } from "../../../config";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CreateViewNew extends ViewBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelDesign: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelMale: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelFemale: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _panelChooseEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeUIEffect: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeHeadIcon: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageMale: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageFemale: cc.Sprite = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchMale: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _touchFemale: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBack: cc.Sprite = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageTitle: cc.Sprite = null;

    @property({
        type: cc.Button,
        visible: true
    })
    _startGameBtn: cc.Button = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _imgArrow: cc.Sprite = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _nodeInputPrefab: cc.Prefab = null;

    protected preloadEffectList = [
        { type: EffectGfxType.MovingGfx, name: "moving_nanzhuchuangjue_2" },
        { type: EffectGfxType.MovingGfx, name: "moving_nvzhuchuangjue_2" },
        { type: EffectGfxType.MovingGfx, name: "moving_chuangjueui_nanzhu" },
        { type: EffectGfxType.MovingGfx, name: "moving_chuangjueui_nvzhu" },
    ];

    private _selectIdx = 0;
    private _defaultName = 0;
    private _nodeInput: NodeInput;
    private _createSpineNode: SpineNode;

    private _wxName = '';
    private _wxHead = '';
    // private _manIdleEffect: cc.Node;
    // private _femaleIdleEffect: cc.Node;

    public preloadRes(callBack: Function, params) {
        // this.addPreloadSceneRes(9999, true);
        super.preloadRes(callBack, params);
    }

    onCreate() {
        this.setSceneSize();
        // this.updateSceneId(9999, true);
        // this._manIdleEffect = Util.getSubNodeByName(this._viewEffectNode, "spine_92999_idle");
        // this._femaleIdleEffect = Util.getSubNodeByName(this._viewEffectNode, "spine_92998_idle");
        console.log('create new');
           var point = this._startGameBtn.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
       if (G_NativeAgent.invitorUserId != 0 && G_RoleListManager.isNewPlayer()) {
            if (!WxUserInfo.instance.hasGetInfo) {
                this.setUserInfo();
            } else {
                this.showWxUserInfoBtn(false);
            }
       }
    }


    private setUserInfo() {
        WxUserInfo.instance.checkUserInfo(handler(this, this.onUserInfoSuccess), handler(this, this.onUserInfoFail))
    }

    private onUserInfoSuccess() {
        console.log("onUserInfoSuccess:", WxUserInfo.instance.getUserNickName(), WxUserInfo.instance.getUserAvatarUrl());
    }

    private onUserInfoFail() {
        this.createUserInfoBtn();
        WxUserInfo.instance.setUserInfoSuccess(handler(this, ()=> {
            this.onUserInfoSuccess();
            this.showWxUserInfoBtn(false);
        }));
    }

    public createUserInfoBtn() {
        var point = this._startGameBtn.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        WxUserInfo.instance.createUserInfoButton(point.x, point.y, this._startGameBtn.node.width, this._startGameBtn.node.height);
    }

    private showWxUserInfoBtn(isShow: boolean) {
        if (isShow) {
            WxUserInfo.instance.showUserInfoButton();
        }
        else {
            WxUserInfo.instance.hideUserInfoButton();
        }
    }

    onEnter() {
        ALDStatistics.instance.aldSendEvent('进入创角界面');
        this._panelChooseEffect.active = (false);
        this._imageBack.node.active = (false);
        this._imageTitle.node.active = (true);
        this._startGameBtn.node.removeFromParent();
        this.onMaleClick();
        var down = cc.moveBy(0.35, cc.v2(0, -10));
        var up = cc.moveBy(0.35, cc.v2(0, 10));
        this._imgArrow.node.runAction(cc.repeatForever(cc.sequence(down, up)));
    }

    onExit() {
        this.showWxUserInfoBtn(false);
    }

    public onFemaleClick() {
        this._imgArrow.node.active = false;
        this._imgArrow.node.stopAllActions();
        if (this._selectIdx == 2) {
            return;
        }
        this._selectIdx = 2;
        this._refreshChooseBtn();
        this._playChooseAnim();
        // this._femaleIdleEffect.active = false;
    }

    public onMaleClick() {
        if (this._selectIdx == 1) {
            return;
        }
        this._selectIdx = 1;
        this._refreshChooseBtn();
        this._playChooseAnim();
        // this._manIdleEffect.active = false;
    }

    private _refreshChooseBtn() {
        if (this._selectIdx == 1) {
            UIHelper.loadTexture(this._imageMale, Path.getCreateImage('btn_create_male_sel'));
            UIHelper.loadTexture(this._imageFemale, Path.getCreateImage('btn_create_female_nml'));
        } else if (this._selectIdx == 2) {
            UIHelper.loadTexture(this._imageMale, Path.getCreateImage('btn_create_male_nml'));
            UIHelper.loadTexture(this._imageFemale, Path.getCreateImage('btn_create_female_sel'));
        } else {
            UIHelper.loadTexture(this._imageMale, Path.getCreateImage('btn_create_male_nml'));
            UIHelper.loadTexture(this._imageFemale, Path.getCreateImage('btn_create_female_nml'));
        }
    }

    private _playChooseAnim() {
        this._imageBack.node.active = (false);
        // this._imageTitle.node.active = (false);
        this._panelChooseEffect.active = (true);
        if (this._nodeInput) {
            this._defaultName = this._nodeInput.getDefaultName();
            this._nodeInput = null;
        }
        this._nodeEffect.removeAllChildren();
        this._nodeUIEffect.removeAllChildren();
        var spineId = '999_big';
        var anim = 'moving_nanzhuchuangjue_2';
        if (this._selectIdx == 2) {
            spineId = '998_big';
            anim = 'moving_nvzhuchuangjue_2';
        }
        function eventFunction(event) {
            if (event == 'ui') {
                this._createUI();
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffect, anim, null, eventFunction.bind(this));
    }

    private _createUI() {
        var anim = 'moving_chuangjueui_nanzhu';
        if (this._selectIdx == 2) {
            anim = 'moving_chuangjueui_nvzhu';
        }
        let effectFunction = (effect): cc.Node => {
            if (effect == 'juese') {
                var id = 999;
                if (this._selectIdx == 2) {
                    id = 998;
                }
                var spineNode = SpineNode.create(0.5)
                spineNode.setAsset(Path.getSpine(id));
                this._createSpineNode = spineNode;
                spineNode.setAnimation('idle', true);
                return spineNode.node;
            } else if (effect == 'shurukuang') {
                this._nodeInput = cc.instantiate(this._nodeInputPrefab).getComponent(NodeInput);
                this._nodeInput.init(this._selectIdx, this._defaultName);
                return this._nodeInput.node;
            } else if (effect == 'anniu') {
                this._startGameBtn.node.removeFromParent();
                // btn.loadTextureNormal(Path.getCreateImage('btn_create_startgame'));
                return this._startGameBtn.node;
            }
        }

        let eventFunction = (event) => {
            if (event == 'finish') {
                if (this._createSpineNode != null) {
                    this._createSpineNode.setAnimation('idle', true);
                }
            }
        }
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeUIEffect, anim, effectFunction, eventFunction);
    }

    private _returnMainView() {
        if (this._nodeInput) {
            this._defaultName = this._nodeInput.getDefaultName();
        }
        this._panelChooseEffect.active = (false);
        this._selectIdx = 0;
        this._refreshChooseBtn();
        this._nodeEffect.removeAllChildren();
        this._nodeUIEffect.removeAllChildren();
        this._nodeInput = null;
        this._imageBack.node.active = (false);
        this._imageTitle.node.active = (true);
    }

    public onBackClick() {
        if (this._selectIdx != 0) {
            this._returnMainView();
            // this._manIdleEffect.active = true;
            // this._femaleIdleEffect.active = true;
            this.showWxUserInfoBtn(false);
        }
    }

    public onStartClick() {
        var point = this._startGameBtn.node.convertToWorldSpaceAR(new cc.Vec2(0, 0));
        ALDStatistics.instance.aldSendEvent(this._selectIdx == 1 ? '选择男性角色' : '选择女性角色');
        ALDStatistics.instance.aldSendEvent('创角界面:点击进入游戏');
        var nameTxt = this._nodeInput.getName();
        G_AudioManager.playSoundWithId(AudioConst.SOUND_BUTTON_START_GAME);
        nameTxt = nameTxt.trim();
        FontCheck.checkLegal(nameTxt, handler(this, this.enter, nameTxt))
    }

    enter(arg, isLegal) {
        var nameTxt = arg[0];
        if (!isLegal) {
            G_Prompt.showTip('取名失败,存在非法字符');
            return;
        }
        if (TextHelper.isNameLegal(nameTxt, 2, 7)) {
            G_GameAgent.checkContent(nameTxt, () => {
                G_GameAgent.createRole(nameTxt, this._selectIdx);
            });
        }
    }
}