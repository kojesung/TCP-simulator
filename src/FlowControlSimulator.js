import BaseSimulator from './BaseSimulator.js';
import { TCP } from './constants.js';
import PacketFragments from './PacketFragments';
import RandomGenerator from './RandomGenerator.js';

class FlowControlSimulator extends BaseSimulator {
    constructor(totalDataSize, lossRate, rtt, speed, receiverBufferSize, receiverSpeed) {
        super(totalDataSize, lossRate, rtt, speed);

        this.initialBufferSize = receiverBufferSize;
        this.rwnd = receiverBufferSize;
        this.receiverSpeed = receiverSpeed;
        this.bufferedPackets = 0;

        this.lastAck = this.isn + 1;
        this.duplicateAckCount = 0;
    }
    _sendPackets() {
        this.packets = PacketFragments.getFragmentedPackets(this.totalDataSize, this.isn + 1);

        let sentCount = 0;

        while (sentCount < this.packets.length) {
            const canSendPacketCount = Math.floor(this.rwnd / TCP.MSS);

            if (canSendPacketCount === 0) {
                continue; // TODO rwnd probe하는 함수
            }

            // TODO 보낼 수 있는 만큼 보내는 함수(canSendPacketCount, sentCount)
            sentCount += 1;
        }
    }
}

export default FlowControlSimulator;
