import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments.js';
import RandomGenerator from './RandomGenerator.js';

class BasicSimulator extends BaseSimulator {
    _sendPackets() {
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
}

export default BasicSimulator;
