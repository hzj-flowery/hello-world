const {ccclass, property} = cc._decorator;

import CommonContinueNode from '../../../ui/component/CommonContinueNode'

import CommonAttrDiff2 from '../../../ui/component/CommonAttrDiff2'
import PopupBase from '../../../ui/PopupBase';
import MasterConst from '../../../const/MasterConst';
import { G_AudioManager } from '../../../init';
import { AudioConst } from '../../../const/AudioConst';
import { Lang } from '../../../lang/Lang';
import { Path } from '../../../utils/Path';
import UIHelper from '../../../utils/UIHelper';
import { RichTextExtend } from '../../../extends/RichTextExtend';

var TYPE_RES = {};
TYPE_RES[MasterConst.MASTER_TYPE_1] = 'img_btn_qianghuadashi01';
TYPE_RES[MasterConst.MASTER_TYPE_2] = 'img_btn_qianghuadashi01';
TYPE_RES[MasterConst.MASTER_TYPE_3] = 'img_btn_qianghuadashi01';
TYPE_RES[MasterConst.MASTER_TYPE_4] = 'img_btn_qianghuadashi01';

@ccclass
export default class PopupMasterLevelup extends PopupBase {

   @property({
       type: cc.Label,
       visible: true
   })
   _textTotalLevel: cc.Label = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageIcon1: cc.Sprite = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imageIcon2: cc.Sprite = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeLevelPos1: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _nodeLevelPos2: cc.Node = null;

   @property({
       type: CommonAttrDiff2,
       visible: true
   })
   _nodeAttrDiff1: CommonAttrDiff2 = null;

   @property({
       type: CommonAttrDiff2,
       visible: true
   })
   _nodeAttrDiff2: CommonAttrDiff2 = null;

   @property({
       type: CommonAttrDiff2,
       visible: true
   })
   _nodeAttrDiff3: CommonAttrDiff2 = null;

   @property({
       type: CommonAttrDiff2,
       visible: true
   })
   _nodeAttrDiff4: CommonAttrDiff2 = null;

   @property({
       type: CommonContinueNode,
       visible: true
   })
   _nodeContinue: CommonContinueNode = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

    public static path:string = 'equipment/PopupMasterLevelup';

    private _parentView:any;
    _masterInfo1:any;
    _masterInfo2:any;
    _masterType:number;

    ctor(parentView, masterInfo1, masterInfo2, masterType) {
        this._parentView = parentView;
        this._masterInfo1 = masterInfo1;
        this._masterInfo2 = masterInfo2;
        this._masterType = masterType;
        UIHelper.addEventListenerToNode(this.node, this._panelTouch, 'PopupMasterLevelup', '_onClickTouch');
    }
    onCreate() {
    }
    onEnter() {
        G_AudioManager.playSoundWithId(AudioConst.SOUND_MASTER);
        this._updateView();
    }
    onExit() {
    }
    _onClickTouch() {
        if (this._parentView && this._parentView.onExitPopupMasterLevelup) {
            this._parentView.onExitPopupMasterLevelup();
        }
        this.close();
    }
    _updateView() {
        var totalLevel = this._masterInfo1.masterInfo.needLevel;
        this._textTotalLevel.string = (Lang.get('equipment_master_total_level', { level: totalLevel }));
        var iconRes = Path.getCommonIcon('main', TYPE_RES[this._masterType]);
        UIHelper.loadTexture(this._imageIcon1, iconRes);
        UIHelper.loadTexture(this._imageIcon2, iconRes);
        var name = Lang.get('equipment_master_tab_title_' + this._masterType);
        var level1 = this._masterInfo1.masterInfo.curMasterLevel;
        var content1 = Lang.get('equipment_master_level', {
            name: name,
            level: level1
        });
        var richText1 = RichTextExtend.createWithContent(content1);
        richText1.node.setAnchorPoint(cc.v2(0.5, 1));
        var level2 = this._masterInfo2.masterInfo.curMasterLevel;
        var content2 = Lang.get('equipment_master_level', {
            name: name,
            level: level2
        });
        var richText2 = RichTextExtend.createWithContent(content2);
        richText2.node.setAnchorPoint(cc.v2(0.5, 1));
        this._nodeLevelPos1.addChild(richText1.node);
        this._nodeLevelPos2.addChild(richText2.node);
        for (var i = 1; i<=4; i++) {
            this['_nodeAttrDiff' + i].node.active = (false);
        }
        var attrInfo1 = this._masterInfo1.masterInfo.curAttr;
        var attrInfo2 = this._masterInfo2.masterInfo.curAttr;
        var index = 1;
        for(let k in attrInfo1) {
            var value = attrInfo1[k];
            var value2 = attrInfo2[k];
            this['_nodeAttrDiff' + index].updateInfo(k, value, value2, 3);
            this['_nodeAttrDiff' + index].node.active = (true);
            index = index + 1;
        }
    }
}
