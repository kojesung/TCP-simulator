import { EVENT_TYPE, SPEED_MODE } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';
import Timeline from './Timeline.js';

class BasicSimulator {
    constructor(totalDataSize, lossRate, rtt, speed) {
        this.totalDataSize = totalDataSize;
        this.lossRate = lossRate;
        this.speed = speed;
        this.rtt = rtt;
        this.timeline = new Timeline();
        this.packets = [];
        this.currentTime = 0;
        this.isn = this.#generateISN();
    }

    #generateISN() {
        return Math.floor(Math.random() * 9000) + 1000;
    }

    #threeWayHandshake() {
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

    #sendFragmentedPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        this.packets.forEach((packet) => {
            this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_SEND, { packet }));

            const isLost = RandomGenerator.isPacketLost(this.lossRate);

            if (isLost) return this.#planPacketLoss(packet);
            else if (!isLost) return this.#planPacketSuccess(packet);
        });
    }

    #planPacketLoss(packet) {
        this.currentTime += this.rtt * 2;
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.TIMEOUT, { packet }));
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.RETRANSMIT, { packet }));

        this.currentTime += this.rtt / 2;
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));
        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                ack: packet.endSeq + 1,
            })
        );
    }

    #planPacketSuccess(packet) {
        this.currentTime += this.rtt / 2;
        this.timeline.addEvent(new Event(this.currentTime, EVENT_TYPE.PACKET_ARRIVE, { packet }));

        this.currentTime += this.rtt / 2;
        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.DATA_ACK_ARRIVE, {
                ack: packet.endSeq + 1,
            })
        );
    }

    #fourWayHandshake() {
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

        this.#threeWayHandshake();
        this.#sendFragmentedPackets();
        this.#fourWayHandshake();

        this.timeline.sort();
    }

    async run() {
        const events = this.timeline.getEvents();
        let runTime = 0;

        for (const event of events) {
            await this.#wait(event.time - runTime);
            runTime = event.time;

            await this.#executeEvent(event);
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

    async #executeEvent(event) {
        // TODO: 이벤트별 출력
        console.log(`[${event.time}ms] ${event.type}`);
    }
}

export default BasicSimulator;
