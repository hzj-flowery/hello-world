export class Interpolation{

        function Interpolation() {
        }
        public apply(start, end, a) {
            return start + (end - start) * this.applyInternal(a);
        };
        return Interpolation;
    }