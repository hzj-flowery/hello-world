const { ccclass, property } = cc._decorator;

import CommonTabGroup from './CommonTabGroup';
import PetShow from '../../scene/view/petMerge/PetShow';

@ccclass
export default class CommonTabGroupScrollVertical extends cc.Component {

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
        var scrollView:cc.ScrollView = this._scrollViewTab.getComponent(cc.ScrollView);
        if(scrollView != null){
            var percent = (index+0.5) / this._commonTabGroup.node.childrenCount;
            if(index == 0)
            {
                percent = 0;
            }
            else if(index == this._commonTabGroup.node.childrenCount - 1)
            {
                percent = 1;
            }
            if(percent < 0){
                percent = 0;
            }
            if(percent > 1){
                percent = 1;
            }
            scrollView.scrollToPercentVertical(1-percent);
        }

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