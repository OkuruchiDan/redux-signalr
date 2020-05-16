import * as signalR from "@microsoft/signalr";
import { SignalMiddleware, MiddlewareConfig } from './types';

const signal = ({ callbacks, onStart = () => { }, url, logLevel = signalR.LogLevel.Error, connectionOptions = {} }: MiddlewareConfig): SignalMiddleware => store => {
    
    const connection = new signalR.HubConnectionBuilder()
        .configureLogging(logLevel)
        .withUrl(url, connectionOptions)
        .build();

    const { callbackMap } = callbacks;
    for (const [name, callback] of callbackMap) {
        connection.on(name, (...args) => {
            callback.call(null, ...args).call(store, store.dispatch.bind(store));
        });
    }

    connection.start().then(function () {
        onStart();
    }).catch(function (err) {
        return console.error(err.toString());
    });

    return next => action =>
        typeof action === 'function'
            ? action(store.dispatch.bind(store), store.getState.bind(store), connection.invoke.bind(connection))
            : next(action)
}

export default signal;