import BasicSimulator from './BasicSimulator.js';
import CongestionControlSimulator from './CongestionControlSimulator.js';
import { SPEED_MODE, TCP } from './constants.js';
import FlowControlSimulator from './FlowControlSimulator.js';

const simulator = new BasicSimulator(10000, 80, 100, SPEED_MODE.SLOW);
simulator.planSimulation();
// await simulator.run();
const flowControlSimulator = new FlowControlSimulator(20000, 10, 100, SPEED_MODE.FAST, TCP.MSS * 10, TCP.MSS * 3);
flowControlSimulator.planSimulation();
// await flowControlSimulator.run();

const congestionControlSimulator = new CongestionControlSimulator(20000, 10, 100, SPEED_MODE.INSTANT, 1);
congestionControlSimulator.planSimulation();
await congestionControlSimulator.run();
