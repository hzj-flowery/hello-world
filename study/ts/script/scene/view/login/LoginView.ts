import { AudioConst } from "../../../const/AudioConst";
import { SignalConst } from "../../../const/SignalConst";
import { AgreementSetting } from "../../../data/AgreementSetting";
import { G_AudioManager, G_GameAgent, G_SceneManager, G_ServiceManager, G_SignalManager, G_TouchEffect, G_UserData } from "../../../init";
import { Lang } from "../../../lang/Lang";
import ALDStatistics from "../../../utils/ALDStatistics";
import { handler } from "../../../utils/handler";
import { Path } from "../../../utils/Path";
import ViewBase from "../../ViewBase";
import { MainUIHelper } from "../main/MainUIHelper";
import StartView from "./StartView";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginView extends ViewBase {

    @property({ type: cc.Node, visible: true })
    _panelDesign: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelBG: cc.Node = null;

    @property({ type: cc.Label, visible: true })
    _labelVersion: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textCopyrightInfo1: cc.Label = null;

    @property({ type: cc.Label, visible: true })
    _textCopyrightInfo2: cc.Label = null;

    @property({ type: cc.Node, visible: true })
    _nodeCopyrightInfo3: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeAgreementContent: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _richNodeAgreement: cc.Node = null;

    @property({ type: cc.Toggle, visible: true })
    _checkBoxPrivacy: cc.Toggle = null;

    @property({ type: cc.Toggle, visible: true })
    _checkBoxService: cc.Toggle = null;

    @property({ type: cc.Node, visible: true })
    _panelPrivacyTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelServiceTouch: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelLoading: cc.Node = null;

    @property({ type: cc.Sprite, visible: true })
    _imageBg: cc.Sprite = null;

    @property({ type: cc.Node, visible: true })
    _effectNode: cc.Node = null;

    @property({ type: StartView, visible: true })
    _startView: StartView = null;

    private _signalSdkVersion;
    private _signalVersionUpdate;
    private _signalAgreeSecret;

    // public preloadRes(callBack: Function, params) {
    //     let config = MainUIHelper.getCurrShowSceneConfig();
    //     this.preloadEffectList = [
    //         {
    //             type: EffectGfxType.MovingGfx,
    //             name: config.effect
    //         }
    //     ];
    //     super.preloadRes(callBack, params);
    // }

    protected onCreate() {
        // console.log("loginview");
        ALDStatistics.instance.aldSendEvent('进入登录界面', null, true);
        this.setSceneSize();

        //this._textCopyrightInfo1.string = Lang.get("login_copyright_info_1");
        //this._textCopyrightInfo2.string = Lang.get("login_copyright_info_2");
        this._nodeAgreementContent.active = true;

        AgreementSetting.saveAgreementIsCheck(true, AgreementSetting.getPrivacyWords());
        AgreementSetting.saveAgreementIsCheck(true, 'check');
        this._checkBoxService.isChecked = AgreementSetting.isAgreementCheck("check");
        this._checkBoxPrivacy.isChecked = AgreementSetting.isAgreementCheck(AgreementSetting.getPrivacyWords());

        this._signalSdkVersion = G_SignalManager.add(SignalConst.EVENT_SDK_CHECKVERSION, handler(this, this._onInitSDK));
        this._signalVersionUpdate = G_SignalManager.add(SignalConst.EVENT_LOGIN_VERSION_UPDATE, handler(this, this._onRefreshConfig));
        this._signalAgreeSecret = G_SignalManager.add(SignalConst.EVENT_AGREE_SECRET, handler(this, this._onRefreshCheckBoxService));
    }

    public onEnter() {

        G_UserData.getUserSetting().updateMusic();

        G_TouchEffect.setStart();
        G_AudioManager.playMusicWithId(AudioConst.MUSIC_LOGIN_CREATE);
        G_ServiceManager.stop();

        this._startView.showView();

        let config = MainUIHelper.getCurrShowSceneConfig();

        // let background: string = (config.background as string).split(".")[0];
        let background: string = (config.load as string).split(".")[0];
        cc.resources.load(background, cc.SpriteFrame, (err, res: any) => {
            this._imageBg.spriteFrame = res;
        });
       // this.initSDK();
    }

    protected onExit() {
        this._signalSdkVersion.remove();
        this._signalSdkVersion = null;
        this._signalVersionUpdate.remove();
        this._signalVersionUpdate = null;
        this._signalAgreeSecret.remove();
        this._signalAgreeSecret = null;
    }

    public initSDK() {
        if (G_GameAgent.isInit()) {
            G_GameAgent.openLoginPlatform();
        }
        else {
            G_GameAgent.initSDK();
        }
    }

    private _onInitSDK() {
        G_GameAgent.openLoginPlatform();
    }

    private _onRefreshConfig() {

    }

    private _onRefreshCheckBoxService() {
        this._checkBoxPrivacy.isChecked = AgreementSetting.isAgreementCheck(AgreementSetting.getPrivacyWords());
        this._checkBoxService.isChecked = AgreementSetting.isAgreementCheck("check");
    }

    public onClickCheckBoxService() {
        AgreementSetting.saveAgreementIsCheck(this._checkBoxService.isChecked, "check");
    }

    public onClickCheckBoxPrivacy() {
        AgreementSetting.saveAgreementIsCheck(this._checkBoxPrivacy.isChecked, AgreementSetting.getPrivacyWords());
    }

    public onClickServiceAgreement() {
        G_SceneManager.openPopup(Path.getPrefab("PopupSecretView", "login"));
    }

    public onClickPrivacyAgreement() {
        G_SceneManager.openPopup(Path.getPrefab("PopupSecretView", "login"));
    }
}