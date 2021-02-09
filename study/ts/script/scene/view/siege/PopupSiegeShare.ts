const { ccclass, property } = cc._decorator;

import CommonButtonMediumHighlight from '../../../ui/component/CommonButtonMediumHighlight'
import CommonButtonLevel2Normal from '../../../ui/component/CommonButtonLevel2Normal'
import CommonPopupNotice from '../../../ui/component/CommonPopupNotice'

@ccclass
export default class PopupSiegeShare extends cc.Component {

    @property({
        type: cc.Node,
        visible: true
    })
    _panelBase: cc.Node = null;

    @property({
        type: CommonPopupNotice,
        visible: true
    })
    _noticeBG: CommonPopupNotice = null;

    @property({
        type: cc.Label,
        visible: true
    })
    _textNotice: cc.Label = null;

    @property({
        type: CommonButtonLevel2Normal,
        visible: true
    })
    _btnCancel: CommonButtonLevel2Normal = null;

    @property({
        type: CommonButtonMediumHighlight,
        visible: true
    })
    _btnShare: CommonButtonMediumHighlight = null;

    
}