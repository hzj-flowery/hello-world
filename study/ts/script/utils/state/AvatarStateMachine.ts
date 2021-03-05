export default class AvatarStateMachine {

    private _defaultState;
    private _defaultCallback;
    private _curState;
    constructor(defaultState, defaultCallback) {
        this._defaultState = defaultState;
        this._defaultCallback = defaultCallback;
        this._curState = defaultState;
        this._defaultState.onDidEnter();
    }

    public canChangeState(state) {
        if (state.getName() == this._curState.getName()) {
            return false;
        }
        return true;
    }

    public changeState(state) {
        if (!this.canChangeState(state)) {
            return;
        }
        var curState = this._curState;
        var nextState = state;
        curState.onWillExit();
        nextState.onWillEnter();
        this._changeStateSuccess(curState, nextState);
    }

    private _changeStateSuccess(curState, nextState) {
        this._defaultCallback(curState, nextState);
        curState.onDidExit();
        nextState.onDidEnter();
        this._curState = nextState;
    }

    public update(f) {
        this._curState.update(f);
    }

    public stopCurState() {
        if (this._curState != this._defaultState) {
            this.changeState(this._defaultState);
        }
    }

    public getCurState() {
        return this._curState;
    }
}