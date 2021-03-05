export class Loop {
    protected _isFinish: boolean = false;
    protected _isStart: boolean = false;

    constructor()
    {
        this._isFinish = false;
        this._isStart = false;
    }

    public get isFinish() {
        return this._isFinish;
    }

    public set isFinish(value:boolean)
    {
        this._isFinish = value;
    }

    public get isStart() {
        return this._isStart;
    }

    public start() {
        this._isFinish = false;
        this._isStart = true;
    }

    public stop() {
        this._isStart = false;
    }

    public update(f:number)
    {

    }

    public onFinish()
    {
        this._isFinish = true;
    }
}