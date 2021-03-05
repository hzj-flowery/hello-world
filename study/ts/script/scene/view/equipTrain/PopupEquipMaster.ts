const { ccclass, property } = cc._decorator;

import CommonNormalLargePop from '../../../ui/component/CommonNormalLargePop'
import MasterConst from '../../../const/MasterConst';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import EquipMasterProgressNode from './EquipMasterProgressNode';
import { EquipMasterHelper } from '../equipTrain/EquipMasterHelper';
import { TextHelper } from '../../../utils/TextHelper';
import CommonTabGroupHorizon from '../../../ui/component/CommonTabGroupHorizon';
import CommonDetailTitle from '../../../ui/component/CommonDetailTitle';
import CommonDesValue from '../../../ui/component/CommonDesValue';
import UIHelper from '../../../utils/UIHelper';
import PopupBase from '../../../ui/PopupBase';
import { RichTextExtend } from '../../../extends/RichTextExtend';

@ccclass
export default class PopupEquipMaster extends PopupBase {
    public static path = 'equipment/PopupEquipMaster';

    @property({
        type: CommonNormalLargePop,
        visible: true
    })
    _panelBg: CommonNormalLargePop = null;
    @property({
        type: CommonTabGroupHorizon,
        visible: true
    })
    _nodeTabRoot: CommonTabGroupHorizon = null;
    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _nodeTextProgress: CommonDetailTitle = null;
    @property({
        type: EquipMasterProgressNode,
        visible: true
    })
    _fileNode1: EquipMasterProgressNode = null;
    @property({
        type: EquipMasterProgressNode,
        visible: true
    })
    _fileNode2: EquipMasterProgressNode = null;
    @property({
        type: EquipMasterProgressNode,
        visible: true
    })
    _fileNode3: EquipMasterProgressNode = null;
    @property({
        type: EquipMasterProgressNode,
        visible: true
    })
    _fileNode4: EquipMasterProgressNode = null;
    @property({
        type: CommonDetailTitle,
        visible: true
    })
    _nodeTextLevel: CommonDetailTitle = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeCurLevelPos: cc.Node = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeCurAttr1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeCurAttr2: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeCurAttr3: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeCurAttr4: CommonDesValue = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNextLevelPos: cc.Node = null;
    @property({
        type: cc.Node,
        visible: true
    })
    _nodeNextLevelPos2: cc.Node = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeNextAttr1: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeNextAttr2: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeNextAttr3: CommonDesValue = null;
    @property({
        type: CommonDesValue,
        visible: true
    })
    _fileNodeNextAttr4: CommonDesValue = null;


    _pos: any;
    _selectTabIndex = -1;

    _idx: number;



    ctor(pos, index?) {
        this._pos = pos;
        this._idx = index || MasterConst.MASTER_TYPE_1;
    }
    onCreate() {
        this._panelBg.setTitle(Lang.get('equipment_master_title'));
        this._panelBg.addCloseEventListener(handler(this, this._onClickClose));
        this._nodeTextProgress.setFontSize(24);
        this._nodeTextProgress.showTextBg(false);
        this._nodeTextProgress.setFontImageBgSize(cc.size(226, 34));
        this._nodeTextLevel.setFontSize(24);
        this._nodeTextLevel.setFontImageBgSize(cc.size(226, 34));
        this._nodeTextLevel.showTextBg(false);
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeCurAttr' + i].setFontSize(20);
            this['_fileNodeNextAttr' + i].setFontSize(20);
            this['_fileNode' + i].setGetTabIndexFunc(handler(this, this.getSelectTabIndex));
        }
        this._initTab();

        this._nodeTabRoot.setTabIndex(this._idx - 1);
    }
    onEnter() {
        //  this._updateInfo();
    }
    onExit() {
    }
    _initTab() {
        var param = {
            callback: handler(this, this._onTabSelect),
            isVertical: 2,
            offset: -2,
            textList: EquipMasterHelper.getMasterTabNameList()
        };
        this._nodeTabRoot.recreateTabs(param);
        //this._updateInfo();
    }
    _onTabSelect(index, sender) {
        index++;
        if (this._selectTabIndex == index) {
            return false;
        }
        this._selectTabIndex = index;
        this._updateInfo();
        return true;
    }
    _updateInfo() {
        this._nodeTextProgress.setTitle(Lang.get('equipment_master_text_progress_' + this._selectTabIndex));
        this._nodeTextLevel.setTitle(Lang.get('equipment_master_text_level_' + this._selectTabIndex));
        var progressInfo = EquipMasterHelper.getCurMasterInfo(this._pos, this._selectTabIndex);
        for (var i = 1; i <= 4; i++) {
            var info = progressInfo.info[i];
            this['_fileNode' + i].updateView(info, progressInfo.masterInfo.needLevel, progressInfo.type);
        }
        var masterType = this._selectTabIndex;
        var curLevel = progressInfo.masterInfo.curMasterLevel;
        var nextLevel = progressInfo.masterInfo.nextMasterLevel;
        var curContent = Lang.get('equipment_master_cur_level_' + masterType, { level: curLevel });
        //to do 
        var curRichText = RichTextExtend.createWithContent(curContent);
        curRichText.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeCurLevelPos.removeAllChildren();
        this._nodeCurLevelPos.addChild(curRichText.node);
        var nextContent = Lang.get('equipment_master_next_level_' + masterType, { masterLevel: nextLevel });
        var nextContent2 = Lang.get('equipment_master_next_all_level_' + masterType, { level: progressInfo.masterInfo.needLevel });

        var nextRichText = RichTextExtend.createWithContent(nextContent);
        nextRichText.node.setAnchorPoint(cc.v2(0, 0.5));
        var nextRichText2 = RichTextExtend.createWithContent(nextContent2);
        nextRichText2.node.setAnchorPoint(cc.v2(0, 0.5));
        this._nodeNextLevelPos.removeAllChildren();
        this._nodeNextLevelPos.addChild(nextRichText.node);
        this._nodeNextLevelPos2.removeAllChildren();
        this._nodeNextLevelPos2.addChild(nextRichText2.node);
        for (var i = 1; i <= 4; i++) {
            this['_fileNodeCurAttr' + i].setVisible(false);
            this['_fileNodeNextAttr' + i].setVisible(false);
        }
        var curAttrInfo = progressInfo.masterInfo.curAttr;
        var nextAttrInfo = progressInfo.masterInfo.nextAttr;
        var curIndex = 1;
        for (var attrType in curAttrInfo) {
            var attrValue = curAttrInfo[attrType];
            var [name, value] = TextHelper.getAttrBasicText(attrType, attrValue);
            this['_fileNodeCurAttr' + curIndex].updateUI(name + '\uFF1A', value);
            this['_fileNodeCurAttr' + curIndex].setVisible(true);
            curIndex = curIndex + 1;
        }
        var nextIndex = 1;
        for (attrType in nextAttrInfo) {
            var attrValue = nextAttrInfo[attrType];
            var [name, value] = TextHelper.getAttrBasicText(attrType, attrValue);
            this['_fileNodeNextAttr' + nextIndex].updateUI(name + '\uFF1A', value);
            this['_fileNodeNextAttr' + nextIndex].setVisible(true);
            nextIndex = nextIndex + 1;
        }
    }
    getSelectTabIndex() {
        return this._selectTabIndex;
    }
    _onClickClose() {
        this.close();
    }

}