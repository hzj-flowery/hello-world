/**
 * 特效控制器，控制位移，颜色等功能
 */
export default class EffectController {

    private calValueByK(start: number, endt: number, percent: number) {
        return start + (endt - start) * percent;
    }

    /**
     * 单帧更新
     * @param playingSub 
     * @param subInfo 
     * @param frameIndex 
     */
    public keyUpdate(playingSub: cc.Node, subInfo, frameIndex) {
        var fx = 'f' + frameIndex;
        var start = subInfo[fx].start;
        // console.log("keyUpdate11:", fx, start.x, start.y)
        playingSub.setPosition(start.x, start.y);
        playingSub.angle = -start.rotation;
        playingSub.setScale(start.scaleX, start.scaleY);
        if (start.opacity != null) {
            playingSub.opacity = start.opacity;
        }
        if (start.color) {
            playingSub.color.setR(start.color.red_original * 255);
            playingSub.color.setG(start.color.green_original * 255);
            playingSub.color.setB(start.color.blue_original * 255);
            playingSub.opacity = start.color.alpha_original * 255;
            // if (playingSub.setColorOffset) {
            //     playingSub.setColorOffset(cc.c4f(start.color.red / 255, start.color.green / 255, start.color.blue / 255, start.color.alpha / 255));
            // }
        }
        if (start.blendMode != null && start.blendMode == 'add') {
            let sprite = playingSub.getComponent(cc.Sprite);
            if (sprite != null && sprite["dstBlendFactor"] != null)
            {
                (sprite as any).dstBlendFactor = cc.macro.BlendFactor.ONE;
            }
        }
    }

    /**
     * 插值更新
     * @param playingSub 
     * @param subInfo 
     * @param frameIndex 
     * @param lastFrameStart 
     */
    public keyInterUpdate(playingSub: cc.Node, subInfo, frameIndex, lastFrameStart) {
        var lastFx = 'f' + lastFrameStart;
        var start = subInfo[lastFx].start;
        var nextFrame = subInfo[lastFx].nextFrame;
        var frames = subInfo[lastFx].frames;
        // console.log("keyInterUpdate11:", frameIndex, lastFrameStart)
        if (nextFrame == null) {
            return;
        }
        if (playingSub == null) {
        }
        if (subInfo[nextFrame].remove) {
            return;
        }

        if (frames == null || frames == 0) {
            frames = 1;
        }
        var percent = (frameIndex - lastFrameStart) / frames;
        if (percent == null) {
            percent = 1;
        }
        var nextStart = subInfo[nextFrame].start;

        // console.log("keyInterUpdate22:",this.calValueByK(start.x, nextStart.x, percent), this.calValueByK(start.y, nextStart.y, percent))
        playingSub.setPosition(this.calValueByK(start.x, nextStart.x, percent),
            this.calValueByK(start.y, nextStart.y, percent));

        playingSub.angle = -(start.rotation + (nextStart.rotation - start.rotation) * percent);

        playingSub.setScale(start.scaleX + (nextStart.scaleX - start.scaleX) * percent,
            start.scaleY + (nextStart.scaleY - start.scaleY) * percent);

        if (start.opacity != null) {
            var nextOpacity: number = nextStart.opacity;
            if (nextOpacity == null) {
                nextOpacity = nextStart.color.alpha_original * 255;
            }
            playingSub.opacity = start.opacity + (nextOpacity - start.opacity) * percent;
        }
        if (start.color && nextStart.color) {
            var redOriginal = nextStart.color && nextStart.color.red_original || 1;
            var greenOriginal = nextStart.color && nextStart.color.green_original || 1;
            var blueOriginal = nextStart.color && nextStart.color.blue_original || 1;
            var alphaOriginal = nextStart.color && nextStart.color.alpha_original || 1;

            playingSub.color.setR((start.color.red_original + (redOriginal - start.color.red_original) * percent) * 255);
            playingSub.color.setR((start.color.green_original + (greenOriginal - start.color.green_original) * percent) * 255);
            playingSub.color.setR((start.color.blue_original + (blueOriginal - start.color.blue_original) * percent) * 255);

            playingSub.opacity = ((start.color.alpha_original + (alphaOriginal - start.color.alpha_original) * percent) * 255);
            var red = nextStart.color && nextStart.color.red || 0;
            var green = nextStart.color && nextStart.color.green || 0;
            var blue = nextStart.color && nextStart.color.blue || 0;
            var alpha = nextStart.color && nextStart.color.alpha || 0;

            // TODO:
            // if (playingSub.setColorOffset) {
            //     playingSub.setColorOffset(cc.c4f((start.color.red + (red - start.color.red) * percent) / 255, (start.color.green + (green - start.color.green) * percent) / 255, (start.color.blue + (blue - start.color.blue) * percent) / 255, (start.color.alpha + (alpha - start.color.alpha) * percent) / 255));
            // }
        }
    }
}