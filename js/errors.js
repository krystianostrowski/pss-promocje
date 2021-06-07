const notifier = require("./EventSystem");

const ErrorHandler = () => {
    console.log('test');
    notifier.on('handle-error', args => {
        console.log("Test Error");
        console.log(args);
    });
}

module.exports.ErrorHandler = ErrorHandler;