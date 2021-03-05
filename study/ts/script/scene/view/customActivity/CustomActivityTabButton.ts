import CommonTabGroupScrollVertical from "../../../ui/component/CommonTabGroupScrollVertical";
import CommonTabGroup from "../../../ui/component/CommonTabGroup";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CustomActivityTabButton extends cc.Component {
    @property({
        type: cc.Node,
        visible: true
    })
    _scrollViewTab: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _content: cc.Node = null;

    @property({
        type: CommonTabGroup,
        visible: true
    })
    _commonTabGroup: CommonTabGroup = null;


    setTabIndex(index) {
        return this._commonTabGroup.setTabIndex(index);
    }
    getTabCount() {
        return this._commonTabGroup.getTabCount();
    }

    setCustomColor(colorArr) {
        return this._commonTabGroup.setCustomColor(colorArr);
    }
    recreateTabs(param, containerSize?: cc.Size) {
        if (containerSize) {
            this._content.setContentSize(containerSize)
        }
        this._commonTabGroup.recreateTabs(param)
    }

    setRedPointByTabIndex(tabIndex, show, posPercent?) {
        this._commonTabGroup.setRedPointByTabIndex(tabIndex, show, posPercent);
    }
    setImageTipByTabIndex(tabIndex, show, posPercent, texture) {
        this._commonTabGroup.setImageTipByTabIndex(tabIndex, show, posPercent, texture);
    }
    getTabItem(index) {
        return this._commonTabGroup.getTabItem(index);
    }
    playEnterEffect(movingName, interval) {
        this._commonTabGroup.playEnterEffect(movingName, interval);
    }
}