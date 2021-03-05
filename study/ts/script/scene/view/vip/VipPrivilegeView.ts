const {ccclass, property} = cc._decorator;

import CommonVipNode from '../../../ui/component/CommonVipNode'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import CommonCustomListViewEx from '../../../ui/component/CommonCustomListViewEx';
import VipPrivilegeCell from './VipPrivilegeCell';
import { Lang } from '../../../lang/Lang';
import { handler } from '../../../utils/handler';

@ccclass
export default class VipPrivilegeView extends ListViewCellBase {

   @property({
       type: cc.Node,
       visible: true
   })
   _resourceNode: cc.Node = null;

   @property({
       type: CommonCustomListViewEx,
       visible: true
   })
   _listViewTexts: CommonCustomListViewEx = null;

   @property({
       type: CommonVipNode,
       visible: true
   })
   _textVipDesc: CommonVipNode = null;

   @property({
       type: cc.Sprite,
       visible: true
   })
   _imgGiftLabel: cc.Sprite = null;

   @property(cc.Prefab)
   privilegeCell:cc.Prefab = null;

    _vipItemData: any;
    loadIndex:number = 0;
    scheduleHandler:any;
    privilegeList:any[];

    ctor() {

    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        //this._listViewTexts.setSwallowTouches(false);
    }
    onEnter() {
    }
    onExit() {
    }
    updateUI(vipItemData) {
        var vipLevel = vipItemData.getId();
        if (vipLevel < 10) {
            this._imgGiftLabel.node.x = (11);
        } else {
            this._imgGiftLabel.node.x = (27);
        }
        this._vipItemData = vipItemData;
        this._listViewTexts.clearAll();
        this._textVipDesc.setString(Lang.get('lang_vip_privilege_title_level', { level: vipLevel }));
        var privilegeList:any[] = vipItemData.getVipPrivilegeList();
        privilegeList.sort(function (a, b) {
            if (a.show != b.show) {
                if(a.show == 2){
                    return -1;
                }
                return 1;
            } else if (a.order != b.order) {
                return a.order - b.order;
            } else {
                return a.type - b.type;
            }
        }.bind(this));
        this.privilegeList = privilegeList;
        console.log("VipPrivilegeView updateUI vipLevel:"+vipLevel);
        // for (let i in privilegeList) {
        //     var value = privilegeList[i];
        //     var vipPrivilegeCell = cc.instantiate(this.privilegeCell).getComponent(VipPrivilegeCell);//new VipPrivilegeCell();
        //     if (value.show == 2) {
        //         vipPrivilegeCell.updateUI(value.name, value.description, true);
        //     } else {
        //         vipPrivilegeCell.updateUI(value.name, value.description, false);
        //     }
        //     this._listViewTexts.pushBackCustomItem(vipPrivilegeCell.node);
        // }
        this._listViewTexts.setTemplate(this.privilegeCell);
        this._listViewTexts.setCallback(handler(this,this.updateItem));
        
        if(this.scheduleHandler){
            this.unschedule(this.scheduleHandler);
            this.scheduleHandler = null;
        }
        this.loadIndex = 0;
        if(this.loadIndex == 0){
            this.scheduleHandler = handler(this,this.loadListView);
            this.schedule(this.scheduleHandler, 0.1);
        }
        this.loadListView();
    }
    updateItem(item,index){
        var value = this.privilegeList[index];
        if (value.show == 2) {
            item.updateUI(value.name, value.description, true);
        } else {
            item.updateUI(value.name, value.description, false);
        }
    }
    loadListView(){
        this.loadIndex++;
        if(this.loadIndex >= this.privilegeList.length){
            if(this.scheduleHandler){
                this.unschedule(this.scheduleHandler);
                this.scheduleHandler = null;
            }
            this.loadIndex = this.privilegeList.length;
        }
        this._listViewTexts.resize(this.loadIndex, 2, false);
    }

}
