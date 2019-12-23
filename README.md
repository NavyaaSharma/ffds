# ffds
Fully flexible dating system
# JSON RESPONSES 

## https://ffds-new.herokuapp.com/register?email={user email}&name={user name}&gender={gender}&password={password}
json response - Registered Succesfully
### if user email already exists then
json response - User already exists

## https://ffds-new.herokuapp.com/send?mailto={user email}  (for sending emails for verification)
### if mail is sent
json response - sent
### if mail couldnt be sent
json response - error

## https://ffds-new.herokuapp.com/verifyemail?email={user email}
### if email is verified then
json response - email is verified
### if email is not verified
json response - email not verified

## https://ffds-new.herokuapp.com/login?email={user email}&password={user password}
### if email doesnt exist
json response - User not found
### if password doesnt match
json response - Invalid Password
### when credentials are correct and user is logged in
json response - {
                        response:'Login successful',
                        name:username,
                        email:user email
                    }