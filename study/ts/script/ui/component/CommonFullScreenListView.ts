const { ccclass, property } = cc._decorator;

import CommonFullScreen from './CommonFullScreen'

@ccclass
export default class CommonFullScreenListView extends cc.Component {

    @property({
        type: CommonFullScreen,
        visible: true
    })
    _fileNode_1: CommonFullScreen = null;

   

    setTitle(title) {
        this._fileNode_1.setTitle(title);
    }
    setPrefixCountText(txt) {
        this._fileNode_1.setPrefixCountText(txt);
    }
    setPrefixCountColor(color) {
        this._fileNode_1.setPrefixCountColor(color);
    }
    setCount(count) {
        this._fileNode_1.setCount(count);
    }
    showCount(show) {
        this._fileNode_1.showCount(show);
    }
    setCountColor(color) {
        this._fileNode_1.setCountColor(color);
    }
    setCountSize(size) {
        this._fileNode_1.setCountSize(size);
    }
    showCountPrefix(bShow) {
        this._fileNode_1.showCountPrefix(bShow);
    }



}