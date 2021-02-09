import CommonHeroAvatar from "../../../ui/component/CommonHeroAvatar";
import { handler } from "../../../utils/handler";
import { Lang } from "../../../lang/Lang";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HeroTransformNode extends cc.Component {
    @property({
        type: CommonHeroAvatar,
        visible: true
    })
    _fileNodeHero: CommonHeroAvatar = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textTip: cc.Label = null;
    @property({
        type: cc.Button,
        visible: true
    })
    _buttonAdd: cc.Button = null;
    @property({
        type: cc.Sprite,
        visible: true
    })
    _imageNum: cc.Sprite = null;
    @property({
        type: cc.Label,
        visible: true
    })
    _textNum: cc.Label = null;

    _type: any;
    _callback: any;
    _heroId: number;
    _limitLevel: number;
    _heroCount: number;
    _lock: boolean;
    ctor(type, callback) {
        this._type = type;
        this._callback = callback;
        this._initData();
        this._initView();
    }
    _initData() {
        this._heroId = 0;
        this._limitLevel = 0;
        this._heroCount = 0;
        this._lock = false;
    }
    _initView() {
        this._fileNodeHero.init();
        this._fileNodeHero.setTouchEnabled(true);
        this._fileNodeHero.setCallBack(handler(this, this._onClickHero));
        this._textTip.string = (Lang.get('hero_transform_choose_tip' + this._type));
    }
    _resetView() {
        this._fileNodeHero.node.opacity = (255);
        this._fileNodeHero.setVisible(false);
        this._textTip.node.active = (false);
        this._buttonAdd.node.active = (false);
        this._imageNum.node.active = (false);
    }
    updateUI() {
        this._resetView();
        if (this._lock) {
            return;
        }
        if (this._heroId > 0) {
            this._fileNodeHero.updateUI(this._heroId, null, null, this._limitLevel);
            this._fileNodeHero.setVisible(true);
        } else {
            this._buttonAdd.node.active = (true);
            this._textTip.node.active = (true);
        }
        if (this._heroCount > 1) {
            this._textNum.string = (Lang.get('hero_transform_hero_count', { count: this._heroCount }));
            this._imageNum.node.active = (true);
        }
    }
    setLock(lock) {
        this._lock = lock;
    }
    setHeroId(heroId, limitLevel) {
        this._heroId = heroId;
        this._limitLevel = limitLevel;
    }
    getHeroId() {
        return this._heroId;
    }
    setHeroCount(count) {
        this._heroCount = count;
    }
    getHeroCount() {
        return this._heroCount;
    }
    onButtonAddClicked() {
        if (this._callback) {
            this._callback();
        }
    }
    _onClickHero() {
        if (this._callback) {
            this._callback();
        }
    }
    setEnabled(enable) {
        this._fileNodeHero.setTouchEnabled(enable);
        this._buttonAdd.enabled = (enable);
    }
    getHeroNode() {
        return this._fileNodeHero;
    }
}