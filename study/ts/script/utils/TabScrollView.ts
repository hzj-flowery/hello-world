import { assert } from "./GlobleFunc";
import CommonScrollView from "../ui/component/CommonScrollView";

var param = {
    template: null,
    updateFunc: null,
    selectFunc: null,
    touchFunc: null,
    scrollFunc: null
};
export default class TabScrollView {
    constructor(listView:CommonScrollView, scrollParam, tabIndex?) {
        this._listViewList = this._listViewList || [];
        this._setTemplate(listView, scrollParam.template, scrollParam.updateFunc, scrollParam.selectFunc, scrollParam.touchFunc, scrollParam.scrollFunc, tabIndex);
    }
    private _listViewList:Array<CommonScrollView>;
    private _srcListView:CommonScrollView;//传入的节点
    private _template;
    private _updateFunc;
    private _selectFunc;
    private _touchFunc;
    private _scrollFunc;

    hideAllView(...vars) {
        for (var i in this._listViewList) {
            var view = this._listViewList[i];
            view.node.active = false;
        }
    }
    updateListViewEx(tabIndex, dataCount, scrollParam?) {
        tabIndex = tabIndex || 1;
        var listView = this._getListView(tabIndex, scrollParam, false);
        if (dataCount && dataCount > 0) {
            listView.resize(dataCount);
            listView.node.active = true;
        } else {
            listView.resize(0);
            listView.node.active = true;
        }
    }
    updateListView(tabIndex, dataCount, scrollParam?) {
        tabIndex = tabIndex || 1;
        var listView = this._getListView(tabIndex, scrollParam, true);
        if (dataCount && dataCount > 0) {
            listView.resize(dataCount);
            listView.node.active = true;
        } else {
            listView.resize(0);
            listView.node.active = true;
        }
    }
    updateTemplate(template) {
        this._template = template;
    }
    _setTemplate(listView, template, updateFunc, selectFunc, touchFunc, scrollFunc, tabIndex) {
        this._srcListView = listView;
      //assert((this._srcListView!=null, 'init scrollView is nil');
        this._template = template;
      //assert((this._template, 'init template is nil');
        this._listViewList.push(listView);
      //assert((this._listViewList!=null, 'init listViewList is nil');
        this._updateFunc = updateFunc;
        this._selectFunc = selectFunc;
        this._touchFunc = touchFunc;
        this._scrollFunc = scrollFunc;
        this._setTemplateEx(listView);
    }
    _setTemplateEx(listView:CommonScrollView, scrollParam?) {
        if (scrollParam) {
            listView.setTemplate(scrollParam.template);
            listView.setCallback(scrollParam.updateFunc, scrollParam.selectFunc, scrollParam.scrollFunc);
            listView.setCustomCallback(scrollParam.touchFunc);
        } else {
            listView.setTemplate(this._template);
            listView.setCallback(this._updateFunc, this._selectFunc, this._scrollFunc);
            listView.setCustomCallback(this._touchFunc);
        }
    }
    _createListView(scrollParam) {
        var root = this._srcListView.node.getParent();
        if (root == null) {
            return;
        }
        var listView = this._srcListView;
        this._setTemplateEx(listView, scrollParam);
        return listView;
    }
    getListView(index) {
        if(index >= this._listViewList.length){
            return null;
        }
        var listView = this._listViewList[index-1];
        return listView;
    }
    stopAllScroll() {
        for (var i in this._listViewList) {
            var view = this._listViewList[i];
            view.stopAutoScroll();
        }
    }
    _getListView(index, scrollParam, stopScroll) {
        this._listViewList = this._listViewList || [];
        for (var i in this._listViewList) {
            var view = this._listViewList[i];
            view.node.active = false;
            if (stopScroll) {
                view.stopAutoScroll();
            }
        }
        var listView;
        if(index >= this._listViewList.length)
        {
            listView = this._createListView(scrollParam);
            this._listViewList[index-1] = listView;
        }
        else
        {
            listView = this._listViewList[index-1];
        }
        return listView;
    }
}
