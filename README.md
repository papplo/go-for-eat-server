# Go-4-eat-server

Backend source files for Go 4 Eat App

This backend supports Google and Facebook OAuth2.0 authentication and provides DB for users and events
created by the app.

***
## USE

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
Change the values accordingly with yours.

***
## API tester

+ [Postman collection](https://www.getpostman.com/collections/fe388c40163fa169bada)
+ [Apiary mock server APIs](https://go4eat.docs.apiary.io/#reference)