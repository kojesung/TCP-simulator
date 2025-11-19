import BaseOutputFormatter from './BaseOutputFormatter.js';
import { EVENT_TYPE, SPEED_MODE } from './constants.js';
import Event from './Event.js';
import Timeline from './Timeline.js';

class BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, formatter = null) {
        this.totalDataSize = totalDataSize;
        this.lossRate = lossRate;
        this.rtt = rtt;
        this.speed = speed;
        this.timeline = new Timeline();
        this.packets = [];
        this.currentTime = 0;
        this.isn = this._generateISN();
        this.formatter = formatter || new BaseOutputFormatter(this);
    }

    _generateISN() {
        return Math.floor(Math.random() * 9000) + 1000;
    }

    _threeWayHandshake() {
        this.timeline.addEvent(
            new Event(0, EVENT_TYPE.SYN_SEND, {
                seq: this.isn,
            })
        );

        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ARRIVE, {
                seq: this.isn,
            })
        );

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ACK_SEND, {
                ack: this.isn + 1,
            })
        );

        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.SYN_ACK_ARRIVE, {
                ack: this.isn + 1,
            })
        );

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.ACK_SEND));
    }

    _sendPackets() {
        throw new Error('[ERROR] _sendPackets()는 자식 class에서 구현해야합니다.');
    }

    _detectLossType(windowPackets, lostIndex) {
        let duplicateCount = 0;

        for (let i = lostIndex + 1; i < windowPackets.length; i++) {
            if (!windowPackets[i].isLost) {
                duplicateCount++;
            }
        }

        return duplicateCount >= 3 ? 'FAST_RETRANSMIT' : 'TIMEOUT';
    }

    _createRetransmitEvents(packet, retransmitTime) {
        this.timeline.addEvent(new Event(retransmitTime, EVENT_TYPE.RETRANSMIT, { packet }));

        const arriveTime = retransmitTime + this.rtt / 2;
        this.timeline.addEvent(new Event(arriveTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));

        const ackTime = arriveTime + this.rtt / 2;
        this.timeline.addEvent(
            new Event(ackTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                ack: packet.endSeq + 1,
            })
        );
        return ackTime;
    }

    _fourWayHandshake() {
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ARRIVE));
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_ARRIVE));

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ARRIVE));
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_SEND));
        this.currentTime += this.rtt / 2;

        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.FIN_ACK_ARRIVE));
    }

    planSimulation() {
        this.currentTime = 0;
        this._threeWayHandshake();
        this._sendPackets();
        this._fourWayHandshake();
        this.timeline.sort();
    }

    async run() {
        const events = this.timeline.getEvents();
        let runTime = 0;

        for (const event of events) {
            await this.#wait(event.time - runTime);
            runTime = event.time;

            await this._executeEvent(event);
        }
    }

    async #wait(ms) {
        let actualDelay;
        if (this.speed === SPEED_MODE.INSTANT) {
            return;
        } else if (this.speed === SPEED_MODE.FAST) {
            actualDelay = ms * 0.1;
        } else if (this.speed === SPEED_MODE.SLOW) {
            actualDelay = ms;
        }
        if (actualDelay > 0) {
            await new Promise((resolve) => setTimeout(resolve, actualDelay));
        }
    }

    async _executeEvent(event) {
        if (!this.formatter) return;

        const output = this.formatter.format(event);
        if (output) {
            console.log(output);
        }
    }
}

export default BaseSimulator;
