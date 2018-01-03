const bunyan = require('bunyan');
const SumoLogger = require('bunyan-sumologic');

const ConsoleStream = require('./consoleStream');

function createLogger(env) {
    const streams = [
        {
            stream: new ConsoleStream(),
            type: 'raw',
        },
    ];

    if (env.cfg.sumologic) {
        streams.push({
            stream: new SumoLogger(env.cfg.sumologic),
            type: 'raw',
        });
    }

    env.log = bunyan.createLogger({
        level: bunyan.TRACE,
        name: env.name,
        serializers: bunyan.stdSerializers,
        streams,
    });

    return env.log;
}

module.exports = createLogger;
