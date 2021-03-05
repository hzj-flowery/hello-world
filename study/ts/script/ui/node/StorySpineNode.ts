
export class StorySpineNode extends cc.Component {
    private _spineSprite: cc.Sprite;
    private _size: cc.Size
    private _scale: number

    static create(scale?: number, size?: cc.Size): StorySpineNode {
        let node = new cc.Node
        let spine = node.addComponent(StorySpineNode)
        let sprite = node.addComponent(cc.Sprite)
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        spine._spineSprite = sprite;

        scale && spine.setScale(scale)
        size && spine.setSize(size)

        return spine
    }

    onLoad() {
        this._spineSprite.node.setAnchorPoint(0.5, 0);
        this.setSize(this._size);
        this.setScale(this._scale);
    }

    public setAsset(path: string) {
        cc.resources.load(path, cc.SpriteFrame, (err, res: cc.SpriteFrame) => {
            if (res == null || this._spineSprite == null || !this._spineSprite.node || !this._spineSprite.node.isValid) {
                return;
            }
            this._spineSprite.spriteFrame = res;
        });
    }

    public setSize(size: cc.Size) {
        if (!size) return;

        this._size = size;
        //修改node的size会影响sprite的size，所以不能修改
        // if (this.node) {
        //     this.node.setContentSize(this._size);
        //     this.node.setAnchorPoint(0.5, 0);
        // }
    }

    public setScale(scale: number) {
        if (!scale) return;

        this._scale = scale;
        if (this.node) {
            this.node.scale = scale;
        }
    }

    public setData(data) {
        if (!this._spineSprite || !this._spineSprite.isValid) {
            return;
        }
        this._spineSprite.spriteFrame = data;
    }

    public setAnimation(name, loop?, reset?) {

    }

    // onDestroy() {
    //     if (!this._spineSprite.spriteFrame) {
    //         return;
    //     }
    //     let texture = this._spineSprite.spriteFrame.getTexture();
    //     texture && cc.loader.releaseAsset(texture);
    //     cc.loader.releaseAsset(this._spineSprite.spriteFrame);
    // }
}