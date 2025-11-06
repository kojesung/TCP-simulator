import { TCP } from './constants.js';
import Packet from './Packet.js';

class PacketFragments {
    static getFragmentedPackets(totalDataSize, frontSeq = 1) {
        const fragmentedPackets = [];
        const fragmentCount = this.#getPacketCount(totalDataSize);
        for (let i = 0; i < fragmentCount; i++) {
            const seqStart = frontSeq + i * TCP.MSS;
            const seqEnd = Math.min(totalDataSize + frontSeq - 1, seqStart + TCP.MSS - 1);
            fragmentedPackets.push(new Packet(i + 1, seqStart, seqEnd));
        }
        return fragmentedPackets;
    }
    static #getPacketCount(dataSize) {
        return Math.ceil(dataSize / TCP.MSS);
    }
}

export default PacketFragments;
