if (context.flow=="PROXY_REQ_FLOW") {
    // Save the original request URI to the 'info.uri' flow variable
    var uri = context.getVariable("request.uri");
    context.setVariable("info.uri", uri);
}

if (context.flow=="TARGET_REQ_FLOW") {
    // The name of the TargetEndpoint being executed (default or websocket)
    var targetName = context.getVariable("target.name");
    // Property value for the Device Sync host
    var syncHost = context.getVariable("propertyset.devicesync.sync-host");
    // Property value for the apigee API proxy prefix, which will be removed
    var prefix = context.getVariable("propertyset.devicesync.apigee-prefix");
    // Contains the original request URI value - remove the apigee prefix
    var uri = context.getVariable("info.uri").replace("/" + prefix, "");
    // Build the target.url based on original request uri and target name
    if (targetName == "websocket") {
        context.setVariable("target.url", "wss://ws." + syncHost + uri);
    }
    else {
        context.setVariable("target.url", "https://" + syncHost + uri);
    }
}