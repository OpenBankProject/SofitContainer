document.addEventListener('deviceready', onDeviceReady, false);
let correlated_user_id = '';
let user_details = {}

function onDeviceReady() {

    /** param {[string]} direct_login_token The generated token used to log in to the Sofit app. */
    createNewDirectLoginToken();
}

/**  * This function retrieves the direct login token from  local storage
 //   * @param {string } token- fetch token from memory */
function getDirectLoginToken() {
    if (localDirectLoginTokenIsValid()) {
        return window.localStorage.getItem("token")
        //direct_login_token

    } else {
        //
        let tvalue = undefined; //Placeholder
        createNewDirectLoginToken().then(value => {
            tvalue = value
        })
        return tvalue;

    }
}


/** This function checks if the token is valid or not.
 GUARD: 1.  Two options are available for token validation.
 -Token should be present in memory or expired.
 -Generation of the token by an invalid user.
 2. If the token is valid, then call the API for get the current login user */

function
localDirectLoginTokenIsValid() {

    if (directLoginTokenExistIsLocally()) { // if it exists locally, do this.
        cordova.plugin.http.setDataSerializer('json');
        //Set the Header parameter for Post request
        //cordova.plugin.http.setHeader('Authorization', `DirectLogin token = "${window.localStorage.getItem("token")}"`);
        cordova.plugin.http.setHeader("Content-Type", 'application/json ');

        //Post request create, leave body and header section empty because defined above
        cordova.plugin.http.post('https://apisandbox.openbankproject.com/obp/v4.0.0/users/current', {'Authorization': `DirectLogin token = "${window.localStorage.getItem("token")}"`}, {}, function (response) {
            if (response.status == 200) {
                let user_data = JSON.parse(response.data)
                correlated_user_id = user_data.user_id;
                window.localStorage.setItem('correlated_user_id', correlated_user_id)
            }
            return true
        }, function (response) {

            return false
        });

    } else {
        return false
    }
}

//This function checks whether the token is existing in local memory/storage or not. If the token is exit, the endpoint is called and the current login user. is returned
function directLoginTokenExistIsLocally() {
    if (window.localStorage["token"]) {
        console.log(`token exists locally: ${window.localStorage.getItem('token')}`)
        return true
    } else {
        console.log("token does not exist locally.")
        return false
    }

}

/** Call the function to create a new token.
 1. call the API and return the direct login token. */
async function createNewDirectLoginToken() {

    let user = await createNewUser();
    user_details = user

    openSofit()
   // return generatedToken(user.username, user.password)
    //return generatedToken("vishal@gmail.com", "vishal108")


}

/** This function creates a new user.
 * @param {[object]} json Set the http request type json. */
function createNewUser() {
    console.log("Creating a new user")
    return new Promise((resolve, reject) => {
        cordova.plugin.http.setDataSerializer('json');
        // get unique id to create user : uuid
        const uuid_string = device.uuid;


        // creating user info based on the uuid
        const createUserOptions = {
            method: 'post',
            data: {
                "email": uuid_string + "@example.com",
                "username": uuid_string ,
                "password": uuid_string ,
                "first_name": uuid_string,
                "last_name": uuid_string
            }
        };
        cordova.plugin.http.sendRequest('https://test.openbankproject.com/obp/v4.0.0/users', createUserOptions, function (response) {

            // Successfull user creation
            if (response.status == 201) {
                let user_data = JSON.parse(response.body)
                correlated_user_id = user_data.user_id;
                window.localStorage.setItem('correlated_user_id', correlated_user_id)


            }

            resolve(createUserOptions.data)

        }, function (response) {


            if (response.status == 409) {
                // showPopUp("user Already Exist, User name : " + createUserOptions.data.username + " . Resuming to Sofit app", () => {
                //     return createUserOptions.data
                // })
                //user already exists, get their userId another way.


                resolve(createUserOptions.data)
            }
        });


    })

}


/** The token is stroed in local memory after generation. */
function storeNewDirectLoginToken(token) {
    var storage = window.localStorage;
    storage.setItem("token", token)
    // showPopUp("Token from storage: " + storage.getItem("token"))
    return token
}


/** This is used for the creation of a new token. */
function generatedToken(username, password) {

    const consumer_key = "ohtsn3z4arhmkskg3vkq52xeaq1lny1pilaxv2mm"
    cordova.plugin.http.setDataSerializer('json');
    //Set the header parameter for the post request.
    cordova.plugin.http.setHeader('Authorization', "DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"");
    navigator.notification.confirm("DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"", onConfirm)
    cordova.plugin.http.setHeader("Content-Type", 'application/json ');
    //Create the post request, leave the body and header section empty as it was defined above.
    cordova.plugin.http.post('https://test.openbankproject.com/my/logins/direct', {}, {}, function (response) {

        //Convert JSON object to text format
        const res = JSON.parse(response.data)
        console.log(`positive response: ${response.status}`)
        console.log(`positive response: ${res.token}`)

        // showPopUp(res.token);

        return storeNewDirectLoginToken(res.token)

    }, function (response) {
        console.log(`negative response: ${response.status}`)
        // showPopUp(response);
    });

}

function onConfirm(button) {
    console.log("User selected: " + button)

}

/** The last step, is to open the Sofit App with user ID. */
function openSofit() {
    //todo

    ref = cordova.InAppBrowser.open('https://test.openbankproject.com/user_mgt/login', '_blank', 'location=no');
    if (user_details.hasOwnProperty('username')){
    ref.addEventListener('loadstop', () => {
        ref.executeScript({
            code: "\
            document.getElementById(\"username\").value = \'" + user_details.username + "\';\
             document.getElementById(\"password\").value = \'" + user_details.password + "\';\
             document.getElementsByClassName(\"submit\")[0].click();\
            ;"
        })
       cordova.InAppBrowser.open(`https://test-sofit.openbankproject.com?correlated_user_id=${correlated_user_id}`,'_blank', 'location=no')
    })


    }else {
        console.log("User details not yet initialized")
    }
    // cordova.InAppBrowser.open(`https://test-sofit.openbankproject.com?correlated_user_id=${correlated_user_id}`,'_blank', 'location=no');


}












