import { MovieConst } from "../../const/MovieConst";
import CommonContinueNode from "../component/CommonContinueNode";
import { handler } from "../../utils/handler";
import { G_ResolutionManager, G_EffectGfxMgr, G_SignalManager } from "../../init";
import { Lang } from "../../lang/Lang";
import { SignalConst } from "../../const/SignalConst";
import PopupBase from "../PopupBase";
import { UTF8 } from "../../utils/UTF8";

const { ccclass, property } = cc._decorator;
@ccclass
export default class PopupMovieText extends PopupBase {

    @property({ type: cc.Node, visible: true })
    _panelbk: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _panelRoot: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeCreateRoleStart: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeLoginStart: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeLoginEnd: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeChapterStart: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _nodeChapterEnd: cc.Node = null;

    @property({ type: cc.Node, visible: true })
    _imageStart: cc.Node = null;

    @property({ type: CommonContinueNode, visible: true })
    _commonContinueNode: CommonContinueNode = null;

    private _movieType;
    private _callback;
    private _chapterNum;
    private _chapterName;
    private _chapterContent;

    private _playMoviveTextStr: string;
    private _playMoviveTextCurrTime: number;
    private _playMoviveTextTotalTime: number;
    private _playMoviveTextCallback: Function;
    private _playMoviveTextLabel: cc.Label;

    public init(movieType, callback) {
        this._movieType = movieType || MovieConst.TYPE_LOGIN_START;
        this._callback = callback;
        this._imageStart = null;
        this.setNotCreateShade(true);
    }

    public onCreate() {
        this._panelRoot.on(cc.Node.EventType.TOUCH_START, handler(this, this.onClickPanel));
        this._commonContinueNode.node.active = (false);
        this._nodeLoginStart.active = false;
        this._nodeLoginEnd.active = false;
        this._nodeChapterStart.active = false;
        this._nodeChapterEnd.active = false;
        this._panelbk.setContentSize(G_ResolutionManager.getDesignCCSize());
        this._panelRoot.setContentSize(G_ResolutionManager.getDesignCCSize());
    }

    private _show(fun) {
        this._imageStart.opacity = (255);
        this._imageStart.runAction(cc.sequence(cc.delayTime(1), cc.fadeOut(0.4), cc.callFunc(function () {
            fun();
        })));
    }

    public showUI(chapterNum, chapterName, chapterContent?) {
        this.open();
        if (this._movieType == MovieConst.TYPE_LOGIN_START) {
            this._nodeLoginStart.active = true;
            this._show(handler(this, this.updateNodeLoginStart));
        }
        if (this._movieType == MovieConst.TYPE_LOGIN_END) {
            this.updateNodeLoginEnd();
        }
        if (this._movieType == MovieConst.TYPE_CHAPTER_START) {
            this.updateNodeChapterStart(chapterNum, chapterName);
        }
        if (this._movieType == MovieConst.TYPE_CHAPTER_END) {
            this.updateNodeChapterEnd(chapterNum, chapterName, chapterContent);
        }
        if (this._movieType == MovieConst.TYPE_CREATE_ROLE_START) {
            this.updateNodeCreateRoleStart();
        }
    }

    public updateNodeLoginStart() {
        var descStr = Lang.get('movie_text_start');
        this.updateMovieText(this._nodeLoginStart, descStr, handler(this, this.onMovieFinish));
    }

    public updateNodeCreateRoleStart() {
        this._nodeCreateRoleStart.active = true;
        var descStr = Lang.get('movie_create_role');
        this.updateMovieText(this._nodeCreateRoleStart, descStr, handler(this, this.onMovieFinish));
    }

    public updateNodeLoginEnd() {
        this._nodeLoginEnd.active = true;
        var descStr = Lang.get('movie_text_end');
        this.updateMovieText(this._nodeLoginEnd, descStr, handler(this, this.onMovieFinish));
    }

    public updateNodeChapterStart(chapterNum, chapterName) {
        this._nodeChapterStart.active = true;
        var descStr = Lang.get('chapter_start', {
            chapterNum: chapterNum,
            chapterName: chapterName
        });
        this.updateMovieText(this._nodeChapterStart, descStr, handler(this, this.onMovieFinish));
    }

