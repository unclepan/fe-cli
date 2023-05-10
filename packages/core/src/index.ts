import fs from 'fs';
import log from '@ccub/cli-utils';

console.log(fs);

console.log(log);


function core() {
    return "Hello from core1";
}

const a  = core();

console.log(a);

