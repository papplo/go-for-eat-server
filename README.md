
<h1 align="center">Go 4 Eat Server</h1>
<div align="center">
<img src="https://github.com/sergipt/go-for-eat-server/blob/feature/documentation/assets/appIcone.png?raw=true">
</div>

# Backend source files for Go 4 Eat App

<div align="center">
This backend supports Google and Facebook `OAuth2.0` authentication and provides DB for users and events
created by the app.
</div>

# USE

+ Make sure you have an instance of **MongoDB** working on your local machine or remote server.

Clone and install the dependencies for the repo:

<code>
git clone git@github.com:sergipt/go-for-eat-server.git

yarn install
</code>

Then you have to create in the main folder a `.env` file with these keys:
<div align="center">

```dotenv
MONGOLAB_URI=<mongodb host>
FACEBOOK_CLIENT=<Facebook client app code>
FACEBOOK_CLIENTSECRET=<Facebook client app secret>
GOOGLE_CONSUMERKEY=<Goggle app consumer key>
GOOGLE_CONSUMERSECRET=<Google app consumer secret>
```

</div>

Change the values accordingly to yours.

***
Follows the [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern.
***

## API tester

+ [Postman collection](https://www.getpostman.com/collections/fe388c40163fa169bada)
  + Url pointing to Apiary - change accordingly
+ [Apiary mock server APIs](https://go4eat.docs.apiary.io/#reference)

## Tech Stack

+ **Monk** - [The wise MongoDb API](https://github.com/Automattic/monk)
+ **dotenv** - [Loads enviromnet variables from .env for nodejs projects](https://github.com/motdotla/dotenv)
+ **Axios** - [Promise client for node.js](https://github.com/axios/axios)
+ **Koa** - [Web framework for node.js](http://koajs.com/)
  + **Kcors** - CORS handler
  + **Koa-bodyparser** - [A body parser for koa, base on co-body.](https://github.com/koajs/bodyparser)
  + **Koa-logger** - [Development style loggin middleware](https://github.com/koajs/logger)
  + **Koa-compress** - [Compress middleware for Koa](https://github.com/koajs/compress)

## External resources

|      Mlab     | Travis-CI     |
| ------------- |:-------------:|
| Remote MongoDb instance      | Continous Deployment Tool |
| [travis-ci.org](travis-ci.org)      | [mlab.com](https://www.mlab.com)      |