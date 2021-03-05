const { ccclass, property } = cc._decorator;

import CommonHeroIcon from '../../../ui/component/CommonHeroIcon'

import CommonButtonLevel0Highlight from '../../../ui/component/CommonButtonLevel0Highlight'
import PopupBase from '../../../ui/PopupBase';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';
import ListView from '../recovery/ListView';
import { G_UserData, G_SignalManager } from '../../../init';
import { PopUpPlayerFrameHelper } from './PopUpPlayerFrameHelper';
import { SignalConst } from '../../../const/SignalConst';
import { FunctionConst } from '../../../const/FunctionConst';
import PopUpPlayerFrameItemCell from './PopUpPlayerFrameItemCell';

@ccclass
export default class PopUpPlayerFrame extends PopupBase {

    @property({
        type: cc.Button,
        visible: true
    })
    _btnClose: cc.Button = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _titleName: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _frameTime: cc.Label = null;

    @property({
        type: CommonButtonLevel0Highlight,
        visible: true
    })
    _btnEquip: CommonButtonLevel0Highlight = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _frameName: cc.Label = null;

    @property({
        type: ListView,
        visible: true
    })
    _listItemSource: ListView = null;

    @property({
        type: CommonHeroIcon,
        visible: true
    })
    _descHeroNode: CommonHeroIcon = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _descStr: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _descStr2: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _descMyFrame: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _descDetail: cc.Label = null;

    @property({
        type: cc.Prefab,
        visible: true
    })
    _playerFrameItemCellPrefab: cc.Prefab = null;

    private _title;
    private _listData: any[];
    public onCreate() {
        this._title = Lang.get('honor_title_title');
        this._btnEquip.addClickEventListenerEx(handler(this, this.onBtnEquipFrame));

        this._descMyFrame.string = (Lang.get('my_frame'));
        this._descDetail.string = (Lang.get('frame_detail'));
        this._titleName.string = (Lang.get('change_role_frame'));
        this._btnEquip.setString(Lang.get('role_frame_equip'));
        this._listItemSource.setTemplate(this._playerFrameItemCellPrefab);
        this._listItemSource.setCallback(handler(this, this._onItemUpdate));
        var currentFrame = G_UserData.getHeadFrame().getCurrentFrame();
        this.updateDescView(currentFrame);
        if (currentFrame != null) {
            PopUpPlayerFrameHelper.setCurrentTouchIndex(currentFrame.getId());
        } else {
            PopUpPlayerFrameHelper.setCurrentTouchIndex(0);
        }
    }

    public updateMainView(currentId) {
        this.updateDescView(G_UserData.getHeadFrame().getFrameDataWithId(currentId));
        this._listItemSource.updateAll();
        // this._listItemSource.clearAll();
        // this._listItemSource.resize(this._listData.length);
    }

    public updateDescView(frameInfo) {
        this._frameName.node.active = (frameInfo != null);
        this._descHeroNode.node.active = (frameInfo != null);
        if (frameInfo != null) {
            var headName = frameInfo.getName();
            this._frameName.string = (headName);
            var timeStr = '';
            if (frameInfo.getTime_type() == 2) {
                timeStr = Lang.get('frame_forever');
            } else if (frameInfo.getTime_type() == 1) {
                timeStr = Lang.get('frame_forever').format(frameInfo.getTime_value());
            }
            this._frameTime.string = (timeStr);
            if (frameInfo.isHave()) {
                this._btnEquip.setVisible(true);
                this._descStr.node.active = (false);
                this._descStr2.node.active = (true);
                this._descStr2.string = (frameInfo.getDes());
            } else {
                this._btnEquip.setVisible(false);
                this._descStr.node.active = (true);
                this._descStr.string = (frameInfo.getDes());
                this._descStr2.node.active = (false);
            }
            this._descHeroNode.updateIcon(G_UserData.getBase().getPlayerShowInfo(), null, frameInfo.getId());
        }
    }

    public onEnter() {
        this.initFrameListData();
    }

    public initFrameListData() {
        this._listData = [];
        var frameListData = G_UserData.getHeadFrame().getFrameListData();
        this._listData = frameListData;
        this._listItemSource.clearAll();
        this._listItemSource.resize(this._listData.length);
    }

    private _onItemUpdate(node: cc.Node, index) {
        let item: PopUpPlayerFrameItemCell = node.getComponent(PopUpPlayerFrameItemCell);
        if (this._listData[index]) {
            item.setItemTouchCallBack(handler(this, this.updateMainView));
            item.updateUI(this._listData[index]);
        }
    }

    private _onItemSelected(item, index) {
    }

    private _onItemTouch(lineIndex, index) {
    }

    public onBtnEquipFrame(sender, state) {
        var currentId = PopUpPlayerFrameHelper.getCurrentTouchIndex();
        G_UserData.getHeadFrame().c2sChangeHeadFrame(currentId);
    }

    public onBtnClose() {
        G_UserData.getHeadFrame().clearRedPointList();
        G_SignalManager.dispatch(SignalConst.EVENT_RED_POINT_UPDATE, FunctionConst.FUNC_HEAD_FRAME);
        this.close();
    }

    public onExit() {
    }
}