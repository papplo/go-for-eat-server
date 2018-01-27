
# Go 4 Eat Server


Backend source files for Go 4 Eat App


<p align="center">
This backend supports Google and Facebook `OAuth2.0` authentication and provides DB for users and events
created by the app.

Follows the [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern.

</p>

## USE

+ Make sure you have an instance of **MongoDB** working on your local machine or remote server.

Clone and install the dependencies for the repo:

<code>
git clone git@github.com:sergipt/go-for-eat-server.git

yarn install
</code>

Then you have to create in the main folder a `.env` file with these keys:

```
MONGOLAB_URI=<mongodb host>
FACEBOOK_CLIENT=<Facebook client app code>
FACEBOOK_CLIENTSECRET=<Facebook client app secret>
GOOGLE_CONSUMERKEY=<Goggle app consumer key>
GOOGLE_CONSUMERSECRET=<Google app consumer secret>
```
Change the values accordingly to yours.

***
## API tester

+ [Postman collection](https://www.getpostman.com/collections/fe388c40163fa169bada)
  + Url pointing to Apiary - change accordingly
+ [Apiary mock server APIs](https://go4eat.docs.apiary.io/#reference)

## Tech Stack

+ **Monk** - MongoDB middleware
+ **dotenv** - Variable storing
+ **Axios** - External requests
+ **Koa** - Server middleware
  + **Kcors** - CORS handler
  + **Koa-bodyparser** - URI parameters parser
  + **Koa-logger**
  + **Koa-compress**