    public updateNodeChapterEnd(chapterNum, chapterName, chapterContent) {
        this._chapterNum = chapterNum;
        this._chapterName = chapterName;
        this._chapterContent = chapterContent;

        var textContent = this._nodeChapterEnd.getChildByName('Text_content').getComponent(cc.Label);
        textContent.string = (' ');
        var textStart = this._nodeChapterEnd.getChildByName('Text_start').getComponent(cc.Label);
        textStart.string = (' ');
        var imageTitle = this._nodeChapterEnd.getChildByName('Image_title');
        imageTitle.active = false;
        this._nodeChapterEnd.active = true;
        this._playMingJiangling();
    }

    private _playFinishStage() {
        function eventFunction(event) {
            if (event == 'finish') {
                this.onMovieFinish();
            }
        }
        var nodeFinish = this._nodeChapterEnd.getChildByName('Node_finish');
        var effect = G_EffectGfxMgr.createPlayGfx(nodeFinish, 'effect_mingjiangling_tongguan', eventFunction.bind(this), false);
        effect.play();
    }

    private _playChapterContent() {
        function onContentFinish() {
            this._playFinishStage();
        }
        var textContent = this._nodeChapterEnd.getChildByName('Text_content').getComponent(cc.Label);
        var descStr = this._chapterContent;
        this.playMoviveText(textContent, descStr, onContentFinish.bind(this));
    }

    private _playChapterTitle() {
        var imageTitle = this._nodeChapterEnd.getChildByName('Image_title');
        imageTitle.active = false;
        var textStart = this._nodeChapterEnd.getChildByName('Text_start').getComponent(cc.Label);
        var descTitle = Lang.get('chapter_start', {
            chapterNum: this._chapterNum,
            chapterName: this._chapterName
        });
        this.playMoviveText(textStart, descTitle, handler(this, this._playChapterContent));
    }

    private _playMingJiangling() {
        function eventFunction(event) {
            if (event == 'finish') {
                this._playChapterTitle();
            }
        }
        var nodeMingjiangling = this._nodeChapterEnd.getChildByName('Node_mingjiangling');
        var effect = G_EffectGfxMgr.createPlayGfx(nodeMingjiangling, 'effect_mingjiangling', eventFunction.bind(this), false);
        effect.play();
    }

    public updateMovieText(nodeMovie: cc.Node, descStr, callBack) {
        this._commonContinueNode.node.active = false;
        var textMovie = nodeMovie.getChildByName('Text_movie').getComponent(cc.Label);
        textMovie.string = (' ');
        this.playMoviveText(textMovie, descStr, callBack);
    }

    public onMovieFinish() {
        this._commonContinueNode.node.active = true;
    }

    public playMoviveText(textMovie: cc.Label, descStr: string, callBack) {
        this.unschedule(this._updateCallBack);
        var descCount = descStr.length;
        this._playMoviveTextLabel = textMovie;
        this._playMoviveTextStr = descStr;
        this._playMoviveTextCallback = callBack;
        this._playMoviveTextCurrTime = 0;
        this._playMoviveTextTotalTime = MovieConst.PLAY_SPEED * descCount + MovieConst.PLAY_DEALY_PEND;
        this.schedule(this._updateCallBack, MovieConst.PLAY_SPEED);
    }

    private _updateCallBack() {
        if (this._playMoviveTextCurrTime > this._playMoviveTextTotalTime) {
            this.unschedule(this._updateCallBack);
            if (this._playMoviveTextCallback != null) {
                this._playMoviveTextCallback();
            }
            return;
        }
        this._playMoviveTextCurrTime += MovieConst.PLAY_SPEED;
        var currShowNum = Math.floor(this._playMoviveTextCurrTime / MovieConst.PLAY_SPEED);
        this._playMoviveTextLabel.string = this._playMoviveTextStr.substring(0, currShowNum);
    }

    public onClickPanel(sender) {
        if (this._commonContinueNode.node.active) {
            this.onCloseEvent();
        }
    }

    public onEnter() {
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_BEGIN);
    }

    public onExit() {
        this.unschedule(this._updateCallBack);
        G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_TOUCH_AUTH_END);
        if (this._movieType == MovieConst.TYPE_CHAPTER_END) {
            G_SignalManager.dispatch(SignalConst.EVENT_TUTORIAL_STEP, "PopupMovieText");
        }
    }

    public onCloseEvent() {
        if (this._callback) {
            this._callback();
        }
        this.close();
    }
}