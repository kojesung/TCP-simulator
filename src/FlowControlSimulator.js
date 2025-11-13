import BaseSimulator from './BaseSimulator.js';
import { EVENT_TYPE, TCP } from './constants.js';
import Event from './Event.js';
import PacketFragments from './PacketFragments';
import RandomGenerator from './RandomGenerator.js';

class FlowControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, receiverBufferSize, receiverSpeed) {
        super(totalDataSize, lossRate, rtt, speed);

        this.initialBufferSize = receiverBufferSize;
        this.rwnd = receiverBufferSize;
        this.receiverSpeed = receiverSpeed;
        this.bufferedBytes = 0;

        this.lastAck = this.isn + 1;
        this.duplicateAckCount = 0;
    }
    _sendPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        let sentCount = 0;

        while (sentCount < this.packets.length) {
            const canSendPacketCount = Math.floor(this.rwnd / TCP.MSS);

            if (canSendPacketCount === 0) {
                this.sendProbePacket();
                continue;
            }

            // TODO 보낼 수 있는 만큼 보내는 함수(canSendPacketCount, sentCount)
            sentCount += 1;
        }
    }
    sendProbePacket() {
        const nextSeq = this.packets.length > 0 ? this.packets[this.packets.length - 1].endSeq + 1 : this.isn + 1;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.RWND_PROBE, {
                seq: nextSeq,
                rwnd: this.rwnd,
                buffered: this.bufferedBytes,
            })
        );

        this.currentTime += this.rtt;

        const processed = Math.min(this.receiverSpeed, this.bufferedBytes); // 처리해야될게 rtt당 처리하는 bytes보다 적을 때를 고려
        this.bufferedBytes -= processed;

        this.rwnd = this.initialBufferSize - this.bufferedBytes;

        this.timeline.addEvent(
            new Event(this.currentTime, EVENT_TYPE.RWND_UPDATE, {
                rwnd: this.rwnd,
                buffered: this.bufferedBytes,
            })
        );
    }
}

export default FlowControlSimulator;
