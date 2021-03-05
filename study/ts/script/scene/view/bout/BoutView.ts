import { BoutConst } from "../../../const/BoutConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import { G_Prompt, G_SceneManager, G_SignalManager, G_SpineManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonPowerPrompt from "../../../ui/component/CommonPowerPrompt";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import PromptManager from "../../../ui/prompt/PromptManager";
import { rawequal } from "../../../utils/GlobleFunc";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import { table } from "../../../utils/table";
import UIHelper from "../../../utils/UIHelper";
import { Util } from "../../../utils/Util";
import ViewBase from "../../ViewBase";
import BoutConsumeModule from "./BoutConsumeModule";
import { BoutHelper } from "./BoutHelper";

const {ccclass, property} = cc._decorator;
@ccclass

export default class BoutView extends ViewBase {
    name: 'BoutView';

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topbarBase: CommonTopbarBase = null;
    
    @property({
        type: cc.Node,
        visible: true
    })
    _consumeNode: cc.Node = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageBg: cc.Sprite = null;

    

    @property({
        type: cc.Prefab,
        visible: true
    })
    _BoutConsumeModule: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _bitFontLabel: cc.Prefab = null;
    

    

    static waitEnterMsg(callBack) {
        G_UserData.getBout().c2sGetBoutInfo();
        return G_SignalManager.addOnce(SignalConst.EVENT_BOUT_ENTRY, function (id, message) {
            callBack();
        });
    }

