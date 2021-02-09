const {ccclass, property} = cc._decorator;

import CommonRewardLogItem from '../../../ui/component/CommonRewardLogItem'
import ListViewCellBase from '../../../ui/ListViewCellBase';
import { G_UserData, Colors } from '../../../init';

@ccclass
export default class BonusPoolAwardCell extends ListViewCellBase {

    @property({
        type: cc.Node,
        visible: true
    })
    _resource: cc.Node = null;

    @property({
        type: CommonRewardLogItem,
        visible: true
    })
    _fileNode1: CommonRewardLogItem = null;

    @property({
        type: CommonRewardLogItem,
        visible: true
    })
    _fileNode2: CommonRewardLogItem = null;

    _size: cc.Size;


    onInit(){
        this._size = this._resource.getContentSize();
        this.node.setContentSize(this._size);
    }
    onCreate() {
        this._resource.active = (false);
    }
    updateUI(cellData:any[]) {
        for (var index = 1; index<=2; index++) {
            this['_fileNode' + index].node.active = (false);
        }
        if (!cellData || cellData.length <= 0) {
            return;
        }
        this._resource.active = (true);
        for (let itemIndex=1; itemIndex<=cellData.length; itemIndex++) {
            var itemData = cellData[itemIndex-1];
            this.updateItem(itemIndex, itemData);
        }
    }
    updateItem(index, data) {
        this['_fileNode' + index].node.active = (true);
        this['_fileNode' + index].setServerName(data.svr_name);
        this['_fileNode' + index].setUserName(data.user_name, data.officer_level);
        if (data.user_id == G_UserData.getBase().getId()) {
            this['_fileNode' + index].setUserNameColor(Colors.getATypeGreen());
            this['_fileNode' + index].setServerNameColor(Colors.getATypeGreen());
        }
    }
}
