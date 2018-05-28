/**
 * @file gesture
 * @author sekiyika(pengxing@baidu.com)
 */

import EventEmitter from '../event-emitter';
import Recognizer from './gesture-recognizer';
import dataProcessor from './data-processor';
import fn from '../fn';


/**
 * Gesture
 *
 * @class
 */
class Gesture extends EventEmitter {

    /**
     * Gesture
     *
     * @constructor
     * @param {HTMLElement} element Element that need gestures
     * @param {Object} opt Options
     */
    constructor(element, opt) {
        super();

        /**
         * The events' context.
         *
         * @private
         * @type {?Object}
         */
        this.__eventContext = this._element = element;

        opt && (this._opt = fn.extend({}, this._opt, opt));

        /**
         * Touch handler.
         *
         * @private
         * @type {Function}
         */
        this._boundTouchEvent = touchHandler.bind(this);

        listenersHelp(element, 'touchstart touchmove touchend touchcancel', this._boundTouchEvent);

        /**
         * For storing the recoginzers.
         *
         * @private
         * @type {Object}
         */
        this._recognizers = {};

         /**
         * Default options.
         *
         * @private
         * @type {Object}
         */
        this._opt = {
            preventDefault: false,
            stopPropagation: false,
            preventX: true,
            preventY: false
        };
    }


    /**
     * Cleanup the events.
     */
    cleanup() {
        let element = this._element;
        listenersHelp(element, 'touchstart touchmove touchend touchcancel', this._boundTouchEvent, false);
        this.off();
    }

    /**
     * Instantiate a recoginzer and add the recoginzer to the _recognizer and handle the conflicting list when
     * event is created.
     *
     * @param {string} name name
     */
    _createEventCallback(name) {
        if (this._hasRegister(name)) {
            return;
        }
        let RecognizerClass = Recognizer.getByEventname(name);
        if (!RecognizerClass) {
            return;
        }
        name = RecognizerClass.recName;
        let recognizer = this._recognizers[name] = new RecognizerClass(this);
        let conflictList = Recognizer.getConflictList(recognizer.recName);
        for (let i = 0; i < conflictList.length; i++) {
            name = conflictList[i];
            let conflictRecognizer = this._recognizers[name];
            if (conflictRecognizer) {
                conflictRecognizer.conflictList[recognizer.recName] = recognizer;
                recognizer.conflictList[conflictRecognizer.recName] = conflictRecognizer;
            }
        }
    }

    /**
     * When event is removed, cleanup the recognizer.
     *
     * @param {string} name name
     */
    _removeEventCallback(name) {
        let recognizer;
        if (name === undefined) {
            this._recognizers = {};
        }
        else if (recognizer = this._recognizers[name]) {
            for (let i in recognizer.conflictList) {
                delete recognizer.conflictList[i][name];
            }
            delete this._recognizers[name];
        }
    }

    /**
     * Determine whether a recognizer has been registered.
     *
     * @param {string} name name
     * @return {boolean}
     */
    _hasRegister(name) {
        return !!this._recognizers[Recognizer.getByEventname(name)];
    }

    /**
     * Recognize the gesture data.
     *
     * @param {Object} data data
     */
    _recognize(data) {
        let recognizers = this._recognizers;
        for (let i in recognizers) {
            let recognizer = recognizers[i];
            recognizer.recognize(data);
        }
    }

}


/**
 * Handle touch event.
 *
 * @inner
 * @param {Event} event event
 */
function touchHandler(event) {
    let opt = this._opt;
    opt.preventDefault && event.preventDefault();
    opt.stopPropagation && event.stopPropagation();
    let data = dataProcessor.process(event, opt.preventX, opt.preventY);
    this._recognize(data);
    this.trigger(event.type, event, data);
}

/**
 * Add or remove listeners from an element.
 *
 * @inner
 * @param {HTMLElement} element element
 * @param {string} events Events' name that are splitted by space
 * @param {Function} handler Event handler
 * @param {?boolean} method Add or remove.
 */
function listenersHelp(element, events, handler, method) {
    let list = events.split(' ');
    for (let i = 0; i < list.length; i++) {
        if (method === false) {
            element.removeEventListener(list[i], handler);
        }
        else {
            element.addEventListener(list[i], handler, false);
        }
    }
}

export default Gesture;
