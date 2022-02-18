/**
                    Open Bank Project Sofit Container
                    Copyright (C) 2021-2022, TESOBE GmbH.

                    This program is free software: you can redistribute it and/or modify
                    it under the terms of the GNU Affero General Public License as published by
                    the Free Software Foundation, either version 3 of the License, or
                    (at your option) any later version.

                    This program is distributed in the hope that it will be useful,
                    but WITHOUT ANY WARRANTY; without even the implied warranty of
                    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
                    GNU Affero General Public License for more details.

                    You should have received a copy of the GNU Affero General Public License
                    along with this program.  If not, see <http://www.gnu.org/licenses/>.

                    Email: contact@tesobe.com
                    TESOBE GmbH.
                    Osloer Strasse 16/17
                    Berlin 13359, Germany

                    http://www.tesobe.com
                    */

/** Wait for the deviceready event before using any of Cordova's device APIs. The Deviceready event fires when Cordova is fully loaded*/
document.addEventListener('deviceready', onDeviceReady, false)
const consumer_key = 'xznnnce3pn3v5lddyayuiphc1cvm25fykx1y034l'
const SOFIT_HOST = 'https://includimi-sofit.tesobe.com'
const OBP_API_HOST = 'https://includimi.tesobe.com'
//Token will expire within 4 Weeks
let token_life = 27 * 24 * 60 * 60 * 1000

function setDebugInfo(text) {
    debugInfo = document.getElementById("debugInfo")
    debugInfo.innerHTML = debugInfo.innerHTML + " --- " + text;
}

/** For each event handler registered after the deviceready event fires has its callback function called immediately. */
function onDeviceReady() {
    setDebugInfo("Hello from onDeviceReady ")
    //let correlated_username = window.localStorage.getItem('username')
    //let correlated_password = window.localStorage.getItem('password')
    //let correlated_user_id = window.localStorage.getItem('correlated_user_id')
    if (directLoginTokenExistsLocally() && directLoginTokenIsFresh() && localDirectLoginTokenIsValid()) {
        // No need to get Direct Login Token.
        setDebugInfo("All good")
    } else {
        setDebugInfo("no token")
        if (correlatedUserExistsLocally(getCorrelatedUserName(), getCorrelatedPassword(), getCorrelatedUserId())) {
            // No need to create User
            // Just create a new Token. (In the future we can also check if the User is valid i.e. not locked etc.)
            setDebugInfo("before createAndStoreNewToken")
            createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword())
            setDebugInfo("after createAndStoreNewToken")
        } else {
            //do not need populate the variable

            if (createNewUser()) {
                setDebugInfo("before createAndStoreNewToken ")
                // if user_id does not exist in local storage that means user has not register or new user then call function create new user().
                createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword())
                setDebugInfo("after createAndStoreNewToken")
            } else {
                return 'error'
            }
            //check properly
        }
    }
    //openSofit(getCorrelatedUserId())
    setDebugInfo("bye from onDeviceReady ")
}

function getCorrelatedUserName() {
    setDebugInfo("Hello from getCorrelatedUserName")
    return window.localStorage.getItem('correlated_username')
}

function getCorrelatedPassword() {
    setDebugInfo("Hello from getCorrelatedPassword")
    return window.localStorage.getItem('correlated_password')
}

function getCorrelatedUserId() {
    setDebugInfo("Hello from getCorrelatedUserId")
    return window.localStorage.getItem('correlated_user_id')
}

/** This function will check the validity of the token.
           - It will return  boolean value - if token tokenDuration is less than token date, then it will return true. */
function directLoginTokenIsFresh() {
    setDebugInfo("Hello from directLoginTokenIsFresh")
    let date_token_generated = window.localStorage.getItem('date_token_generated')
    let tokenDuration = date_token_generated + token_life
    let today_date = new Date().getTime()
    return tokenDuration < today_date
    setDebugInfo("Bye from directLoginTokenIsFresh")

}

/** This function will check, User weather stored in exists in local storage or not with defined parameters. */
function correlatedUserExistsLocally(username, password, correlated_user_id) {
    setDebugInfo("Hello from correlatedUserExistsLocally")
    setDebugInfo("Username:" + username)
    setDebugInfo("password:" + password)
    setDebugInfo("correlated_user_id:" + correlated_user_id)
    if (username && password && correlated_user_id) {
        setDebugInfo("correlatedUserExistsLocally will return true")
        return true
    } else {
        setDebugInfo("correlatedUserExistsLocally will return false")
        return false
    }
}

/** This function checks if the token is valid or not.
          GUARD: 1.  Two options are available for checking the token validation.
                      -The token should be present or expired in the local storage.
                      -Generation of the token by an invalid user.
                2. If the token is valid, call the API to get the current login user. */