    private _lastTotalPower:number;
    private _diffPower:number;
    private _selectedBout:any;
    private _pointBottomNodes:any;
    private _signalUnlockBout:any;
    private _pointNodes:Array<cc.Button>;
    private _signalGetRechargeNotice:any;
    private _boutConsumeModule:BoutConsumeModule;
    ctor() {
        
       
    }
    onCreate() {
        this._lastTotalPower = 0;
        this._diffPower = 0;
        this._selectedBout = {};
        this.setSceneSize();
        this._selectedBout.pos = 1;
        this._selectedBout.id = G_UserData.getBout().getCurBoutId();
        this._initCommonView();
        this._initBoutPoints();
        this._initModuleView();
        this._updateBoutTitle();
        this._updateCurBoutId(true);
        this._recordTotalPower();
    }
    onEnter() {
        this._signalUnlockBout = G_SignalManager.add(SignalConst.EVENT_BOUT_UNLOCKSUCCESS, handler(this, this._onUnlockSuccess));
        this._signalGetRechargeNotice = G_SignalManager.add(SignalConst.EVENT_RECHARGE_NOTICE, handler(this, this._onEventGetRechargeNotice));
    }
    onExit() {
        this._signalUnlockBout.remove();
        this._signalUnlockBout = null;
        this._signalGetRechargeNotice.remove();
        this._signalGetRechargeNotice = null;
    }
    _updateBoutTitle() {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        var boutNameImg = this._imageBg.node.getChildByName('BoutName');
        if (boutNameImg == null) {
            boutNameImg = UIHelper.createImage({ texture: Path.getBoutPath('txt_bout_0' + curBoutId) });
            boutNameImg.setPosition(252-1386/2, 402-640/2);
            boutNameImg.name = ('BoutName');
            // boutNameImg.ignoreContentAdaptWithSize(true);
            this._imageBg.node.addChild(boutNameImg);
        }
        UIHelper.loadTexture(boutNameImg.getComponent(cc.Sprite),Path.getBoutPath('txt_bout_0' + curBoutId));
    }
    _initCommonView() {
        this._topbarBase.setImageTitle('txt_sys_com_zhenfa');
        this._topbarBase.updateUI(TopBarStyleConst.STYLE_SEASONSPORT);
        this._topbarBase.updateHelpUI(FunctionConst.FUNC_BOUT);
        this._topbarBase.setCallBackOnBack(function () {
            G_SceneManager.popScene();
        });
    }
    _initBoutPoints() {
        this._pointNodes = [];
        this._pointBottomNodes = {};
        var curPoints = G_UserData.getBout().getCurBoutPoints();
        for (let index in curPoints) {
            var value = curPoints[index];
            var pointNode1 = this._imageBg.node.getChildByName(BoutConst.BOUT_POINT_NAMEKEY + value.point);
            let pointNode:cc.Button;
            if(pointNode1)
            {
                pointNode = pointNode1.getComponent(cc.Button);
            }
            else {
                var boutBottom = BoutHelper.createBottom(this._imageBg, value.point);
                let cb = handler(this,this._selectedPoint);
                pointNode = BoutHelper.createBoutPoint(this._imageBg, value.point,cb,cc.instantiate(this._bitFontLabel).getComponent(cc.Label));
                var isEnable = rawequal(value.point_type, 2) && true || G_UserData.getBout().checkUnlocked(value.id, value.point);
                var pos = value.position.split('|');
                let x = parseFloat(pos[0]) - 1386/2;
                let y = parseFloat(pos[1]) - 640/2;
                pointNode.node.getChildByName('pointName').getComponent(cc.Label).string = (value.point_name);
                BoutHelper.checkTexture(pointNode, isEnable);
                pointNode.node.setPosition(cc.v2(x,y+23));
                boutBottom.setPosition(cc.v2(x,y));
                var opCity = G_UserData.getBout().checkUnlocked(value.id, value.point) && 80 || 255;
                boutBottom.opacity = (opCity);
                this._pointBottomNodes[value.point] = boutBottom;
            }
            this._pointNodes[value.point] = pointNode;
        }
    }
    _updateNameColor(data, node:cc.Node, isSelect:boolean):void {
        var isLocked = G_UserData.getBout().checkUnlocked(data.id, data.pos);
        if (!isLocked) {
            BoutHelper.checkNameColor((node.getChildByName('pointName') as cc.Node).getComponent(cc.Label), 3);
        } else {
            var colorIdx = isSelect && 2 || 1;
            BoutHelper.checkNameColor((node.getChildByName('pointName') as cc.Node).getComponent(cc.Label), colorIdx);
        }
    }
    _updateSelected(isAuto?) {
        if (isAuto) {
            var isRed = false, unlockIdx = this._selectedBout.pos;
            for (var index = 1; index < this._pointNodes.length; index++) {
                if (G_UserData.getBout().checkUnlocked(this._selectedBout.id, index)) {
                    unlockIdx = this._selectedBout.pos == unlockIdx && index || unlockIdx;
                    if (this._pointNodes[index].node.getChildByName('RedPoint').active) {
                        this._selectedBout.pos = index;
                        isRed = true;
                        break;
                    }
                }
            }
            this._selectedBout.pos = isRed && this._selectedBout.pos || unlockIdx;
        }
        for (let key = 1;key<this._pointNodes.length;key++) {
            var value = this._pointNodes[key];
            var isSelect = rawequal(this._selectedBout.pos, value["tag"]);
            (value.node.getChildByName('selected') as cc.Node).active = (isSelect);
            this._updateNameColor({
                id: this._selectedBout.id,
                pos: value["tag"]
            },value.node, isSelect);
        }
        this._updateConsumeView();
    }
    _selectedPoint(sender:cc.Event.EventTouch) {
        this._consumeNode.active = (true);
        this._selectedBout.pos = sender.target.getComponent(cc.Button)["tag"];
        this._updateSelected();
    }
    _closeMask() {
        if (this._selectedBout.pos <= 0 || !this._pointNodes[this._selectedBout.pos]) {
            return;
        }
        this._consumeNode.active = (false);
        this._pointNodes[this._selectedBout.pos].node.getChildByName('selected').active = (false);
        var colorIdx = G_UserData.getBout().checkUnlocked(this._selectedBout.id, this._selectedBout.pos) && 1 || 3;
        BoutHelper.checkNameColor(this._pointNodes[this._selectedBout.pos].node.getChildByName('pointName').getComponent(cc.Label), colorIdx);
    }
    _initModuleView() {
        this._imageBg.node.on(cc.Node.EventType.TOUCH_START,()=> {
            this._closeMask();
        },this);
        this._initAddonBtn();
        this._initConsumeView();
    }
    _initConsumeView() {
        this._boutConsumeModule = cc.instantiate(this._BoutConsumeModule).getComponent(BoutConsumeModule);
        this._consumeNode.addChild(this._boutConsumeModule.node);
    }
    _initAddonBtn() {
        var btnAddOn = BoutHelper.createAddOn(()=> {
            var boutList = G_UserData.getBout().getBoutList() || {};
            if (boutList[1] && table.nums(boutList[1]) > 0) {
                this._closeMask();
                G_SceneManager.showDialog('prefab/bout/PopupAttrOverView');
            } else {
                G_Prompt.showTip(Lang.get('bout_not_lessone'));
            }
        });
        this._imageBg.node.addChild(btnAddOn.node);
    }
    _updateConsumeView() {
        this._boutConsumeModule.updateUI(this._selectedBout.id, this._selectedBout.pos);
    }
    _updateCurBoutId(isAuto, needOpen?) {
        var curBoutId = G_UserData.getBout().getCurBoutId();
        if (this._selectedBout.id == curBoutId) {
            if (needOpen) {
                var curBoutList = G_UserData.getBout().getBoutList();
                var boutInfo = G_UserData.getBout().getBoutInfo();
                var max = table.maxn(boutInfo);
                if (max == curBoutId && rawequal(table.nums(curBoutList[curBoutId]), table.nums(boutInfo[curBoutId]))) {
                    BoutHelper.playRevertoSpecialEffect(this._imageBg.node, this._pointNodes,()=> {
                        this._updateSelected(isAuto);
                        this._updateRedPoint();
                    });
                } else {
                    this._updateSelected(isAuto);
                    this._updateRedPoint();
                }
            } else {
                this._updateSelected(isAuto);
                this._updateRedPoint();
            }
            return;
        }
        BoutHelper.playRevertoSpecialEffect(this._imageBg.node, this._pointNodes,()=> {
            this._selectedBout.pos = 1;
            this._selectedBout.id = curBoutId;
            this._updateSelected();
            this._updateBoutPos();
            this._updateBoutTitle();
            this._updatePointNodes(true);
        });
    }
    _updatePointNodes(isReset) {
        for (let k = 1;k<this._pointNodes.length;k++) {
            var value = this._pointNodes[k];
            if (BoutHelper.isSpecialBoutPoint(this._selectedBout.id, value["tag"])) {
                BoutHelper.checkTexture(value, true);
            } else {
                var isEnable = isReset && true || G_UserData.getBout().checkUnlocked(this._selectedBout.id, value["tag"]);
                BoutHelper.checkTexture(value, isEnable);
            }
        }
    }
    _updateBoutPos() {
        var max = table.nums(this._pointBottomNodes);
        for (var i = 1; i <= max; i++) {
            var info = BoutHelper.getBoutInfoItem(this._selectedBout.id, i);
            var pos = info.position.split('|');
            let x = parseFloat(pos[0]) - 1386/2;
            let y = parseFloat(pos[1]) - 640/2;

            this._pointNodes[i].node.getChildByName('pointName').getComponent(cc.Label)["tag"] = (1);
            this._pointNodes[i].node.getChildByName('pointName').getComponent(cc.Label).string = (info.point_name);
            this._pointNodes[i].node.setPosition(cc.v2(x,y + 23));
            this._pointBottomNodes[i].setPosition(cc.v2(x,y));
            (this._pointBottomNodes[i] as cc.Node).opacity = (80);
            this._pointNodes[i].node.getChildByName('pointName').removeAllChildren();
            BoutHelper.checkRedPoint(this._pointNodes[i].node.getChildByName('RedPoint'), i);
        }
    }
    _updateUnlockedOp() {
        if (!this._pointBottomNodes[this._selectedBout.pos]) {
            return;
        }
        (this._pointBottomNodes[this._selectedBout.pos] as cc.Node).opacity = (255);
        this._pointNodes[this._selectedBout.pos].node.getChildByName('RedPoint').active = (false);
    }
    _updateRedPoint() {
        var max = table.nums(this._pointBottomNodes);
        for (var i = 1; i <= max; i++) {
            BoutHelper.checkRedPoint(this._pointNodes[i].node.getChildByName('RedPoint'), i);
        }
    }
    _recordTotalPower() {
        var totalPower = G_UserData.getBase().getPower();
        this._diffPower = totalPower - this._lastTotalPower;
        this._lastTotalPower = totalPower;
    }
    _playPowerPromt() {
        var totalPower = G_UserData.getBase().getPower();
        let offsetX = 0;
        let offsetY = 0;
        cc.resources.load('prefab/common/CommonPowerPrompt', () => {

            cc.resources.load(Path.getUICommon('img_battle_arrow_up'),() => {
                var prompt: CommonPowerPrompt = Util.getNode('prefab/common/CommonPowerPrompt', CommonPowerPrompt);
                prompt.updateUI(totalPower, totalPower - this._lastTotalPower);
                prompt.play(offsetX, offsetY);
                this._recordTotalPower();
            });
        });

    }
    _onUnlockSuccess(id, message) {
        BoutHelper.playActiveSummary(this._selectedBout.id, this._selectedBout.pos);
        this._playPowerPromt();
        if (!BoutHelper.isSpecialBoutPoint(this._selectedBout.id, this._selectedBout.pos)) {
            BoutHelper.playEffectMusic(this._selectedBout.id, this._selectedBout.pos);
        }
        let eventFunc = function (event) {
            if (event == 'finish') {
                if (BoutHelper.isSpecialBoutPoint(this._selectedBout.id, this._selectedBout.pos)) {
                    BoutHelper.playEffectMusic(this._selectedBout.id, this._selectedBout.pos);
                }
                this._updateUnlockedOp();
                this._updateCurBoutId(false, true);
                this._updatePointNodes();
            }
        }.bind(this);
        var pos = this._selectedBout.pos == 7 && cc.v2(8, 0) || cc.v2(0,0);
        BoutHelper.createEffect(this._pointNodes[this._selectedBout.pos].node.getChildByName('EffectActive'), 2, eventFunc, true, pos);

        G_UserData.getBout().c2sGetBoutInfo();
    }
    _onEventGetRechargeNotice(id, message) {
        this._updateConsumeView();
    }
}