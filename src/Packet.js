class Packet {
    constructor(id, startSeq, endSeq) {
        this.id = id;
        this.startSeq = startSeq;
        this.endSeq = endSeq;
        this.packetSize = endSeq - startSeq + 1;
    }

    getPacketInfo() {
        return `Packet#${this.id} (seq#${this.startSeq} - ${this.endSeq}) packet size: ${this.packetSize}`;
    }
}

export default Packet;
