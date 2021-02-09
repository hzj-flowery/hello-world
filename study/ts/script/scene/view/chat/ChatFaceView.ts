const {ccclass, property} = cc._decorator;

import CommonPageViewIndicator from '../../../ui/component/CommonPageViewIndicator'
import ViewBase from '../../ViewBase';
import { G_ResolutionManager } from '../../../init';
import UIHelper from '../../../utils/UIHelper';
import { handler } from '../../../utils/handler';
import { ChatConst } from '../../../const/ChatConst';
import { table } from '../../../utils/table';
import ChatFacePageNode from './ChatFacePageNode';

@ccclass
export default class ChatFaceView extends ViewBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelTouch: cc.Node = null;

   @property({
       type: cc.Node,
       visible: true
   })
   _panelDesign: cc.Node = null;

   @property({
       type: cc.PageView,
       visible: true
   })
   _pageView: cc.PageView = null;

   @property({
       type: CommonPageViewIndicator,
       visible: true
   })
   _commonPageViewIndicator: CommonPageViewIndicator = null;


    _listDatas: any[];


    ctor() {
        this._listDatas = [];
        // var resource = {
        //     file: Path.getCSB('ChatFaceView', 'chat'),
        //     size: G_ResolutionManager.getDesignSize(),
        //     binding: {
        //         _panelTouch: {
        //             events: [{
        //                     event: 'touch',
        //                     method: '_onClickOutSize'
        //                 }]
        //         }
        //     }
        // };
        this.node.setContentSize(G_ResolutionManager.getBangDesignCCSize());
        UIHelper.addClickEventListenerEx(this._panelTouch, handler(this,this._onClickOutSize))
    }
    onCreate() {
        var size = this._pageView.node.getContentSize();
        this._pageView.inertia = false;
        this.ctor();
    }
    updateUI() {
    }
    _onInit() {
    }
    onEnter() {
        this._refreshListData();
    }
    onExit() {
    }
    _getListDatas() {
        return this._listDatas;
    }
    _refreshPageView(pageView:cc.PageView, itemList) {
        var pageNum = Math.ceil(itemList.length / ChatFacePageNode.FACE_NUM);
        for (var k = 1; k<=pageNum; k++) {
            var root = new cc.Node();
            var node = root.addComponent(ChatFacePageNode);
            node.ctor(pageView.node);
            node.updateUI(itemList, k);
            pageView.addPage(node.node);
        }
        //this._commonPageViewIndicator.refreshPageData(this._pageView, pageNum, 0, 14);
    }
    _onItemSelected(item, index) {
    }
    _refreshListData() {
        var listViewData = this._makeFaceList();
        this._listDatas = listViewData;
        this._refreshPageView(this._pageView, listViewData);
    }
    _makeFaceList() {
        var faceList = [];
        for (var k = 1; k<=ChatConst.MAX_FACE_NUM; k++) {
            table.insert(faceList, k);
        }
        return faceList;
    }
    _onClickOutSize() {
        this.node.active = (false);
    }

}
