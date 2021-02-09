import ViewBase from "../../ViewBase";
import { G_UserData, G_SignalManager, G_SpineManager, G_EffectGfxMgr, G_AudioManager, G_SceneManager } from "../../../init";
import { SignalConst } from "../../../const/SignalConst";
import { Path } from "../../../utils/Path";
import { AudioConst } from "../../../const/AudioConst";
import { TopBarStyleConst } from "../../../const/TopBarStyleConst";
import CommonTopbarBase from "../../../ui/component/CommonTopbarBase";
const {ccclass, property} = cc._decorator;
@ccclass
export default class GachaGoldenHeroChooseZhenyinView extends ViewBase{

    @property({
        type: CommonTopbarBase,
        visible: true
    })
    _topBar: CommonTopbarBase = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectChoose: cc.Node = null;

    @property({
        type: cc.Node,
        visible: true
    })
    _nodeEffectLoop: cc.Node = null;

    static waitEnterMsg(callBack) {
        function onMsgCallBack(id, message) {
            callBack();
        }
        G_UserData.getGachaGoldenHero().c2sGachaEntry();
        var signal = G_SignalManager.add(SignalConst.EVENT_GACHA_GOLDENHERO_ENTRY, onMsgCallBack);
        G_SpineManager.loadSpine(Path.getEffectSpine('jinjiangzhenying'));
        return signal;
    }
    
    private _currentChooseZhenyin:number;
    private _enterEffectIsEnd:boolean;
    private _zhenyinEffectIsBegin:boolean;
    ctor(heroId) {
        this._enterEffectIsEnd = false;
        this._zhenyinEffectIsBegin = false;
        this._currentChooseZhenyin = 0;
    }
    onCreate() {
        this.setSceneSize(); 
        this._enterEffectIsEnd = false;
        this._zhenyinEffectIsBegin = false;
        this._currentChooseZhenyin = 0;
        this._playChooseZhenYinEffect();
        
    }
    onEnter() {
        this._topBar.setImageTitle('txt_sys_jianlongzaitian');
        this._topBar.updateUI(TopBarStyleConst.STYLE_GOLD_GACHA, true);
    }
    onExit() {
    }
    onChooseWeiCallback() {
        if (this._enterEffectIsEnd == false || this._zhenyinEffectIsBegin == true) {
            return;
        }
        this._playZhenyinEffect(1);
    }
    onChooseShuCallback() {
        if (this._enterEffectIsEnd == false || this._zhenyinEffectIsBegin == true) {
            return;
        }
        this._playZhenyinEffect(2);
    }
    onChooseWuCallback() {
        if (this._enterEffectIsEnd == false || this._zhenyinEffectIsBegin == true) {
            return;
        }
        this._playZhenyinEffect(3);
    }
    onChooseQunCallback() {
        if (this._enterEffectIsEnd == false || this._zhenyinEffectIsBegin == true) {
            return;
        }
        this._playZhenyinEffect(4);
    }
    _playChooseZhenYinEffect() {
        var eventFunction = function (event) {
            if (event == 'finish') {
                this._enterEffectIsEnd = true;
                this._playLoopEffect();
            }
        }.bind(this)
        G_AudioManager.playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN);
        this._nodeEffectChoose.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectChoose, 'moving_jinjiangzhanmu_zhenyingxuanzecome', null, eventFunction, false);
    }
    _playLoopEffect() {
        this._nodeEffectLoop.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectLoop, 'moving_jinjiangzhanmu_zhenyingxuanzeidle', null, null, false);
    }
    _playZhenyinEffect(zhenyinIndex) {
        this._zhenyinEffectIsBegin = true;
        this._currentChooseZhenyin = zhenyinIndex;
        G_AudioManager.playSoundWithId(AudioConst.SOUND_GACHA_GOLDEN_OPEN1);
        var eventFunction = function (event) {
            if (event == 'finish') {
                G_SceneManager.replaceScene('gachaGoldHero', this._currentChooseZhenyin);
            }
        }.bind(this)
        var randomIndex = Math.random()<0.5?1:2;
        console.log('randomIndex ',randomIndex);
        var soundName = '';
        var movingJsonName = '';
        if (this._currentChooseZhenyin == 1) {
            movingJsonName = 'moving_jinjiangzhanmu_zhenyingxuanzewei';
            soundName = 'SOUND_WEI' + randomIndex;
        } else if (this._currentChooseZhenyin == 2) {
            movingJsonName = 'moving_jinjiangzhanmu_zhenyingxuanzeshu';
            soundName = 'SOUND_SHU' + randomIndex;
        } else if (this._currentChooseZhenyin == 3) {
            movingJsonName = 'moving_jinjiangzhanmu_zhenyingxuanzewu';
            soundName = 'SOUND_WU' + randomIndex;
        } else if (this._currentChooseZhenyin == 4) {
            movingJsonName = 'moving_jinjiangzhanmu_zhenyingxuanzequn';
            soundName = 'SOUND_QUN' + randomIndex;
        }
        G_AudioManager.playSoundWithId(AudioConst[soundName]);
        this._nodeEffectChoose.removeAllChildren();
        this._nodeEffectLoop.removeAllChildren();
        G_EffectGfxMgr.createPlayMovingGfx(this._nodeEffectChoose, movingJsonName,null, eventFunction, false);
    }

}