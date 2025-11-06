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
