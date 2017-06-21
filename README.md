# Captive Portal
A **Node.js** &amp; **MediaStream Recording** Captive Portal Web App to use
with **CoovaChilli**

## What is this?
This is a captive portal service designed to serve as landing page and login process
for a CoovaChilli implementation. It uses Node.js as the backend and the MediaStream
Recording API and the JSON interface provided by CoovaChilli for client management.

### How does it work?
pending


## How can I try this on my machine?
For it to work you will need the following:

- **A working installation of CoovaChilli and the AAA manager it needs to function.** If you
happen to be trying this on a Raspberry Pi with Raspbian OS, I recommend using the script
provided by GitHub user Pi Home Server at
[this repository](https://github.com/pihomeserver/Pi-Hotspot-Script) to have all of this up
and running in a snap!

- **Node.js and a few NPM packages.** This service uses Node.js with the Express and Formidable
packages. You can install the LTS or the latest version of Node and NPM following the
instructions at their [website](https://nodejs.org/).

- **A browser compatible with MediaStream Recording.** This captive portal service makes use
of the MediaStream Recording API, which means that only clients using 

## Sources
- Web Development with Node &amp; Express, by Ethan Brown
- http://coova.github.io/CoovaChilli/JSON/
- https://github.com/pihomeserver/Pi-Hotspot-Script
- https://github.com/coova/coova-chilli

[//]: # "- https://stackoverflow.com/questions/5009324/node-js-nginx-what-now"
[//]: # "- https://carlosazaustre.es/blog/como-configurar-nginx-con-node-js-en-produccion/"

