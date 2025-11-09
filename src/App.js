import BasicSimulator from './BasicSimulator.js';
import { SPEED_MODE } from './constants.js';

const simulator = new BasicSimulator(10000, 80, 100, SPEED_MODE.SLOW);
simulator.planSimulation();
await simulator.run();
