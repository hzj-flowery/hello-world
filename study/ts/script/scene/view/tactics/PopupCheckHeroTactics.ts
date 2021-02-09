
import PopupBase from "../../../ui/PopupBase";
import { SignalConst } from "../../../const/SignalConst";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import { AudioConst } from "../../../const/AudioConst";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import { TacticsConst } from "../../../const/TacticsConst";
import UIHelper from "../../../utils/UIHelper";
import PopupCheckHeroTacticsCell from "./PopupCheckHeroTacticsCell";
import CommonNormalLargePop from "../../../ui/component/CommonNormalLargePop";
import CommonDesValue from "../../../ui/component/CommonDesValue";
import CommonDesDiff from "../../../ui/component/CommonDesDiff";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonEmptyTipNode from "../../../ui/component/CommonEmptyTipNode";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCheckHeroTactics extends PopupBase {
    private _doingAnim: boolean;
    private _parentView: any;
    private _successCallback: any;
    @property({
        type: CommonNormalLargePop,
        visible: true
    }) _commonNodeBk: CommonNormalLargePop = null;
    private _emptyNode: cc.Node;
    private _selectList: {};
    private _maxNum: number;
    @property({
        type: CommonDesValue,
        visible: true
    }) _fileDes1: CommonDesValue = null;
    @property({
        type: CommonDesDiff,
        visible: true
    }) _fileDes2: CommonDesDiff = null;
    private _signalTacticsAddPro: any;
    private _tacticsUnitData: any;
    private _herosData: any;
    private _count: any;
    @property({
        type: CommonCustomListViewEx,
        visible: true
    }) _listView: CommonCustomListViewEx = null;
    @property({
        type: CommonEmptyTipNode,
        visible: true
    }) _fileNodeEmpty: CommonEmptyTipNode = null;
    @property({
        type: cc.Node,
        visible: true
    }) _btnStudy: cc.Node = null;
    @property(cc.Prefab) popupCheckHeroTacticsCell: cc.Prefab = null;

    ctor(parentView, successCallback) {
        this._doingAnim = false;
        this._parentView = parentView;
        this._successCallback = successCallback;
    }
    onCreate() {
        this._commonNodeBk.addCloseEventListener(handler(this, this._onButtonClose));
        UIHelper.addClickEventListenerEx(this._btnStudy, handler(this, this._onButtonStudy))
        var size = G_ResolutionManager.getDesignCCSize();
        this._emptyNode = new cc.Node();
        this._emptyNode.setPosition(0, size.height * 0.5);
        this.node.addChild(this._emptyNode);
        this._selectList = [];
        this._maxNum = 10;
    }
    onEnter() {
        this._fileDes1.setDesColor(Colors.TacticsCommonColor);
        this._fileDes1.setValueColor(Colors.TacticsBlueColor);
        this._fileDes1.setMaxColor(Colors.TacticsCommonColor2);
        this._fileDes1.setFontSize(20);
        this._fileDes2.setDesColor(Colors.TacticsCommonColor);
        this._fileDes2.setValueColor1(Colors.TacticsCommonColor2);
        this._fileDes2.setValueColor2(Colors.TacticsBlueColor);
        this._fileDes2.setSpace1(0);
        this._fileDes2.setSpace2(35);
        this._signalTacticsAddPro = G_SignalManager.add(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, handler(this, this._tacticsAddPro));
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT);
        this._updateInfo();
    }
    onExit() {
        this._signalTacticsAddPro.remove();
        this._signalTacticsAddPro = null;
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT);
    }
    updateUI(tacticsUnitData) {
        this._tacticsUnitData = tacticsUnitData;
        this._commonNodeBk.setTitle(Lang.get('tactics_study_title'));
        this._herosData = G_UserData.getHero().getStudyHeroList(this._tacticsUnitData.getId());
        this._count = Math.ceil(this._herosData.length / 3);
        if (this._count == 0) {
            this._listView.setVisible(false);
            var emptyType = TypeConvertHelper.TYPE_HERO;
            this._fileNodeEmpty.updateView(emptyType);
            this._fileNodeEmpty.node.active = (true);
            this._fileNodeEmpty.setButtonGetVisible(false);
            this._fileNodeEmpty.setTipsString(Lang.get('tactics_study_hero_empty'));
        } else {
            this._listView.setVisible(true);
            this._listView.setTemplate(this.popupCheckHeroTacticsCell);
            this._listView.setCallback(handler(this, this._onItemUpdate), handler(this, this._onItemSelected));
            this._listView.setCustomCallback(handler(this, this._onItemTouch));
            this._listView.resize(this._count);
            this._fileNodeEmpty.node.active = (false);
        }
        this._updateInfo();
    }
    _onItemUpdate(item: PopupCheckHeroTacticsCell, index) {
        index = index * 3;
        var dataList = {};
        var isAddedList = {};
        if (!this._selectList) this._selectList = [];
        for (var i = 0; i < 3; i++) {
            if (this._herosData[index + i]) {
                var heroData = this._herosData[index + i];
                dataList[i] = heroData;
                isAddedList[i] = this._selectList[index + i] ?? false;
            }
        }
        item.updateCell(this._tacticsUnitData, dataList, isAddedList);
    }
    _onItemSelected(item, index) {
    }
    getSelectedHeroStudyNum() {
        var num = 0;
        for (var k in this._selectList) {
            var v = this._selectList[k];
            if (v) {
                num = num + this._tacticsUnitData.getStudyNumByHero(v.getBase_id());
            }
        }
        return num;
    }
    getSelectedHeroNum() {
        var num = 0;
        for (var k in this._selectList) {
            var v = this._selectList[k];
            if (v) {
                num = num + 1;
            }
        }
        return num;
    }
    checkIsMaxCount() {
        var num1 = this._tacticsUnitData.getProficiency();
        var num2 = this.getSelectedHeroStudyNum();
        if (num1 + num2 >= TacticsConst.MAX_PROFICIENCY) {
            return true;
        } else {
            return false;
        }
    }
    _onItemTouch(index, t, selected, item) {
        if (this._doingAnim) {
            return;
        }
        if (selected && this.checkIsMaxCount()) {
            G_Prompt.showTip(Lang.get('tactics_study_select_max_tip'));
            this.scheduleOnce(() => {
                item.setCheckBoxSelected(t, false);
            }, 0)
            return;
        } else if (selected && this.getSelectedHeroNum() >= this._maxNum) {
            G_Prompt.showTip(Lang.get('hero_upgrade_food_max_tip'));
            this.scheduleOnce(() => {
                item.setCheckBoxSelected(t, false);
            }, 0)
            return;
        }
        var trueIndex = index * 3 + t;
        var heroData = this._herosData[trueIndex - 1];
        if (selected) {
            this._selectList[trueIndex] = heroData;
        } else {
            this._selectList[trueIndex] = null;
        }
        this._updateInfo();
    }
    _onButtonClose() {
        if (this._doingAnim) {
            return;
        }
        this.close();
    }
    _tacticsAddPro(event, message) {
        this._doingAnim = true;
        var cells = this._listView.getItems();
        var selectItemList = [];
        for (var i in cells) {
            var cell = cells[i];
            var list = cell.getSelectedState();
            for (var index in list) {
                var selected = list[index];
                if (selected) {
                    var item = cell.getItem(Number(index) + 1);
                    table.insert(selectItemList, item);
                }
            }
        }
        if (selectItemList.length == 0) {
            table.insert(selectItemList, this._emptyNode);
        }
        var itemAnimFinishCount = 0;
        var size = this._btnStudy.getContentSize();
        var btnPosition = UIHelper.convertSpaceFromNodeToNode(this._btnStudy, this.node, cc.v2(0, 0));
        for (var k in selectItemList) {
            var item = selectItemList[k];
            var itemPosition = UIHelper.convertSpaceFromNodeToNode(item.node, this.node, cc.v2(0, 0));
            if (itemPosition.y >= btnPosition.y) {
                const eventFunc1 = function (event, frameIndex, node) {
                    if (event == 'forever') {
                        node.node.active = (false);
                    }
                }
                var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_yanxi_quan', eventFunc1, true, itemPosition);
                subEffect.setDouble(0.5);
                var [scale, angle] = this._calcFlashParam(itemPosition, btnPosition);
                const eventFunc2 = function (event, frameIndex, node) {
                    if (event == 'forever') {
                        node.node.active = (false);
                    }
                }
                var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_yanxi_xiantiao', eventFunc2, true, btnPosition);
                subEffect.node.setScale(scale);
                subEffect.node.setRotation(angle);
            }
        }
        var position = cc.v2(btnPosition.x, btnPosition.y + 5);
        const eventFunc = (event, frameIndex, node) => {
            if (event == 'finish') {
            }
        }
        var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhanfa_yuankuang', eventFunc, true, position);
        subEffect.node.setScale(1.5);
        this.scheduleOnce(function () {
            if (this._successCallback) {
                this._successCallback(message);
            }
            this.close();
        }, 1.2);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_TACTICS_STUDY_SELECT);
    }
    _calcFlashParam(pos1, pos2) {
        var a = 15;
        var b = 450;
        var c = Math.sqrt(a * a + b * b);
        var r = Math.atan(a / b);
        var a2 = pos1.x - pos2.x;
        var b2 = pos1.y - pos2.y;
        var c2 = Math.sqrt(a2 * a2 + b2 * b2);
        var r2 = Math.atan(a2 / b2);
        var scale = c2 / c;
        var angle = (r2 - r) * 180 / Math.PI;
        return [
            scale,
            angle
        ];
    }
    _onButtonStudy() {
        if (this._doingAnim) {
            return;
        }
        var materials = [];
        for (var k in this._selectList) {
            var v = this._selectList[k];
            if (v) {
                table.insert(materials, v.getId());
            }
        }
        if (materials.length < 1) {
            return G_Prompt.showTip(Lang.get('tactics_study_hero_select_tip'));
        }
        var tacticsUId = this._tacticsUnitData.getId();
        G_UserData.getTactics().c2sAddTacticsPro(tacticsUId, materials);
    }
    _updateInfo() {
        var selNum = this.getSelectedHeroNum();
        this._fileDes1.updateUI(Lang.get('tactics_popup_check_hero'), selNum, this._maxNum);
        if (selNum > 0) {
            this._fileDes1.setValueColor(Colors.TacticsBlueColor);
        } else {
            this._fileDes1.setValueColor(Colors.TacticsCommonColor2);
        }
        var addNum = this.getSelectedHeroStudyNum() / 10;
        if (addNum > 0) {
            this._fileDes2.updateUI(Lang.get('tactics_popup_check_proficiency'), Lang.get('hero_detail_common_percent', { value: this._tacticsUnitData.getProficiency() / 10 }), Lang.get('tactics_title_study_add_desc', { num: addNum }));
        } else {
            this._fileDes2.updateUI(Lang.get('tactics_popup_check_proficiency'), Lang.get('hero_detail_common_percent', { value: this._tacticsUnitData.getProficiency() / 10 }), '');
        }
    }
}