function localDirectLoginTokenIsValid() {
    setDebugInfo("Hello from localDirectLoginTokenIsValid")
    if (directLoginTokenExistsLocally()) {
        cordova.plugin.http.setDataSerializer('json')
        //Set the Header parameter for the Post request
        cordova.plugin.http.setHeader(
            'Authorization',
            `DirectLogin token = "${window.localStorage.getItem(
        'direct_login_token',
      )}"`,
        )
        cordova.plugin.http.setHeader('Content-Type', 'application/json ')
        //Post request create, leave body and header section empty because defined above
        cordova.plugin.http.get(
            `${OBP_API_HOST}/obp/v4.0.0/users/current`, {}, {},
            function(response) {
                setDebugInfo("directLoginTokenExistsLocally will return true")
                return true
            },
        )
    } else {
        setDebugInfo("localDirectLoginTokenIsValid will return false")
        return false
    }
    setDebugInfo("Bye from localDirectLoginTokenIsValid")
}

/** This function checks whether the token is exists in local local storage or not. If the token is present, the endpoint is called and the current login user is returned. */
function directLoginTokenExistsLocally() {
    setDebugInfo("Hello from directLoginTokenExistsLocally")
    if (window.localStorage['direct_login_token']) {
        return true
    } else {
        return false
    }
}

/** Call the function to create a new token.
          1. call the API and return the direct login token. */
function createNewDirectLoginToken() {
    setDebugInfo("Hello from createNewDirectLoginToken")
    createNewUser()
}

/** This function creates a new user.
 * @param {[object]} json Set the http request type json. */
async function createNewUser() {
    setDebugInfo("Hello from createNewUser")
    const res = await new Promise((resolve, reject) => {
        cordova.plugin.http.setDataSerializer('json')
        // get unique id to create user : uuid
        const uuid_string = device.uuid + "Simon"
        // These lines of code will generate a dynamic password with long string.
        var randomLongStringPassword = ''
        var characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        var charactersLength = characters.length
        for (var i = 0; i < 20; i++) {
            randomLongStringPassword += characters.charAt(
                Math.floor(Math.random() * charactersLength),
            )
        }

        // creating user info based on the uuid
        setDebugInfo("Before create createUserOptions")
        const createUserOptions = {
            method: 'post',
            data: {
                email: uuid_string + '@example.com',
                username: uuid_string,
                password: randomLongStringPassword,
                first_name: uuid_string,
                last_name: uuid_string,
            },
        }
        // Creating a user, token, if user already exists:
        setDebugInfo("Before send request")
        cordova.plugin.http.sendRequest(
            `${OBP_API_HOST}/obp/v4.0.0/users`,
            createUserOptions,
            function(response) {
                // Successful user creation
                if (response.status == 201) {
                    setDebugInfo("Status is 201")
                    let user_data = JSON.parse(response.body)
                    window.localStorage.setItem('correlated_user_id', user_data.user_id)
                    window.localStorage.setItem('correlated_username', user_data.username)
                    window.localStorage.setItem('correlated_password', user_data.password)
                    window.localStorage.setItem('date_token_generated', new Date().getTime())
                    resolve(createUserOptions.data)
                } else {
                    reject(createUserOptions.data)
                    setDebugInfo("Status is : ", + response.status)
                }

            },
            function(response) {
                setDebugInfo("Error in createNewUser", + response.code)
            }
        )
    })
    if (res) {
        setDebugInfo("createNewUser will return true")
        return true
    } else {
        setDebugInfo("createNewUser will return false")
        return false
    }
    setDebugInfo("Bye from createNewUser")

}

/** The token is stored in local memory after generation. */
function storeNewDirectLoginTokenWSE(token) {
    setDebugInfo("Hello from storeNewDirectLoginTokenWSE")
    var storage = window.localStorage
    storage.setItem('direct_login_token', token)
    return token
    setDebugInfo("Hello bye storeNewDirectLoginTokenWSE")
}

/** This is used for the creation of a new token. */
function createAndStoreNewToken(username, password) {
    setDebugInfo("Hello from createAndStoreNewToken")
    setDebugInfo("username is: " + username)
    setDebugInfo("password is: " + password)

    cordova.plugin.http.setDataSerializer('json')
    //Set the header parameter for the post request.
    //update value in direct login
    cordova.plugin.http.setHeader(
        'Authorization',
        `DirectLogin username=${username} , password= ${password}, consumer_key= + consumer_key`,
    )
    cordova.plugin.http.setHeader('Content-Type', 'application/json ')
    //Create the post request, leave the body and header section empty as it was defined above.
    setDebugInfo("Before call directlogin API in createAndStoreNewToken")
    cordova.plugin.http.post(
        `${OBP_API_HOST}/my/logins/direct`, {}, {},
        function(response) {
            setDebugInfo("After call directlogin API in createAndStoreNewToken")
            //Convert JSON object to text format
            const res = JSON.parse(response.data)
            return storeNewDirectLoginToken(res.token)
        },
        function(response) {
            setDebugInfo("Error in createAndStoreNewToken", +response.code)
        }
    )
    setDebugInfo("Bye from createAndStoreNewToken")
}

/** This function is used to open the Sofit App with user ID. */
function openSofit(user_id) {
    setDebugInfo("Hello from openSofit")
    window.open = cordova.InAppBrowser.open(
        `${SOFIT_HOST}?correlated_user_id = ${user_id}`,
        '_blank',
        'location=no',
    )
    setDebugInfo("Bye from openSofit")
}