export class Interpolation {
    public apply(start, end, a) {
        return start + (end - start) * this.applyInternal(a);
    };
}