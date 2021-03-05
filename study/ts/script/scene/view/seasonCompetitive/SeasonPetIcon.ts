const { ccclass, property } = cc._decorator;

import CommonHeroStarBig from '../../../ui/component/CommonHeroStarBig'

import CommonIconTemplate from '../../../ui/component/CommonIconTemplate'
import { handler } from '../../../utils/handler';
import { TypeConvertHelper } from '../../../utils/TypeConvertHelper';
import { G_UserData } from '../../../init';

@ccclass
export default class SeasonPetIcon extends cc.Component {

    @property({ type: cc.Node, visible: true })
    _resource: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _item1: cc.Node = null;

    @property({ type: CommonIconTemplate, visible: true })
    _fileNode1: CommonIconTemplate = null;

    @property({ type: cc.Sprite, visible: true })
    _imageSelected1: cc.Sprite = null;

    @property({ type: cc.Sprite, visible: true })
    _imageTop1: cc.Sprite = null;

    @property({ type: CommonHeroStarBig, visible: true })
    _nodeStar1: CommonHeroStarBig = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBan1: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _panelTouch1: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _textName1: cc.Label = null;

    private _data;
    private _customCallback;

    public onLoad() {
        this.node.setContentSize(this._resource.getContentSize());
        this._panelTouch1.on(cc.Node.EventType.TOUCH_END, handler(this, this._onPanelTouch));
    }

    private _onPanelTouch(sender: cc.Event.EventTouch, state) {
        var moveOffsetX = Math.abs(sender.getLocation().x - sender.getStartLocation().x);
        var moveOffsetY = Math.abs(sender.getLocation().y - sender.getStartLocation().y);
        if (moveOffsetX < 20 && moveOffsetY < 20) {
            var baseId = this._data.id;
            if (this._customCallback) {
                this._customCallback(baseId);
            }
        }
    }

    public updateUI(cellData) {
        this._item1.active = false;
        this._imageSelected1.node.active = false;
        this._data = cellData;
        if (this._data == null) {
            return;
        }
        this._item1.active = true;
        this._fileNode1.node.active = true;
        this._fileNode1.unInitUI();
        this._fileNode1.initUI(TypeConvertHelper.TYPE_PET, this._data.id);
        this._fileNode1.removeLightEffect();
        this._fileNode1.setTouchEnabled(false);
        this._fileNode1.setIconMask(this._data.isBaned);
        this._imageTop1.node.active = this._data.isExist;
        this._imageBan1.node.active = this._data.isBaned;
        this._nodeStar1.setCount(G_UserData.getSeasonSport().getSeasonPetsStar());
        var petParam = this._fileNode1.getItemParams();
        this._textName1.string = petParam.name;
        this._textName1.node.color = (petParam.icon_color);
    }

    public setCustomCallback(customCallback: Function) {
        this._customCallback = customCallback;
    }
}