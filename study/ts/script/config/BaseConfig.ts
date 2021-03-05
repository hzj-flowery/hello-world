
export class BaseConfig extends cc.Asset {
    private static _pool: BaseConfig[] = []

    private _destroyd;

    constructor(private configName: string, private _asset?: any) {
        super();
        this._destroyd = false;
    }

    public static create(name: string, asset?: any) {
        var cfg = BaseConfig._pool.shift();
        if (!cfg) {
            cfg = new BaseConfig(name)
        } else {
            cfg.configName = name;
            cfg._destroyd = false;
        }

        if (asset) {
            cfg.asset = asset;
        }

        return cfg;
    }

    public get name(): string {
        return this.configName;
    }

    public get isValid(): boolean {
        return !this._destroyd;
    }

    public get asset(): any {
        return this._asset
    }

    public set asset(v: any) {
        this._asset = v;
    }

    public get(configId: number, ...args): any {
        if(configId==null)
        {
            cc.error("get(configId: number, ...args)");
            return;
        }
        let key: string = configId.toString();
        if (args) {
            for (let i = 0; i < args.length; i++) {
                key += "_" + args[i];
            }
        }
        return this.indexOf(this._asset.indexes[key]);
    }
    public getBlackData(configId: number, ...args): any {
        if(configId==null)
        {
            cc.error("get(configId: number, ...args)");
            return;
        }
        let key: string = configId.toString();
        if (args) {
            for (let i = 0; i < args.length; i++) {
                key += "_" + args[i];
            }
        }
        return this._asset.data[key];
    }

    public length() {
        if (!this._asset) {
            return 0;
        }
        return this._asset.data.length;
    }

    public hasKey(k) {
        if (!this._asset) {
            return false;
        }

        return this._asset.key_map[k] != null
    }

    public indexOf(index): any {
        let asset = this._asset;
        if (!asset) {
            return null;
        }

        let jsonData: any = asset.data[index];
        if (!jsonData) {
            return null;
        }

        let data = new Array();
        for (const key in asset.key_map) {
            data[key] = jsonData[asset.key_map[key]];
        }
        return data;
    }

    public getLength(): number{
        return this._asset ? this._asset.data.length : 0;
    }

    public destroy(): boolean {
        this.configName = null;
        if (this._asset) {
            this._asset = null;
        }

        BaseConfig._pool.push(this)
        this._destroyd = true;
        return super.destroy();
    }

    public index() {
        if (this._asset == null) {
            return null;
        }
        return this._asset.indexes;
    }
}