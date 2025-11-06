export const TCP = {
    MSS: 1460,
    ISN_MIN: 1000,
    ISN_MAX: 9999,
    DUPLICATE_ACK_THRESHOLD: 3,
};

export const SIMULATION_MODE = {
    BASIC: 'BASIC',
    FLOW_CONTROL: 'FLOW_CONTROL',
    CONGESTION_CONTROL: 'CONGESTION_CONTROL',
};

export const SPEED_MODE = {
    INSTANT: 'INSTANT',
    FAST: 'FAST',
    SLOW: 'SLOW',
};

export const SPEED_RATIO = {
    INSTANT: 0,
    FAST: 0.1,
    SLOW: 1.0,
};

export const EVENT_TYPE = {
    // 3-way handshake connection
    SYN_SEND: 'SYN_SEND',
    SYN_ARRIVE: 'SYN_ARRIVE',
    SYN_ACK_SEND: 'SYN_ACK_SEND',
    SYN_ACK_ARRIVE: 'SYN_ACK_ARRIVE',
    ACK_SEND: 'ACK_SEND',

    // 일반적인 data 전송
    PACKET_SEND: 'PACKET_SEND',
    PACKET_ARRIVE: 'PACKET_ARRIVE',
    PACKET_LOSS: 'PACKET_LOSS',

    // ACK
    DATA_ACK_SEND: 'DATA_ACK_SEND',
    DATA_ACK_ARRIVE: 'DATA_ACK_ARRIVE',

    // 재전송
    TIMEOUT: 'TIMEOUT',
    RETRANSMIT: 'RETRANSMIT',

    // 4-way handshake termination
    FIN_SEND: 'FIN_SEND',
    FIN_ARRIVE: 'FIN_ARRIVE',
    FIN_ACK_SEND: 'FIN_ACK_SEND',
    FIN_ACK_ARRIVE: 'FIN_ACK_ARRIVE',
};
