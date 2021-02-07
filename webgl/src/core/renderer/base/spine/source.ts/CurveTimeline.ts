export class CurveTimeline{
    static LINEAR = 0;
    static STEPPED = 1;
    static BEZIER = 2;
    static BEZIER_SIZE = 10 * 2 - 1;
    public curves:any;
    constructor(frameCount) {
        if (frameCount <= 0)
            throw new Error("frameCount must be > 0: " + frameCount);
        this.curves = spine.Utils.newFloatArray((frameCount - 1) * CurveTimeline.BEZIER_SIZE);
    }
    public getFrameCount() {
        return this.curves.length / CurveTimeline.BEZIER_SIZE + 1;
    };
    public setLinear(frameIndex) {
        this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.LINEAR;
    };
    public setStepped(frameIndex) {
        this.curves[frameIndex * CurveTimeline.BEZIER_SIZE] = CurveTimeline.STEPPED;
    };
    public getCurveType(frameIndex) {
        var index = frameIndex * CurveTimeline.BEZIER_SIZE;
        if (index == this.curves.length)
            return CurveTimeline.LINEAR;
        var type = this.curves[index];
        if (type == CurveTimeline.LINEAR)
            return CurveTimeline.LINEAR;
        if (type == CurveTimeline.STEPPED)
            return CurveTimeline.STEPPED;
        return CurveTimeline.BEZIER;
    };
    public setCurve(frameIndex, cx1, cy1, cx2, cy2) {
        var tmpx = (-cx1 * 2 + cx2) * 0.03, tmpy = (-cy1 * 2 + cy2) * 0.03;
        var dddfx = ((cx1 - cx2) * 3 + 1) * 0.006, dddfy = ((cy1 - cy2) * 3 + 1) * 0.006;
        var ddfx = tmpx * 2 + dddfx, ddfy = tmpy * 2 + dddfy;
        var dfx = cx1 * 0.3 + tmpx + dddfx * 0.16666667, dfy = cy1 * 0.3 + tmpy + dddfy * 0.16666667;
        var i = frameIndex * CurveTimeline.BEZIER_SIZE;
        var curves = this.curves;
        curves[i++] = CurveTimeline.BEZIER;
        var x = dfx, y = dfy;
        for (var n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
            curves[i] = x;
            curves[i + 1] = y;
            dfx += ddfx;
            dfy += ddfy;
            ddfx += dddfx;
            ddfy += dddfy;
            x += dfx;
            y += dfy;
        }
    };
    public getCurvePercent(frameIndex, percent) {
        percent = spine.MathUtils.clamp(percent, 0, 1);
        var curves = this.curves;
        var i = frameIndex * CurveTimeline.BEZIER_SIZE;
        var type = curves[i];
        if (type == CurveTimeline.LINEAR)
            return percent;
        if (type == CurveTimeline.STEPPED)
            return 0;
        i++;
        var x = 0;
        for (var start = i, n = i + CurveTimeline.BEZIER_SIZE - 1; i < n; i += 2) {
            x = curves[i];
            if (x >= percent) {
                var prevX = void 0, prevY = void 0;
                if (i == start) {
                    prevX = 0;
                    prevY = 0;
                }
                else {
                    prevX = curves[i - 2];
                    prevY = curves[i - 1];
                }
                return prevY + (curves[i + 1] - prevY) * (percent - prevX) / (x - prevX);
            }
        }
        var y = curves[i - 1];
        return y + (1 - y) * (percent - x) / (1 - x);
    };
     
}