# Device Sync and Apigee API Proxy test files

This archive contains the API Proxy configuration files in the _devicesync-proxy/_ directory for setting up
an Apigee proxy to use with Atlas Device Sync. The _ApigeeTestApp/_ directory contains the "todo" iOS template
app that has been modified to work with the Apigee instance used for providing a demo of this capability.

The instructions below illustrate how this archive can be modified to work with your own template app and
Apigee instance.

## Setting up Atlas Device Sync

1. Follow the instructions for [Create an App Services App](https://www.mongodb.com/docs/atlas/app-services/apps/create/#std-label-create-app)
   to create a template App Services App with Device Sync.
2. Download the iOS template app. This can be used directly, or the contents of the _App/atlasConfig.plist_
   file will be needed for configuring the included sample iOS app.
3. Follow the instructions to set up and configure the Apigee API proxy below and return here once the IP
   address or hostname for the Apigee instance is available. The `clientApiBaseUrl` value from the
   _App/atlasConfig.plist_ file will be needed when setting up the API proxy (e.g. for the `US-VA`
   deployment model, this value is `https://us-east-1.aws.realm.mongodb.com`).
5. Update the _App/atlasConfig.plist_ file in your own template app or the ApigeeTestApp directory based
   on the following configuration:

```lang=xml
...
<dict>
	<key>appId</key>
	<string>DEVICE-SYNC-APP-ID</string>
	...
	<key>baseUrl</key>
	<string>APIGEE-HOSTNAME-AND-PATH</string>
	<key>clientApiBaseUrl</key>
	<string>https://us-east-1.aws.realm.mongodb.com</string>
	...
</dict>
</plist>
```

In the file contents above, the `DEVICE-SYNC-APP-ID` value can be found in the **App ID** field on the
main DeviceSync page. The `APIGEE-HOSTNAME-AND-PATH` value can be found in the Apigee instance
configuration as the values set for `apigee-host` and `apigee-prefix`, respectively. In the original
demo, this value was `https://34.111.234.31.nip.io/device-sync`, where `apigee-host` is 
`34.111.234.31.nip.io` and `apigee-prefix` value is `/device-sync`.

6. Double-click on the _.xcodeproj_ file in the iOS app to open it in XCode or open the directory
   directly in XCode.
7. Click the run button to start the app - an iOS Simulator will be started and the app will run in
   that window.
   
> NOTE: If the app has previously been run against Atlas Device Sync directly, the local realm file
> will need to be deleted or a new Simulator will need to be created (under Window->Devices and
> Simulators) and used for the new App run.

8. Start a new Debug Session in Apigee for the `devicesync-proxy` API Proxy so the flow through Apigee
   can be viewed.
9. In the iOS app, either create a new user or log in using an existing user. The original demo used
   the `testuser@test.com`|`t3stP4ss` or `testuser2@test.com`|`t3stP4ss` credentials.
10. In the Apigee Debug Session, the following message transfers should be seen:

    * GET request to the _**/location_ endpoint to retrieve the HTTP and WebSocket server addresses
      (this only occurs when the app is first started).
    * GET request to the _**/register_ endpoint if a new user is being created
    * GET request to the _**/login_ endpoint when the user logs in
    * POST request to the _**/profile_ endpoint to retrieve the user profile information
    * GET requests to the _**/realm-sync_ endpoint with a 101 response will be seen when a websocket
      is closed will be seen. These will be periodically while the app is running, likely due to an
      inactivity timeout imposed by Apigee. The websocket connection will be re-established by the
      iOS app after a second or two.

11. Create some new "todo" tasks by clicking the **+** button, entering an **Item Name** and clicking
    the **Save** button.
12. The new item will show in the main list and can be viewed in the `todo.item` Collection for the
    Deployment Database under the Data Services tab in the MongoDB portal.
13. Click the **Log Out** button to log out the current user.
14. In the Apigee Debug Session a DELETE message to the _**/session_ endpoint will be seen.

> NOTE: Due to Apigee rejecting the 204 DELETE response since it contains the `Accept-Encoding` header
> value, the Apigee Proxy configuration includes a `FaultRule` that will generate a "fake" 204 response
> that will be returned to the iOS App to confirm the logout operation.

## Setting up Apigee API Proxy

1. If an Apigee instance has not already been configured, follow the steps in
   [Get started in the Cloud Console](https://cloud.google.com/apigee/docs/api-platform/get-started/console-select-project)
   to set up your Apigee instance. If necessary, be sure to select the options to register a hostname
   and configure TLS for the instance.
2. In the _devicesync-proxy/apiproxy/resources/properties/devicesync.properties_ file, make the
   appropriate updates to match your Apigee and Atlas Device Sync configuration:

   * `apigee-host` - update this value to the hostname for your Apigee instance
   * `apigee-prefix` - update this value to your desired prefix for the API Proxy base path
   * `sync-host` - update this value to the MongoDB hostname that matches your Device Sync deployment
     model. This can be found in the `clientApiBaseUrl` value from the _App/atlasConfig.plist_ file if
     a new iOS template app was downloaded. (e.g. the `US-VA` deployment model would be
     `https://us-east-1.aws.realm.mongodb.com`)

3. If the `apigee-prefix` was changed from `device-sync`, the following two files must also be modifed:

   * _devicesync-proxy/apiproxy/proxies/default.xml_ - update the first part of the path in the
     `ProxyEndpoint`.`HTTPProxyConnection`.`BasePath` value to match the new `apigee-prefix` value.
   * _devicesync-proxy/apiproxy/devicesync-proxy.xml_ - update the first part of the path in the
     `APIProxy`.`BasePaths` value to match the new `apigee-prefix` value.

> NOTE: The remainder of the API Proxy base path (`/api/client/v2.0`) is required, since this is the
> first part of the path used by Device Sync client App when communicating with the server.

4. In a terminal window, cd to the _devicesync-apigee-test/devicesync-proxy/_ directory and run the
   _zip-devicesync-proxy.sh_ script to create a zip file containing the API Proxy configuration files.
5. In the Apigee Console window, select **API proxies** from the left hand menu and click the **CREATE**
   button to create a new proxy.
6. In the **Create a proxy** window, select the **Upload proxy bundle** template option, enter
   `devicesync-proxy` for the **Proxy name** and browse to the
   _devicesync-apigee-test/devicesync-proxy/devicesync-proxy.zip_ to upload the zip archive.
7. To automatically deploy the API Proxy for immediate use, click the **NEXT** button and select the
   environment to deploy the API Proxy. Otherwise, the **DEPLOY** button can be used on the API Proxy
   details page.

   



  
