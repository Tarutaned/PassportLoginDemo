# Passport JS Login Demo

This project is a demo of how to use Passport JS to login to a webapp

## Installation
```
git pull
npm i
```

## Environment Variable File
Create a file in the "config" folder.
Name the file "dev.env"
```
PORT=80
MONGODB_URL='mongodb://127.0.0.1:27017/YourDBName'
JWT_SECRET='alongstringwithabunchofrandomcharacters'
LDAP_URL='ldap://archiveadmin.proofpointdemo.com:389'
LDAP_bindDN='CN=Your CN,OU=Your OUR,DC=Your Domain,DC=com'
LDAP_bindCredentials=YourSecretPassowrd
LDAP_searchBase='DC=TheTopLevelofYourDomain,DC=com'
LDAP_searchFilter='(sAMAccountName={{username}})'
```

## Usage
Once npm packages are installed and the .env file is created, you can run the development environment with: 
```
npm run dev
```



## License
[MIT](https://choosealicense.com/licenses/mit/)