import { Colors } from "../../../init";
import CommonListItem from "../../../ui/component/CommonListItem";
import ViewBase from "../../ViewBase";
import { GrainCarDataHelper } from "./GrainCarDataHelper";

const { ccclass, property } = cc._decorator;
@ccclass
export default class  PopupGrainCarGuildSelectorCell extends CommonListItem {
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _guildName: cc.Label = null;

    

    private _data;
    ctor() {
    
    }
    onCreate() {
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
    }
    update(data) {
        this._data = data;
        this._guildName.string = (data.name);
        var isMyGuild = GrainCarDataHelper.isMyGuild(data.id);
        this._guildName.node.color = (isMyGuild && Colors.BRIGHT_BG_GREEN || Colors.BRIGHT_BG_RED);
    }
    _onPanelClick() {
        this.dispatchCustomCallback(this._data);
    }
};
