import { AudioConst } from "../../../const/AudioConst";
import { FunctionConst } from "../../../const/FunctionConst";
import { SignalConst } from "../../../const/SignalConst";
import { TacticsConst } from "../../../const/TacticsConst";
import { RedPointHelper } from "../../../data/RedPointHelper";
import { RichTextExtend } from "../../../extends/RichTextExtend";
import { Colors, G_AudioManager, G_EffectGfxMgr, G_Prompt, G_ResolutionManager, G_SceneManager, G_SignalManager, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import CommonCustomListViewEx from "../../../ui/component/CommonCustomListViewEx";
import CommonDetailTitleWithBg from "../../../ui/component/CommonDetailTitleWithBg";
import CommonScrollView from "../../../ui/component/CommonScrollView";
import CommonTabIcon2 from "../../../ui/component/CommonTabIcon2";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
import PopupTacticsDes from "../../../ui/popup/PopupTacticsDes";
import { TacticsDataHelper } from "../../../utils/data/TacticsDataHelper";
import { Slot } from "../../../utils/event/Slot";
import { handler } from "../../../utils/handler";
import { table } from "../../../utils/table";
import TabScrollView from "../../../utils/TabScrollView";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";
import ViewBase from "../../ViewBase";
import PopupCheckHeroTactics from "./PopupCheckHeroTactics";
import TacticsItemCell from "./TacticsItemCell";
import { TacticsStudyModule } from "./TacticsStudyModule";
import { TacticsTopItemListModule } from "./TacticsTopItemListModule";
import { TacticsUnlockModule } from "./TacticsUnlockModule";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TacticsView extends ViewBase {
    private _doingAnim: boolean;
    private _selectItem: any;
    private _selectTabIndex: number;
    private _curTacticsIndex: number;
    private _tacticsUnitList: any[];



    private _signalTacticsGetList: any;
    private _signalTacticsUnlockPos: any;
    private _signalTacticsCreate: any;
    private _signalTacticsPutOn: Slot;
    private _signalTacticsAddPro: Slot;
    private _signalTacticsGetFormation: Slot;
    private _signalTacticsPutDown: any;

    private _textDesc: cc.Node;
    private _curPro: any;

    @property({
        type: CommonCustomListViewEx,
        visible: true
    }) _listviewContent: CommonCustomListViewEx = null;

    private _tabList: CommonTabIcon2[];
    @property({
        type: CommonTabIcon2,
        visible: true
    }) _nodeTab1: CommonTabIcon2 = null;
    @property({
        type: CommonTabIcon2,
        visible: true
    }) _nodeTab2: CommonTabIcon2 = null;
    @property({
        type: CommonTabIcon2,
        visible: true
    }) _nodeTab3: CommonTabIcon2 = null;

    @property({
        type: cc.Node,
        visible: true
    }) _layoutInfo: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    }) _txtName: cc.Label = null;

    @property({
        type: CommonDetailTitleWithBg,
        visible: true
    }) _nodeTitleName: CommonDetailTitleWithBg = null;

    @property({
        type: cc.ScrollView,
        visible: true
    }) _scDetail: cc.ScrollView = null;

    @property({
        type: TacticsUnlockModule,
        visible: true
    }) _nodeUnlock: TacticsUnlockModule = null;

    @property({
        type: TacticsStudyModule,
        visible: true
    }) _nodeStudy: TacticsStudyModule = null;
    @property({
        type: CommonTopbarBase,
        visible: true
    }) _topbarBase: CommonTopbarBase = null;

    @property({
        type: TacticsTopItemListModule,
        visible: true
    }) _topItemList: TacticsTopItemListModule = null;

    @property({
        type: cc.Prefab
    }) tacticsItemCell: cc.Prefab = null;

    ctor() {
        this._doingAnim = false;
        this._selectItem = null;

    }
    onCreate() {
        this._initData();
        this._initView();
    }
    _initData() {
        this._selectTabIndex = 0;
        this._curTacticsIndex = 1;
        this._tacticsUnitList = [];
    }
    _initView() {
        this._topbarBase.setImageTitle('txt_sys_zhanfa');
        this._topbarBase.setItemListVisible(false);
        this._topbarBase.updateHelpUI(FunctionConst.FUNC_TACTICS, null);
        this._initTab();
        this._initListView();
        this._initDetail();
        this._initTopNum();
    }
    _initTab() {
        this._tabList = [
            this._nodeTab1,
            this._nodeTab2,
            this._nodeTab3
        ];
        for (var i in this._tabList) {
            var node = this._tabList[i];
            var path = TacticsDataHelper.getTacticsTabImgPath(Number(i) + 1, false);
            var selPath = TacticsDataHelper.getTacticsTabImgPath(Number(i) + 1, true);
            node.updateUI('', false, i, path, selPath);
            node.setClickCallback(handler(this, this._onButtonTabClick));
        }
    }
    _initListView() {
        this._listviewContent.setTemplate(this.tacticsItemCell);
        this._listviewContent.setCallback(handler(this, this._onItemUpdate));
    }
    _initDetail() {
        this._txtName.string = ('');
        this._nodeTitleName.setFontSize(24);
        this._nodeTitleName.setTitle(Lang.get('tactics_title_detail'));
        this._nodeUnlock.ctor(this, this._nodeUnlock.node, handler(this, this._onButtonUnlockClick));
        this._nodeUnlock.setVisible(false);
        this._nodeStudy.ctor(this, this._nodeStudy.node, handler(this, this._onButtonStudyClick));
        this._nodeStudy.setVisible(false);
    }
    _initTopNum() {
        this._topItemList.ctor();
        this._topItemList.updateInfo();
    }
    _onButtonTabClick(index) {
        if (this._doingAnim) {
            return;
        }
        if (index == this._selectTabIndex) {
            return;
        }
        this.switchTab(Number(index));
    }
    switchTab(index) {
        this._selectTabIndex = index;
        this._curTacticsIndex = 1;
        this.updateInfo();
    }
    updateInfo() {
        this._updateData();
        this._updateTab();
        this._updateView();
    }
    _updateTab() {
        for (var i in this._tabList) {
            var v = this._tabList[i];
            v.setSelected(false);
            var color = Number(i) + 5;
            var redPoint = RedPointHelper.isModuleReach(FunctionConst.FUNC_TACTICS, color);
            v.showRedPoint(redPoint);
        }
        this._tabList[this._selectTabIndex].setSelected(true);
        this._tabList[this._selectTabIndex].showRedPoint(false);
    }
    onEnter() {
        this._signalTacticsGetList = G_SignalManager.add(SignalConst.EVENT_TACTICS_GETLIST, handler(this, this._tacticsGetList));
        this._signalTacticsUnlockPos = G_SignalManager.add(SignalConst.EVENT_TACTICS_UNLOCK_POSITION, handler(this, this._tacticsUnlockPos));
        this._signalTacticsCreate = G_SignalManager.add(SignalConst.EVENT_TACTICS_CREATE, handler(this, this._tacticsCreate));
        this._signalTacticsPutOn = G_SignalManager.add(SignalConst.EVENT_TACTICS_ADD_SUCCESS, handler(this, this._tacticsPutOn));
        this._signalTacticsPutDown = G_SignalManager.add(SignalConst.EVENT_TACTICS_REMOVE_SUCCESS, handler(this, this._tacticsPutDown));
        this._signalTacticsAddPro = G_SignalManager.add(SignalConst.EVENT_TACTICS_ADD_PROFICIENCY, handler(this, this._tacticsAddPro));
        this._signalTacticsGetFormation = G_SignalManager.add(SignalConst.EVENT_TACTICS_GET_FORMATION, handler(this, this._tacticsGetFormation));
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK);
        G_AudioManager.preLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY);
        this.updateInfo();
    }
    onExit() {
        this._signalTacticsGetList.remove();
        this._signalTacticsGetList = null;
        this._signalTacticsUnlockPos.remove();
        this._signalTacticsUnlockPos = null;
        this._signalTacticsCreate.remove();
        this._signalTacticsCreate = null;
        this._signalTacticsPutOn.remove();
        this._signalTacticsPutOn = null;
        this._signalTacticsPutDown.remove();
        this._signalTacticsPutDown = null;
        this._signalTacticsAddPro.remove();
        this._signalTacticsAddPro = null;
        this._signalTacticsGetFormation.remove();
        this._signalTacticsGetFormation = null;
        this._selectItem = null;
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK);
        G_AudioManager.unLoadSoundWithId(AudioConst.SOUND_TACTICS_STUDY);
    }
    _updateData() {
        var color = this._selectTabIndex + 5;
        this._tacticsUnitList = G_UserData.getTactics().getTacticsList(TacticsConst.GET_LIST_TYPE_ALL, color);
    }
    _updateView() {
        this._updateBaseInfo();
        this._updateList();
    }
    _updateDesc(strDesc, suitType, isShowAll) {
        this._scDetail.content.removeAllChildren();
        var size = this._scDetail.content.getContentSize();
        // if (isShowAll) {
        //     this._scDetail.content.setContentSize(cc.size(size.width, 407));
        // } else {
        this._scDetail.content.setContentSize(cc.size(size.width, 150));
        // }
        size = this._scDetail.content.getContentSize();
        var sizeTemp = cc.size(size.width, 0);
        var isSuitAll = suitType == TacticsConst.SUIT_TYPE_ALL;
        this._textDesc = UIHelper.newRichText();
        var richText = this._textDesc.getComponent(cc.RichText);
        richText.maxWidth = size.width;
        var content = '';
        if (isSuitAll) {
            content = Lang.get('tactics_info_detail2', { content: strDesc });
        } else {
            content = Lang.get('tactics_info_detail', { content: strDesc });
        }
        RichTextExtend.setRichTextWithJson(richText, content);
        this._textDesc.setAnchorPoint(cc.v2(0, 1));
        this._textDesc.setContentSize(sizeTemp);
        this._scDetail.content.addChild(this._textDesc);
        var richTextContentSize = this._textDesc.getContentSize();
        var height = Math.max(size.height, richTextContentSize.height);
        //this._scDetail.setInnerContainerSize(cc.size(size.width, height));
        if (size.height < richTextContentSize.height) {
            this._textDesc.y = (richTextContentSize.height);
            //this._scDetail.setTouchEnabled(true);
        } else {
            this._textDesc.y = (size.height);
            //this._scDetail.setTouchEnabled(false);
        }
        if (!isSuitAll) {
            var node = this._textDesc;
            UIHelper.addClickEventListenerEx(node, handler(this, this._onDescriptionClick));
        }
    }
    _onDescriptionClick(sender, state) {
        if (this._doingAnim) {
            return;
        }
        var unitData = this._tacticsUnitList[this._curTacticsIndex - 1];
        var baseId = unitData.getBase_id();
        G_SceneManager.openPopup("prefab/common/PopupTacticsDes", (popup: PopupTacticsDes) => {
            popup.ctor(sender.target, baseId);
            popup.open();
        });
    }
    _updateBaseInfo() {
        var unitData = this._tacticsUnitList[this._curTacticsIndex - 1];
        if (unitData == null) {
            this._layoutInfo.active = (false);
            return;
        }
        var baseId = unitData.getBase_id();
        var param = TypeConvertHelper.convert(TypeConvertHelper.TYPE_TACTICS, baseId);
        this._txtName.string = (param.name);
        this._txtName.node.color = (param.icon_color);
        if (param.icon_color_outline_show) {
            UIHelper.enableOutline(this._txtName, param.icon_color_outline, 2);
        }
        var isShowAll = false;
        if (unitData.isCanWear()) {
            this._nodeUnlock.setVisible(false);
            this._nodeStudy.setVisible(false);
            isShowAll = true;
        } else if (unitData.isUnlocked()) {
            this._nodeUnlock.setVisible(false);
            this._nodeStudy.setVisible(true);
            this._nodeStudy.updateInfo(unitData);
        } else {
            this._nodeUnlock.setVisible(true);
            this._nodeUnlock.updateInfo(unitData);
            this._nodeStudy.setVisible(false);
        }
        var [_, _, suitType] = G_UserData.getTactics().getSuitInfoWithTacticsId(baseId);
        this._updateDesc(param.description, suitType, isShowAll);
        this._topItemList.updateInfo();
    }
    _updateList() {
        var rowNum = Math.ceil(this._tacticsUnitList.length / TacticsConst.CELLITEM_NUM);
        this._listviewContent.resize(rowNum);
    }
    _onItemUpdate(item, index) {
        var rowNum = Math.ceil(this._tacticsUnitList.length / TacticsConst.CELLITEM_NUM);
        if (index <= rowNum) {
            item.updateUI(this._tacticsUnitList, index, handler(this, this._tacticsSelectItem));
            var selItem = item.updateSelectState(this._curTacticsIndex);
            if (selItem != null) {
                this._selectItem = selItem;
            }
        }
    }
    getSelectItem() {
        return this._selectItem;
    }
    _onItemSelected(item, index) {
    }
    _tacticsSelectItem(index, subIndex) {
        if (this._doingAnim) {
            return;
        }
        this._curTacticsIndex = index * TacticsConst.UI_LIST_COL_NUM + subIndex;
        this._updateBaseInfo();
        for (var i = 0; i < this._listviewContent.content.childrenCount; i++) {
            var item = this._listviewContent.content.children[i];
            var selItem = item.getComponent(TacticsItemCell).updateSelectState(this._curTacticsIndex);
            if (selItem != null) {
                this._selectItem = selItem;
            }
        }
    }
    _onItemTouch(index, t) {
    }
    _onButtonUnlockClick() {
        if (this._doingAnim) {
            return;
        }
        var unitData = this._tacticsUnitList[this._curTacticsIndex - 1];
        if (!TacticsDataHelper.isCanUnlocked(unitData)) {
            return G_Prompt.showTip(Lang.get('tactics_unlock_materials_lack2'));
        }
        var materials = [];
        var list = TacticsDataHelper.getUnlockedMaterials(unitData);
        for (var i in list) {
            var v = list[i];
            var baseId = v.value;
            var sameCards = G_UserData.getHero().getSameCardCountWithBaseId(baseId);
            var count = 0;
            for (var k in sameCards) {
                var card = sameCards[k];
                if (count >= v.size) {
                    break;
                }
                table.insert(materials, card.getId());
                count = count + 1;
            }
        }
        G_UserData.getTactics().c2sCreateTactics(unitData.getBase_id(), materials);
    }
    _onUnlockEffectPlayEnd() {
        if (this._selectItem == null) {
            return;
        }
        var selItem = this._selectItem;
        var position = UIHelper.convertSpaceFromNodeToNode(selItem.node, this.node, cc.v2(0, 20));
        var promptPos = cc.v2(position.x, position.y - 20);
        function eventFunc(event, frameIndex, node) {
            if (event == 'finish') {

            }
        }
        var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhanfa_yuankuang', eventFunc, true, position);
        subEffect.node.setScale(1.2);
        this._doingAnim = false;
        this.updateInfo();
        this._playUnlockPrompt(promptPos);
    }
    _playUnlockPrompt(position) {
        var size = G_ResolutionManager.getDesignCCSize();
        position.x = position.x - size.width * 0.5;
        position.y = position.y - size.height * 0.5 + 20;
        var summary = [];
        var param = {
            content: Lang.get('summary_tactics_unlock_success', {
                color: Colors.colorToNumber(Colors.getColor(2)),
                outlineColor: Colors.colorToNumber(Colors.getColorOutline(2))
            }),
            startPosition: {
                x: 0,
                y: 0
            }
        };
        table.insert(summary, param);
        G_Prompt.showSummary(summary);
    }
    _playStudyPrompt(position, num) {
        var size = G_ResolutionManager.getDesignCCSize();
        position.x = position.x - size.width * 0.5;
        position.y = position.y - size.height * 0.5 + 20;
        var summary = [];
        var param = {
            content: Lang.get('summary_tactics_study_success', {
                num: num,
                color: Colors.colorToNumber(Colors.getColor(2)),
                outlineColor: Colors.colorToNumber(Colors.getColorOutline(2))
            }),
            startPosition: {
                x: position.x,
                y: position.y
            }
        };
        table.insert(summary, param);
        G_Prompt.showSummary(summary);
    }
    _onButtonStudyClick() {
        if (this._doingAnim) {
            return;
        }
        var unitData = this._tacticsUnitList[this._curTacticsIndex - 1];
        this._curPro = unitData.getProficiency();
        G_SceneManager.openPopup("prefab/common/PopupCheckHeroTactics", (popup: PopupCheckHeroTactics) => {
            popup.ctor(this, handler(this, this._onStudyClose));
            popup.updateUI(unitData);
            popup.openWithAction();
        });

    }
    _onStudyClose(message) {
        if (this._selectItem == null) {
            return;
        }
        var selItem = this._selectItem;
        this._doingAnim = true;
        var pro = 0;
        if (message.tacticsInfo.length > 0) {
            pro = message.tacticsInfo[0].proficiency || 0;
        }
        var num = Math.max(0, pro - this._curPro) / 10;
        var pos1 = UIHelper.convertSpaceFromNodeToNode(selItem.node, this.node, cc.v2(0, 30));
        var pos2 = cc.v2(pos1.x, pos1.y - 10);
        var promptPos = cc.v2(pos1.x, pos1.y - 30);
        var self = this;
        function eventFunc(event, frameIndex, node) {
            if (event == 'finish') {
                // const eventFunc1 = (event, frameIndex, node) => {
                //     if (event == 'finish') {
                self._doingAnim = false;
                self.updateInfo();
                self._playStudyPrompt(promptPos, num);
            }
            // }
            // var subEffect1 = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhanfa_yuankuang', eventFunc1, true, pos2);
            // subEffect1.node.setScale(1.2);
            // }
        }
        var subEffect = G_EffectGfxMgr.createPlayGfx(this.node, 'effect_zhanfa_julong', eventFunc, true, pos1);
        subEffect.node.setScale(3.2);
        G_AudioManager.playSoundWithId(AudioConst.SOUND_TACTICS_STUDY);
    }
    _tacticsGetList() {
        this.updateInfo();
    }
    _tacticsUnlockPos() {
        this.updateInfo();
    }
    _tacticsCreate() {
        if (this._doingAnim) return;
        this._doingAnim = true;
        this._nodeUnlock.playEffect(handler(this, this._onUnlockEffectPlayEnd));
        G_AudioManager.playSoundWithId(AudioConst.SOUND_TACTICS_UNLOCK);
    }
    _tacticsPutOn() {
        this.updateInfo();
    }
    _tacticsPutDown() {
        this.updateInfo();
    }
    _tacticsAddPro() {
    }
    _tacticsGetFormation() {
        this.updateInfo();
    }
}