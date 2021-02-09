import CommonListItem from "../component/CommonListItem";
import { TypeConvertHelper } from "../../utils/TypeConvertHelper";
import { Lang } from "../../lang/Lang";
import CommonIconTemplate from "../component/CommonIconTemplate";
import CommonButtonLevel1Highlight from "../component/CommonButtonLevel1Highlight";
import { handler } from "../../utils/handler";
const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupTransformConfirmCell extends CommonListItem{
    @property({
        type: cc.Node,
        visible: true
    })
    _resourceNode: cc.Node = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName1: cc.Label = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textName2: cc.Label = null;
    
    @property({
        type: CommonButtonLevel1Highlight,
        visible: true
    })
    _buttonOk: CommonButtonLevel1Highlight = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon1: CommonIconTemplate = null;

    @property({
        type: CommonIconTemplate,
        visible: true
    })
    _icon2: CommonIconTemplate = null;
    
    
    // ctor: function () {
    //     var resource = {
    //         file: Path.getCSB('PopupTransformConfirmCell', 'common'),
    //         binding: {
    //             _buttonOk: {
    //                 events: [{
    //                         event: 'touch',
    //                         method: '_onClickButtonOk'
    //                     }]
    //             }
    //         }
    //     };
    // },
    onCreate(){
        var size = this._resourceNode.getContentSize();
        this.node.setContentSize(size.width, size.height);
        this._buttonOk.setString(Lang.get('common_btn_exchange'));
        this._buttonOk.addTouchEventListenerEx(handler(this,this._onClickButtonOk),false);
    }

    updateUI(index,data):void{
       this.updateData(data[0]);
    }
    updateData(info) {
        var data1 = info.data1;
        var data2 = info.data2;
        var shopId = info.shopId;
        var goodId = info.goodId;
        var param1 = TypeConvertHelper.convert(data1.type, data1.value);
        var param2 = TypeConvertHelper.convert(data2.type, data2.value);
        this._icon1.initUI(data1.type, data1.value, data1.size);
        this._textName1.string = (param1.name);
        this._textName1.node.color = (param1.icon_color);
        this._icon2.initUI(data2.type, data2.value, data2.size);
        this._textName2.string = (param2.name);
        this._textName2.node.color = (param2.icon_color);
    }
    _onClickButtonOk() {
        this.dispatchCustomCallback(1);
    }
}