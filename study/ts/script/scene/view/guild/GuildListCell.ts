import ListViewCellBase from "../../../ui/ListViewCellBase";
import { UserDataHelper } from "../../../utils/data/UserDataHelper";
import UIHelper from "../../../utils/UIHelper";
import { Path } from "../../../utils/Path";
import { GuildDataHelper } from "../../../utils/data/GuildDataHelper";
import CommonListItem from "../../../ui/component/CommonListItem";
import { G_UserData, G_Prompt } from "../../../init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuildListCell extends CommonListItem {

    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Sprite,
        visible: true
    })
    _panel: cc.Sprite = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _captain: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _number: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _level: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true,
        override: true
    })
    _name: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _imageApply: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFull: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textFight: cc.Label = null;
    _index: number;
    _select: number = 0;


    onCreate() {
        this._name = (this._resourceNode.getChildByName("_name") as cc.Node).getComponent(cc.Label);
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }

    updateUI(itemId, data): void {
        this.updateData(data, itemId, this._select);
    }
    
    updateData(data, index, selectIndex) {
        this._select = selectIndex;
        if (data) {
            this._index = index;
            var name:string = data.getName();
            var level = data.getLevel();
            var number = data.getMember_num();
            var maxNumber = GuildDataHelper.getGuildMaxMember(level);
            var leaderName:string = data.getLeader_name();

            if(leaderName.length>3)
            {
                
               leaderName = leaderName.substring(0,2);
            }
            if(name.length>5)
            {
               name =name.substring(0,4);
            }
            var isFull = number >= maxNumber;
            this._name.string = (name);
            this._level.string = (level);
            this._number.string = (number + ('/' + maxNumber));
            this._captain.string = (leaderName);
            var hasApplication = data.isHas_application();
            this._imageApply.node.active = (hasApplication);
            this._textFull.node.active = (isFull && !hasApplication);
            this.setSelected(index == selectIndex);
            var tar =parseInt(data.getAuto_jion_power())/10000;
            var target = Math.floor(tar);
            this._textFight.string = target +"万";
        }
    }
    setSelected(selected) {
        if (selected) {
            this._panel.node.active = (true);
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list03'));
            // this._panel.setScale9Enabled(true);
            // this._panel.setCapInsets(cc.rect(1, 29, 1, 1));
        } else if ((this._index + 1) % 2 == 0) {
            this._panel.node.active = (true);
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list02b'));
            // this._panel.setScale9Enabled(true);
            // this._panel.setCapInsets(cc.rect(1, 1, 1, 1));
        } else {
            UIHelper.loadTexture(this._panel, Path.getUICommon('img_com_board_list02a'));
            // this._panel.setScale9Enabled(true);
            // this._panel.setCapInsets(cc.rect(1, 1, 1, 1));
        }
    }

    onListClick() {
        this.dispatchCustomCallback(this);
    }

}