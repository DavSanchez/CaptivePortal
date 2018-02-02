# Audio-Login Portal
A **Node.js** &amp; **MediaStream Recording** Captive Portal Web App to use
with **CoovaChilli**.

## What is this?
This is a captive portal service designed to serve as landing page and login process
for a CoovaChilli hotspot implementation. It uses Node.js as the backend and the MediaStream
Recording API and the JSON interface provided by CoovaChilli for client management.
is
**It's still an unstable version subject to immediate changes!** This was
developed as part of the final project for my Degree in Telecommunication Technology Engineering, studied
at [ULPGC](https://www.ulpgc.es/).

### How does it work?
When an user tries to connect to a network guarded by CoovaChilli a captive portal comes up
served by the Node backend. This landing page will ask the user for permissions to use their
location and microphone. If permissions are granted and the Connect button is clicked a
3-second piece of audio will be recorded and sent to the server, with the user location and timestamp in
its name. When this audio is received by the node server, the captive portal will ask the
server for the credentials with which it will connect that user to CoovaChilli through its JSON
interface. Once the credentials are received the captive portal attempts the login process to
give network access to the user. In this way, you can avoid the tedious form-filling process that almost always comes up when entering a WiFi network with a traditional captive portal service!

## How can I try this on my machine?
For it to work you will need the following:

- **A working installation of CoovaChilli and the AAA manager it needs to function.** The original installation in which this Web App is working uses FreeRADIUS (with daloRADIUS as UI manager), all of them running on a Raspberry Pi. Of course, for CoovaChilli to work your device needs at least two network interfaces!

- **The users on your AAA manager and the files `./users/users.json` and `./users/usersOneTime.json` have to be the same!** The IDs don't
matter provided they are greater than 0. Initially, their `isActive` value must be `false`, as
everyone is disconnected from the service at the beginning.

- **Node.js and a few NPM packages.** This service uses Node.js with the Express, Formidable and Body-Parser
packages for the backend (among others, chech the beginning of the file `nodeserver.js`). You can install the LTS or the latest version of Node and NPM
following the instructions at their [website](https://nodejs.org/).

- **A browser compatible with MediaStream Recording.** This captive portal service makes use
of the MediaStream Recording API to record audio, which means that only clients using browsers
that support this API (currently Firefox and Chrome-based browsers) will be able to get past the landing page
and be granted network access. Let's hope time treats this API well and gives support for it on
all other browsers too!

Once all of this is set, you will only need to edit the CoovaChilli configuration file `/etc/chilli/config`
(created by copying and renaming `/etc/chilli/defaults`) changing the following attributes:

- `HS_UAMSECRET`: Leave it blank.
- `HS_UAMSERVER`: The IP of the node server's location (for example `192.168.1.5`). You can find that IP running `ifconfig` on the device and checking the network interface that you used when configuring CoovaChilli's WAN interface.
- `HS_UAMFORMAT`: The complete node server root URL (stored in the previous attribute), port
included (for example `http://\$HS_UAMSERVER:3000` if the node server uses the default port).

### HTTPS configuration

To use a secure context (needed for `getUserMedia()` to work) you also need to enable HTTPS both in the Web App and in CoovaChilli itself. The former is already done in this code, to do do the latter modify the following `/etc/chilli/config` fields like this:

- `HS_UAMFORMAT`: Remember to use https in place of http for proper redirect.
- `HS_REDIRSSL`: Set to `on`.
- `HS_SSLKEYFILE`: The route to your SSL key file.
- `Hs_SSLCERTFILE`: The route to your SSL certificate file.

The above fields (and the options passed to the HTTPS Node server in the code) use a valid SSL key and certificate. you can generate them with `openSSL`, [Let's Encrypt](https://letsencrypt.org) or another service of your choice. You can place these files in the `ssl` folder and then reference them both in the Web App (as suggested in the code) and in CoovaChilli's configuration file.

**WARNING!** If you use self-signed SSL certificates your browser will issue a rather ugly security warning, alerting you of this when you try the system. For testing purposes, you can add exceptions on your browsers for both the IP used by the Captive Portal Web App (the one used in the `HS_UAMSERVER` field) and CoovaChilli's UAM interface IP (if you did not change it, `1.0.0.1`).

If you have any doubts, suggestions or problems with this just let me know by opening an issue.
I'll do my best to provide an answer!

## Sources
- Web Development with Node &amp; Express, by Ethan Brown
- http://coova.github.io/CoovaChilli/JSON/
- https://github.com/coova/coova-chilli
- https://help.ubuntu.com/community/WifiDocs/CoovaChilli
- ... and many more!

[//]: # "- https://stackoverflow.com/questions/5009324/node-js-nginx-what-now"
[//]: # "- https://carlosazaustre.es/blog/como-configurar-nginx-con-node-js-en-produccion/"
