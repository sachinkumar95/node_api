# node_api

## run npm install inside folder..and then type npm start to start code..
## containing apis are -
### create/update/delete user
### login user
### forget/reset password

## create user (POST): /user/createUser
### json to send {"firstName":"","lastName":"","email":"","address":"","password":""}
## update user (PUT): /user/updateUser/:id
### json to send {"firstName":"","lastName":"","email":"","address":""}
## delete user (DELETE): /user/deleteUser/:id
### json to send 
## login user (POST): /user/createUser
### json to send {"email":"","password":""}
## forget password (POST): /user/forgetPassword
### json to send {"email":""}
## reset password (POST): /user/resetPassword
### json to send {"resetKey":"","password":""}
