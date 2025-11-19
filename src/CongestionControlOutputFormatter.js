import BaseOutputFormatter from './BaseOutputFormatter.js';
import { EVENT_TYPE } from './constants.js';

class CongestionControlOutputFormatter extends BaseOutputFormatter {
    format(event) {
        switch (event.type) {
            case EVENT_TYPE.WINDOW_SEND_START:
                return this._formatWindowSendStart(event);
            case EVENT_TYPE.CWND_UPDATE:
                return this._formatCwndUpdate(event);
            case EVENT_TYPE.STATE_CHANGE:
                return this._formatStateChange(event);
            case EVENT_TYPE.FAST_RECOVERY:
                return this._formatFastRecovery(event);
            case EVENT_TYPE.TIMEOUT_CONGESTION:
                return this._formatTimeoutCongestion(event);
            case EVENT_TYPE.FAST_RETRANSMIT:
                return this._formatFastRetransmit(event);
            case EVENT_TYPE.PACKET_SEND:
                return this._formatPacketSend(event);
            case EVENT_TYPE.DUPLICATE_ACK:
                return this._formatDuplicateAck(event);
            default:
                return super.format(event);
        }
    }

    _formatWindowSendStart(event) {
        const ssthreshDisplay = event.data.ssthresh === Infinity ? '∞' : `${event.data.ssthresh}B`;

        return [
            `\n[${event.time}ms] 📦 Window 전송 시작 [${event.data.state}]`,
            `          cwnd: ${event.data.cwnd}B (${event.data.cwndPackets} packets)`,
            `          ssthresh: ${ssthreshDisplay} (${event.data.ssthreshPackets} packets)`,
            `          → Packet#${event.data.startPacketId} ~ #${event.data.endPacketId} (${event.data.windowSize} packets)`,
        ].join('\n');
    }

    _formatCwndUpdate(event) {
        const ssthreshDisplay = event.data.ssthresh === Infinity ? '∞' : `${event.data.ssthresh}B`;

        return [
            `[${event.time}ms] 📈 cwnd 업데이트: ${event.data.oldCwnd}B → ${event.data.newCwnd}B (${event.data.cwndPackets} packets)`,
            `          [${event.data.state}] ssthresh: ${ssthreshDisplay} (${event.data.ssthreshPackets} packets)`,
        ].join('\n');
    }

    _formatStateChange(event) {
        return [
            `[${event.time}ms] 🔄 상태 전환: ${event.data.from} → ${event.data.to}`,
            `          cwnd: ${event.data.cwnd}B, ssthresh: ${event.data.ssthresh}B`,
        ].join('\n');
    }

    _formatFastRecovery(event) {
        const oldSsthreshDisplay = event.data.oldSsthresh === Infinity ? '∞' : `${event.data.oldSsthresh}B`;

        return [
            `[${event.time}ms] ❤️‍🩹❤️‍🩹❤️‍🩹 Fast Recovery 진입 (3 Duplicate ACKs) ❤️‍🩹❤️‍🩹❤️‍🩹`,
            `          ssthresh: ${oldSsthreshDisplay} → ${event.data.newSsthresh}B`,
            `          cwnd: ${event.data.oldCwnd}B → ${event.data.newCwnd}B`,
            `          손실 패킷: ${event.data.packet.getPacketInfo()}`,
        ].join('\n');
    }

    _formatTimeoutCongestion(event) {
        const oldSsthreshDisplay = event.data.oldSsthresh === Infinity ? '∞' : `${event.data.oldSsthresh}B`;

        return [
            `[${event.time}ms] ⏰⏰⏰ Timeout으로 인한 혼잡 감지 ⏰⏰⏰`,
            `          ssthresh: ${oldSsthreshDisplay} → ${event.data.newSsthresh}B`,
            `          cwnd: ${event.data.oldCwnd}B → ${event.data.newCwnd}B (Slow Start 재시작)`,
            `          손실 패킷: ${event.data.packet.getPacketInfo()}`,
        ].join('\n');
    }

    _formatFastRetransmit(event) {
        return `[${event.time}ms] ⚡ 3 Duplicate ACK로 인한 Fast Retransmit: ${event.data.packet.getPacketInfo()}`;
    }

    _formatPacketSend(event) {
        return `[${event.time}ms] Send: ${event.data.packet.getPacketInfo()} [cwnd: ${event.data.cwnd}B, ${
            event.data.state
        }]`;
    }

    _formatDuplicateAck(event) {
        return `[${event.time}ms] ⚠️  Duplicate ACK: ${event.data.ack} (기다리는 패킷: #${event.data.packet.id})`;
    }
}

export default CongestionControlOutputFormatter;
