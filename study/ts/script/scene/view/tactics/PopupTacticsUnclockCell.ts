import CommonIconTemplate from "../../../ui/component/CommonIconTemplate";
import ListViewCellBase from "../../../ui/ListViewCellBase";
import { handler } from "../../../utils/handler";
import { TypeConvertHelper } from "../../../utils/TypeConvertHelper";
import UIHelper from "../../../utils/UIHelper";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTacticsUnclockCell extends ListViewCellBase {

    private _checkList: any;
    private _unitDataList: any;
    @property({
        type: cc.Node,
        visible: true
    }) _resource: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _item6: cc.Node = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon2: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon3: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon4: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon5: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    }) _fileNodeCommon6: CommonIconTemplate = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageMask6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _imageCheck6: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch1: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch2: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch3: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch4: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch5: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    }) _panelTouch6: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName3: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName4: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName5: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    }) _textHeroName6: cc.Label = null;


    onCreate() {
        this.node.setContentSize(this._resource.getContentSize());
    }
    private clickFunc = false;
    _onPanelTouch(sender, state) {
        if (this.clickFunc) return;
        if (state == cc.Node.EventType.TOUCH_END || !state) {
            this.clickFunc = true;
            var subIndex = sender.target.name;
            this.dispatchCustomCallback(subIndex, !this.getSelectState(subIndex), this);
            this.scheduleOnce(() => {//会触发多次，找不到原因
                this.clickFunc = false;
            }, 0.5)
        }
    }
    getSelectState(index) {
        var res = this._checkList[index];
        return res;
    }
    setSelectState(index, isSel) {
        this._checkList[index] = isSel;
        if (isSel) {
            this['_fileNodeCommon' + index].setIconMask(true);
            this['_imageCheck' + index].active = (true);
        } else {
            this['_fileNodeCommon' + index].setIconMask(false);
            this['_imageCheck' + index].active = (false);
        }
    }
    updateUI(unitDataList, checkList) {
        this._unitDataList = unitDataList;
        this._checkList = checkList;
        for (var i = 1; i <= 6; i++) {
            this['_item' + i].active = (false);
        }
        var self = this;
        function updateItem(i, unitData, isCheck) {
            if (!unitData.getBase_id) return;
            i = (Number(i) + 1).toString();
            self['_item' + i].active = (true);
            self['_imageMask' + i].active = (false);
            var params = TypeConvertHelper.convert(TypeConvertHelper.TYPE_HERO, unitData.getBase_id());
            self['_fileNodeCommon' + i].active = (true);
            self['_fileNodeCommon' + i].unInitUI();
            self['_fileNodeCommon' + i].initUI(TypeConvertHelper.TYPE_HERO, unitData.getBase_id());
            self['_textHeroName' + i].string = (params.name);
            self['_textHeroName' + i].node.color = (params.icon_color);
            if (params.color == 7) {
                UIHelper.enableOutline(self['_textHeroName' + i], params.icon_color_outline, 2);
            }
            self.setSelectState(i, isCheck);
            self['_panelTouch' + i].name = (i);
            UIHelper.addClickEventListenerEx(self['_panelTouch' + i], handler(self, self._onPanelTouch));
        }
        for (var index in unitDataList) {
            var unitData = unitDataList[index];
            updateItem(index, unitData, checkList[index]);
        }
    }
}