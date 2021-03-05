const {ccclass, property} = cc._decorator;

import CommonDesValue from './CommonDesValue'
import { Colors } from '../../init';
import { TextHelper } from '../../utils/TextHelper';

var EXPORTED_METHODS = [
    'updateUI',
    'getContentSize'
];
var LINE2HEIGHT = {
    1: 66,
    2: 100
};
var LINE2POSY = {
    1: 85,
    2: 55,
    3: 25
};

@ccclass
export default class CommonMasterInfoNode extends cc.Component {

   @property({
       type: cc.Node,
       visible: true
   })
   _panelBg: cc.Node = null;

   @property({
       type: cc.Label,
       visible: true
   })
   _textName: cc.Label = null;

   @property({
       type: CommonDesValue,
       visible: true
   })
   _fileNodeAttr1: CommonDesValue = null;

   @property({
       type: CommonDesValue,
       visible: true
   })
   _fileNodeAttr2: CommonDesValue = null;

   @property({
       type: CommonDesValue,
       visible: true
   })
   _fileNodeAttr3: CommonDesValue = null;

   @property({
       type: CommonDesValue,
       visible: true
   })
   _fileNodeAttr4: CommonDesValue = null;

    private isLoader:boolean;

    _init() {
        if(this.isLoader){
            return
        }
        this.isLoader = true;
        for (var i = 1; i<=4; i++) {
            this['_fileNodeAttr' + i].setFontSize(20);
            this['_fileNodeAttr' + i].setDesColor(Colors.BRIGHT_BG_GREEN);
            this['_fileNodeAttr' + i].setValueColor(Colors.BRIGHT_BG_GREEN);
        }
    }
    updateUI(title, attrInfo) {
        this._init();
        this._textName.string = (title);
        var desInfo = TextHelper.getAttrInfoBySort(attrInfo);
        for (var i = 1; i<=4; i++) {
            var info = desInfo[i-1];
            if (info) {
                var [name, value] = TextHelper.getAttrBasicText(info.id, info.value);
                name = TextHelper.expandTextByLen(name, 4);
                this['_fileNodeAttr' + i].updateUI(name, '+' + value);
                this['_fileNodeAttr' + i].setVisible(true);
            } else {
                this['_fileNodeAttr' + i].setVisible(false);
            }
        }
        var lineNum = Math.ceil(desInfo.length / 2);
        this._formatLayout(lineNum);
        return lineNum;
    }
    _formatLayout(lineNum) {
        var size = this._panelBg.getContentSize();
        var height = size.height;
        if (lineNum) {
            height = LINE2HEIGHT[lineNum] || height;
            var NamePosY = LINE2POSY[3 - lineNum];
            if (NamePosY) {
                this._textName.node.y = (NamePosY);
            }
            var count = lineNum * 2;
            for (var i = 1; i<=count; i++) {
                var lineIndex = Math.ceil(i / 2);
                var temp = 3 - lineNum;
                var attrPosY = LINE2POSY[lineIndex + temp];
                this['_fileNodeAttr' + i].node.y = (attrPosY);
            }
        }
        this._panelBg.setContentSize(cc.size(size.width, height));
    }
    getContentSize() {
        var size = this._panelBg.getContentSize();
        return size;
    }

}
