import { EVENT_TYPE } from './constants.js';

class BaseOutputFormatter {
    constructor(simulator) {
        this.simulator = simulator;
    }

    format(event) {
        switch (event.type) {
            case EVENT_TYPE.SYN_SEND:
                return this._formatSynSend(event);
            case EVENT_TYPE.SYN_ACK_ARRIVE:
                return this._formatSynAckArrive(event);
            case EVENT_TYPE.ACK_SEND:
                return this._formatAckSend(event);
            case EVENT_TYPE.PACKET_SEND:
                return this._formatPacketSend(event);
            case EVENT_TYPE.PACKET_ARRIVE:
                return this._formatPacketArrive(event);
            case EVENT_TYPE.DATA_ACK_ARRIVE:
                return this._formatDataAckArrive(event);
            case EVENT_TYPE.TIMEOUT:
                return this._formatTimeout(event);
            case EVENT_TYPE.RETRANSMIT:
                return this._formatRetransmit(event);
            case EVENT_TYPE.PACKET_LOSS:
                return this._formatPacketLoss(event);
            case EVENT_TYPE.DUPLICATE_ACK:
                return this._formatDuplicateAck(event);
            case EVENT_TYPE.FIN_SEND:
                return this._formatFinSend(event);
            case EVENT_TYPE.FIN_ARRIVE:
                return this._formatFinArrive(event);
            case EVENT_TYPE.FIN_ACK_ARRIVE:
                return this._formatFinAckArrive(event);
            default:
                return null;
        }
    }

    _formatSynSend(event) {
        return ['\n[3-way handshake 연결 시작]', `[${event.time}ms] SYN → (seq=${event.data.seq})`].join('\n');
    }

    _formatSynArrive(event) {
        return `[${event.time}ms] ← SYN (seq=${event.data.seq})`;
    }

    _formatSynAckSend(event) {
        return `[${event.time}ms] SYN-ACK → (ack=${event.data.ack})`;
    }

    _formatSynAckArrive(event) {
        return `[${event.time}ms] ← SYN-ACK (ack=${event.data.ack})`;
    }

    _formatAckSend(event) {
        return [
            `[${event.time}ms] ACK →`,
            '3-way handshake 연결 완료!\n',
            '⚡️⚡️⚡️데이터 전송⚡️⚡️⚡️',
            `전송할 전체 데이터의 크기: ${this.simulator.totalDataSize} bytes (${this.simulator.packets.length} packets)\n`,
        ].join('\n');
    }

    _formatPacketSend(event) {
        return `[${event.time}ms] Send: ${event.data.packet.getPacketInfo()}`;
    }

    _formatPacketArrive(event) {
        return `[${event.time}ms] ← Packet Arrive: ${event.data.packet.getPacketInfo()}`;
    }

    _formatDataAckArrive(event) {
        return `[${event.time}ms] ← ACK ${event.data.ack}\n`;
    }

    _formatTimeout(event) {
        return `[${event.time}ms] ⏰ Timeout 발생!(RTT*2 시간동안 ACK가 오지 않았음): Packet#${event.data.packet.id}`;
    }

    _formatRetransmit(event) {
        return `[${event.time}ms] 🔄 Retransmit: ${event.data.packet.getPacketInfo()}`;
    }

    _formatPacketLoss(event) {
        return `🚨🚨🚨Packet#${event.data.id} loss 발생🚨🚨🚨`;
    }

    _formatDuplicateAck(event) {
        return `[${event.time}ms] ⚠️  Duplicate ACK: ${event.data.ack}`;
    }

    _formatFinSend(event) {
        const timeline = this.simulator.timeline;
        const finEvents = timeline.getEvents().filter((e) => e.type === EVENT_TYPE.FIN_SEND);

        let output = '';
        if (event === finEvents[0]) {
            output += '\n4-way handshake 연결 종료 시작\n';
        }
        output += `[${event.time}ms] FIN →`;

        return output;
    }

    _formatFinArrive(event) {
        return `[${event.time}ms] ← FIN`;
    }

    _formatFinAckSend(event) {
        return `[${event.time}ms] ACK →`;
    }

    _formatFinAckArrive(event) {
        const timeline = this.simulator.timeline;
        const finAckEvents = timeline.getEvents().filter((e) => e.type === EVENT_TYPE.FIN_ACK_ARRIVE);

        let output = `[${event.time}ms] ← ACK`;

        if (event === finAckEvents[finAckEvents.length - 1]) {
            output += '\n⛓️‍💥⛓️‍💥⛓️‍💥연결 종료⛓️‍💥⛓️‍💥⛓️‍💥!\n';
        }

        return output;
    }
}

export default BaseOutputFormatter;
