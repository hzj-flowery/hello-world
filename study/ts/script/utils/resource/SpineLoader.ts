import { G_pako } from "../../init";

export default class SpineLoader {
    // private name: string;

    private images: string[];

    private json: any;
    private atlas: string;
    private textures: cc.Texture2D[];

    private name: string;

    private callback: (comp: sp.SkeletonData) => void;

    public load(name: string, callback?: (comp: sp.SkeletonData) => void) {
        this.clear();
        this.callback = callback;
        this.name = name;
        this.loadBin();
    }

    private loadBin() {
        cc.resources.load(this.name, cc.BufferAsset, (err, asset) => {
            if (err || !asset) {
                cc.warn('load spine fail:', this.name);
                this.loadFail();
                return;
            }
            this.parseBin(asset._buffer);
        })
    }

    private parseBin(asset: ArrayBuffer) {
        if (!asset) {
            this.loadFail();
            return;
        }

        let view = new DataView(asset);
        let length = view.getUint32(1, false);
        if (length !== asset.byteLength) {
            this.loadFail();
            return;
        }

        this.readImageNames(view);
        this.readAtlas(view);
        this.readJson(view);
        this.loadTextures();
    }

    private readImageNames(view: DataView) {
        let offset = 6;
        let pos = view.getUint32(offset, false);
        offset += 4;
        let length = view.getUint32(offset, false);

        offset = pos;
        let count = view.getUint32(offset, false);
        offset += 4;
        this.images = [];
        for (let i = 0; i < count; i++) {
            length = view.getUint32(offset, false);
            offset += 4;
            let buffer = new Uint8Array(view.buffer.slice(offset, offset + length));
            this.images[i] = String.fromCharCode.apply(null, buffer);
            offset += length;
        }
    }

    private readAtlas(view: DataView) {
        let offset = 6 + 8;
        let pos = view.getUint32(offset, false);
        offset += 4;
        let length = view.getUint32(offset, false);

        G_pako.inflate(this.name + ".atlas", view.buffer.slice(pos, pos+length), (result) => {
            this.atlas = result;
            this.allLoaded();
        })
    }

    private readJson(view: DataView) {
        let offset = 6 + 8 * 2;
        let pos = view.getUint32(offset, false);
        offset += 4;
        let length = view.getUint32(offset, false);

        G_pako.inflate(this.name + ".json", view.buffer.slice(pos, pos+length), (result) => {
            this.json = result;
            this.allLoaded();
        })
    }

    private getTexturePath(texture: string): string {
        let dirIndex = this.name.lastIndexOf('/')
        let extIndex= texture.lastIndexOf('.');
        if (extIndex !== -1) {
            texture = texture.slice(0, extIndex);
        }

        if (dirIndex === -1) {
            return texture;
        } else {
            return this.name.slice(0, dirIndex) + '/' + texture;
        }
    }

    private loadTextures() {
        if (!this.images) {
            return;
        }

        this.textures = [];
        let count = this.images.length;
        let fail = false;
        for (let i = 0; i < this.images.length; i++) {
            cc.resources.load(this.getTexturePath(this.images[i]), cc.Texture2D, (err, asset: cc.Texture2D) => {
                count--;
                if (err || !asset) {
                    fail = true;
                } else {
                    this.textures[i] = asset;
                }

                if (count === 0) {
                    if (fail) {
                        this.loadFail();
                    } else {
                        this.allLoaded();
                    }
                }
            })
        }
    }

    private clear() {
        this.name = null;
        this.json = null;
        this.atlas = null;
        this.textures = null;
        this.images = null;
        this.callback = null;
    }

    private allLoaded() {
        if (!this.json || !this.atlas || !this.textures || !this.textures.length || this.textures.length !== this.images.length) {
            return;
        }
        let data = new sp.SkeletonData();
        data.skeletonJson = this.json;
        data.atlasText = this.atlas;
        data.textures = this.textures;
        let d = data as any;
        d.textureNames = this.images;

        // let spine = this.node.addComponent(sp.Skeleton);
        // spine.premultipliedAlpha = false;
        // spine.skeletonData = data;
        // if (spine.findAnimation('idle')) {
        //     spine.animation = 'idle';
        // }

        cc.loader.releaseRes(this.name, cc.BufferAsset);
        this.callback && this.callback(data);

        // console.log(this.name, Date.now() - this.loadStart);
    }

    private loadFail() {
        this.callback && this.callback(null);
    }
}