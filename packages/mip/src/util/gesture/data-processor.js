/**
 * @file data-processor
 * @author sekiyika(pengxing@baidu.com)
 */

const round = Math.round;
const max = Math.max;
const abs = Math.abs;

/**
 * Data processor of touch event object.
 *
 * @type {Object}
 */
export default {
    /**
     * The center point of starting gesture.
     *
     * @type {?Object}
     */
    startCenter: null,

    /**
     * The center point of last gesture.
     *
     * @type {?Object}
     */
    lastCenter: null,

    /**
     * The starting time of event.
     *
     * @type {?number}
     */
    startTime: null,

    /**
     * Event data processor.
     *
     * @param {Event} event event
     * @param {boolean} preventX preventX
     * @param {boolean} preventY preventY
     * @return {Object}
     */
    process(event, preventX, preventY) {
        let data = {};
        let now = Date.now();
        let touches = event.touches.length ? event.touches : event.changedTouches;
        if (event.type === 'touchstart') {
            this.startCenter = this.getCenter(touches);
            this.startTime = now;
            this.startData = data;
            this.preData = null;
        }
        let startCenter = this.startCenter;
        let center = this.getCenter(touches);
        let deltaTime = data.deltaTime = now - this.startTime;

        data.pointers = touches;

        data.x = center.x;
        data.y = center.y;

        let deltaX = data.deltaX = center.x - startCenter.x;
        let deltaY = data.deltaY = center.y - startCenter.y;

        data.velocityX = deltaX / deltaTime || 0;
        data.velocityY = deltaY / deltaTime || 0;
        data.velocity = max(abs(data.velocityX), abs(data.velocityY));
        data.angle = this.getAngle(startCenter, center);
        data.distance = this.getDistance(startCenter, center);
        data.direction = this.getDirection(deltaX, deltaY);
        data.eventState = event.type.replace('touch', '');
        data.timeStamp = now;

        if (this.preData) {
            let instTime = data.instantDeltaTime = now - this.preData.timeStamp;
            let instX = data.instantVelocityX = (data.x - this.preData.x) / instTime || 0;
            let instY = data.instantVelocityY = (data.y - this.preData.y) / instTime || 0;
            if (data.eventState === 'move' && (preventX || preventY)) {
                let curDirection = abs(instX) > abs(instY);
                if ((preventX && curDirection) || (preventY && !curDirection)) {
                    event.preventDefault();
                }
            }
        }
        else {
            data.instantDeltaTime = data.instantVelocityX = data.instantVelocityY = 0;
        }

        this.preData = data;

        data.event = event;
        return Object.freeze(data);
    },

    /**
     * Get the center point from some points.
     * TODO: Calculates the center point of multiple points.
     *
     * @param {Array} points points
     * @return {Object}
     */
    getCenter(points) {
        return {
            x: round(points[0].clientX),
            y: round(points[0].clientY)
        };
    },

    /**
     * Get the angle of two points.
     *
     * @param {Object} point1 point1
     * @param {Object} point2 point2
     * @return {number}
     */
    getAngle(point1, point2) {
        return Math.atan2(point2.y - point1.y, point2.x - point1.x) * 180 / Math.PI;
    },

    /**
     * Get the distance of two points.
     *
     * @param {Object} point1 point1
     * @param {Object} point2 point2
     * @return {number}
     */
    getDistance(point1, point2) {
        let x = point2.x - point1.x;
        let y = point2.y - point1.y;
        return Math.sqrt(x * x + y * y);
    },

    /**
     * Calculate direction according to a coordinate.
     * The meaning of return values:
     *  0: origin
     *  1: up
     *  2: right
     *  3: down
     *  4: left
     *
     * @param {number} x x
     * @param {number} y y
     * @return {number}
     */
    getDirection(x, y) {
        if (x === y) {
            return 0;
        }
        if (abs(x) >= abs(y)) {
            return x > 0 ? 2 : 4;
        }
        return y < 0 ? 1 : 3;
    }
};
