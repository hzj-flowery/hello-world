import { handler } from "../../../utils/handler";

export default class StateMachine {
    _cfg: any;
    _curState: any;
    _nextState: any;
    _isInTransition: boolean;
    _curStateCfg: any;
    _nextStateCfg: any;
    _tempParams: any;
    constructor(cfg) {
        if (!(cfg && cfg.state && cfg.defaultState)) {
            // assert(false, 'StateMachine structure Error');
        }
        this._cfg = cfg;
        this._curState = null;
        this._nextState = null;
        this._isInTransition = false;
        this._curStateCfg = null;
        this._nextStateCfg = null;
        this._tempParams = null;
        this._setStartState(cfg.defaultState);
    }
    _setStartState(state) {
        this._curState = state;
        this._curStateCfg = this._getStateCfg(this._curState);
        this._safeCallFunc(this._curStateCfg['didEnter']);
    }
    _getStateCfg(state) {
        var stateCfg = this._cfg.state[state];
        
        // assert(stateCfg != null, 'StateMachine can not find state ' + (this._curState || null));
        return stateCfg;
    }
    _getTransitionCfg(nextState) {
        if (this._curStateCfg.nextState && nextState) {
            var transitionCfg = this._curStateCfg.nextState[nextState];
            return transitionCfg;
        }
    }
    _stopTransition() {
        var transitionCfg = this._getTransitionCfg(this._nextState);
        if (transitionCfg && (transitionCfg.canStopTransition == null || transitionCfg.canStopTransition == true)) {
            if (!this._nextStateCfg || !this._curStateCfg) {
                return false;
            }
            if (transitionCfg['stopTransition']) {
                transitionCfg['stopTransition']();
            }
            this._safeCallFunc(this._curStateCfg['stopExit']);
            this._safeCallFunc(this._nextStateCfg['stopEnter']);
            this._nextState = null;
            this._nextStateCfg = null;
            this._isInTransition = false;
            return false;
        }
        return true;
    }
    _safeCallFunc(f, ...params) {
        if (f) {
            f(params);
        }
    }
    canSwitchToState(nextState, isForce?) {
        if (this._isInTransition && !isForce) {
            return false;
        }
        var transitionCfg = this._getTransitionCfg(nextState);
        if (transitionCfg) {
            return true;
        }
        return false;
    }
    switchState(nextState, params, isForceStop) {
        if (nextState == this._curState) {
            return false;
        }
        if (this._isInTransition) {
            if (isForceStop) {
                if (this._stopTransition()) {
                    return false;
                }
            } else {
                return false;
            }
        }
        var transitionCfg = this._getTransitionCfg(nextState);
        if (!transitionCfg) {
            return false;
        }
        this._tempParams = params;
        this._safeCallFunc(this._curStateCfg['willExit'], nextState);
        this._nextState = nextState;
        this._nextStateCfg = this._getStateCfg(nextState);
        this._safeCallFunc(this._curStateCfg['willEnter'], this._tempParams);
        this._isInTransition = true;
        if (transitionCfg['transition']) {
            transitionCfg['transition'](handler(this, this._switchStateSuccess));
        } else {
            this._switchStateSuccess();
        }
        return true;
    }
    _switchStateSuccess() {
        if (!this._isInTransition) {
            return;
        }
        this._isInTransition = false;
        this._safeCallFunc(this._curStateCfg['didExit'], this._nextState);
        this._safeCallFunc(this._nextStateCfg['didEnter'], this._tempParams);
        var oldState = this._curState;
        var newState = this._nextState;
        this._curState = this._nextState;
        this._curStateCfg = this._nextStateCfg;
        this._nextState = null;
        this._nextStateCfg = null;
        this._tempParams = null;
        this._safeCallFunc(this._cfg['stateChangeCallback'], newState, oldState);
    }
    getCurState() {
        return this._curState;
    }
}