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


/** For each event handler registered after the deviceready event fires has its callback function called immediately. */
function onDeviceReady() {
    //let correlated_username = window.localStorage.getItem('username')
    //let correlated_password = window.localStorage.getItem('password')
    //let correlated_user_id = window.localStorage.getItem('correlated_user_id')
    if (directLoginTokenExistsLocally() && directLoginTokenIsFresh() && localDirectLoginTokenIsValid()) {
        // No need to get Direct Login Token.
    } else {
        if (correlatedUserExistsLocally(getCorrelatedUserName(), getCorrelatedPassword(), getCorrelatedUserId()) {
            // No need to create User
            // Just create a new Token. (In the future we can also check if the User is valid i.e. not locked etc.)
            createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword())
        } else {
            //do not need populate the variable
            if (createNewUser()) {
                // if user_id does not exist in local storage that means user has not register or new user then call function create new user().
                createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword())
            } else {
                return 'error'
            }
            //check properly
        }
    }
    openSofit(correlated_user_id)
}

function getCorrelatedUserName(){
    return window.localStorage.getItem('correlated_username'){
    }
}
function getCorrelatedPassword(){
    return window.localStorage.getItem('correlated_password'){
    }
}
function getCorrelatedUserId(){
    return window.localStorage.getItem('correlated_user_id'){
    }
}
//
/** This function will check the validity of the token.
           - It will return  boolean value - if token tokenDuration is less than token date, then it will return true. */
function directLoginTokenIsFresh() {
    let date_token_generated = window.localStorage.getItem('date_token_generated')
    let tokenDuration = date_token_generated + token_life
    let today_date = new Date().getTime()
    return tokenDuration < today_date
}

/** This function will check, User weather stored in exists in local storage or not with defined parameters. */
function correlatedUserExistsLocally(username, password, correlated_user_id) {
    if (username && password && correlated_user_id) {
        return true
    } else {
        return false
    }
}

/** This function checks if the token is valid or not.
          GUARD: 1.  Two options are available for checking the token validation.
                      -The token should be present or expired in the local storage.
                      -Generation of the token by an invalid user.
                2. If the token is valid, call the API to get the current login user. */
function localDirectLoginTokenIsValid() {
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
                return true
            },
        )
    } else {
        return false
    }
}

/** This function checks whether the token is exists in local local storage or not. If the token is present, the endpoint is called and the current login user is returned. */
function directLoginTokenExistsLocally() {
    if (window.localStorage['direct_login_token']) {
        return true
    } else {
        return false
    }
}

/** Call the function to create a new token.
          1. call the API and return the direct login token. */
function createNewDirectLoginToken() {
    createNewUser()
}

/** This function creates a new user.
 * @param {[object]} json Set the http request type json. */
async function createNewUser() {
    const res = await new Promise((resolve, reject) => {
        cordova.plugin.http.setDataSerializer('json')
        // get unique id to create user : uuid
        const uuid_string = device.uuid
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
        cordova.plugin.http.sendRequest(
            `${OBP_API_HOST}/obp/v4.0.0/users`,
            createUserOptions,
            function(response) {
                // Successful user creation
                if (response.status == 201) {
                    let user_data = JSON.parse(response.body)
                    window.localStorage.setItem('correlated_user_id', user_data.user_id)
                    window.localStorage.setItem('correlated_username', user_data.username)
                    window.localStorage.setItem('correlated_password', user_data.password)
                    window.localStorage.setItem('date_token_generated', new Date().getTime())
                }
                resolve(createUserOptions.data)
            },
        )
    })
    if (res) {
        return true
    }
}

/** The token is stored in local memory after generation. */
function storeNewDirectLoginTokenWSE(token) {
    var storage = window.localStorage
    storage.setItem('direct_login_token', token)
    return token
}

/** This is used for the creation of a new token. */
function createAndStoreNewToken(username, password) {
    cordova.plugin.http.setDataSerializer('json')
    //Set the header parameter for the post request.
    //update value in direct login
    cordova.plugin.http.setHeader(
        'Authorization',
        `DirectLogin username=${username} , password= ${password}, consumer_key= + consumer_key`,
    )
    cordova.plugin.http.setHeader('Content-Type', 'application/json ')
    //Create the post request, leave the body and header section empty as it was defined above.
    cordova.plugin.http.post(
        `${OBP_API_HOST}/my/logins/direct`, {}, {},
        function(response) {
            //Convert JSON object to text format
            const res = JSON.parse(response.data)
            return storeNewDirectLoginToken(res.token)
        },
    )
}

/** This function is used to open the Sofit App with user ID. */
function openSofit(user_id) {
    window.open = cordova.InAppBrowser.open(
        `${SOFIT_HOST}?correlated_user_id = ${user_id}`,
        '_blank',
        'location=no',
    )
}