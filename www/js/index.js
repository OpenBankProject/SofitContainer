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

/** This is a debug function, for finding error. */
function setDebugInfo(text) {
  debugInfo = document.getElementById('debugInfo')
  debugInfo.innerHTML = debugInfo.innerHTML + ' --- ' + text + '<br />'
}

/** For each event handler registered after the deviceready event fires has its callback function called immediately. */
async function onDeviceReady() {
  setDebugInfo('Hello from onDeviceReady')
  //let correlated_username = window.localStorage.getItem('username')
  //let correlated_password = window.localStorage.getItem('password')
  //let correlated_user_id = window.localStorage.getItem('correlated_user_id')
  if (
    directLoginTokenExistsLocally() &&
    directLoginTokenIsFresh() &&
    (await localDirectLoginTokenIsValid())
  ) {
    // No need to get Direct Login Token.
    setDebugInfo('All good')
  } else {
    setDebugInfo('no token')
    if (
      correlatedUserExistsLocally(
        getCorrelatedUserName(),
        getCorrelatedPassword(),
        getCorrelatedUserId(),
      )
    ) {
      // No need to create User
      // Just create a new Token. (In the future we can also check if the User is valid i.e. not locked etc.)
      setDebugInfo('Before createAndStoreNewToken')
      createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword())
      setDebugInfo('After createAndStoreNewToken')
    } else {
      //do not need populate the variable
      if (await createNewUser()) {
        setDebugInfo('Before createAndStoreNewToken ')
        // if user_id does not exist in local storage that means user has not register or new user then call function create new user().
        await createAndStoreNewToken(
          getCorrelatedUserName(),
          getCorrelatedPassword(),
        )
        setDebugInfo('After createAndStoreNewToken')
      } else {
        return 'error'
      }
    }
  }

  postUserAttribute(
    'DEVICE_CONTACT_COUNT',
    'INTEGER',
    await getDeviceContactsCount(),
  )
  postUserAttribute(
    'DEVICE_BATTERY_LEVEL',
    'INTEGER',
    await getDeviceBatteryLevel(),
  )
  openSofit(getCorrelatedUserId())
  setDebugInfo('getCorrelatedUserName is: ' + getCorrelatedUserName())
  setDebugInfo('getCorrelatedPassword is: ' + getCorrelatedPassword())
  setDebugInfo('getCorrelatedUserId is: ' + getCorrelatedUserId())
  setDebugInfo('getDirectLoginToken is: ' + getDirectLoginToken())
  setDebugInfo('Bye from onDeviceReady ')
}

function getCorrelatedUserName() {
  setDebugInfo('Hello from getCorrelatedUserName')
  return window.localStorage.getItem('correlated_username')
}

function getCorrelatedPassword() {
  setDebugInfo('Hello from getCorrelatedPassword')
  return window.localStorage.getItem('correlated_password')
}

function getCorrelatedUserId() {
  setDebugInfo('Hello from getCorrelatedUserId')
  return window.localStorage.getItem('correlated_user_id')
}

function getDirectLoginToken() {
  setDebugInfo('Hello from getDirectLoginToken')
  return window.localStorage.getItem('direct_login_token')
}

/** This function will check the validity of the token.
           - It will return  boolean value - if token tokenDuration is less than token date, then it will return true. */
function directLoginTokenIsFresh() {
  setDebugInfo('Hello from directLoginTokenIsFresh')
  let date_token_generated = window.localStorage.getItem('date_token_generated')
  let tokenDuration = date_token_generated + token_life
  let today_date = new Date().getTime()
  return tokenDuration < today_date
  setDebugInfo('Bye from directLoginTokenIsFresh')
}

/** This function will check, User weather stored in exists in local storage or not with defined parameters. */
function correlatedUserExistsLocally(username, password, correlated_user_id) {
  username = window.localStorage.getItem('correlated_username')
  password = window.localStorage.getItem('correlated_password')
  correlated_user_id = window.localStorage.getItem('correlated_user_id')
  setDebugInfo('Hello from correlatedUserExistsLocally')
  setDebugInfo('Username: ' + username)
  setDebugInfo('password: ' + password)
  setDebugInfo('correlated_user_id: ' + correlated_user_id)
  if (username && password && correlated_user_id) {
    setDebugInfo('correlatedUserExistsLocally will return true')
    return true
  } else {
    setDebugInfo('correlatedUserExistsLocally will return false')
    return false
  }
}

//Set the Header parameter for the Post request
function directLoginTokenHeader(){
    cordova.plugin.http.setHeader(
        'DirectLogin',
        `token=${window.localStorage.getItem('direct_login_token')}`,
      )
      cordova.plugin.http.setHeader('Content-Type', 'application/json')
}
/** This function checks if the token is valid or not.
          GUARD: 1.  Two options are available for checking the token validation.
                      -The token should be present or expired in the local storage.
                      -Generation of the token by an invalid user.
                2. If the token is valid, call the API to get the current login user. */
async function localDirectLoginTokenIsValid() {
  setDebugInfo('Hello from localDirectLoginTokenIsValid')
  cordova.plugin.http.setDataSerializer('json')
  directLoginTokenHeader()
  //Post request create, leave body and header section empty because defined above
  return new Promise((resolve) => {
    cordova.plugin.http.get(
      `${OBP_API_HOST}/obp/v4.0.0/users/current`,
      {},
      {},
      function (response) {
        setDebugInfo('directLoginTokenExistsLocally will return true')
        resolve(true)
      },
      function (response) {
        for (const key in response) {
          setDebugInfo(key + response[key])
        }
        setDebugInfo('directLoginTokenExistsLocally will return false')
        resolve(false)
      },
    )
  })
  setDebugInfo('Bye from localDirectLoginTokenIsValid')
}

/** This function checks whether the token exists in local storage or not. */
function directLoginTokenExistsLocally() {
  setDebugInfo('Hello from directLoginTokenExistsLocally')
  if (window.localStorage['direct_login_token']) {
    return true
  } else {
    return false
  }
}

/** Call the function to create a new token.
          1. call the API and return the direct login token. */
function createNewDirectLoginToken() {
  setDebugInfo('Hello from createNewDirectLoginToken')
  createNewUser()
}

/** This function creates a new user.
 * @param {[object]} json Set the http request type json. */
async function createNewUser() {
  setDebugInfo('Hello from createNewUser')
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
  const username = uuid_string
  setDebugInfo('Username: ' + username)
  setDebugInfo('password: ' + randomLongStringPassword)
  window.localStorage.setItem('correlated_username', username)
  window.localStorage.setItem('correlated_password', randomLongStringPassword)
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
  return new Promise((resolve, reject) => {
    cordova.plugin.http.setDataSerializer('json')
    // creating user info based on the uuid
    setDebugInfo('Before create createUserOptions')
    setDebugInfo('Before send request')
    cordova.plugin.http.sendRequest(
      `${OBP_API_HOST}/obp/v4.0.0/users`,
      createUserOptions,
      function (response) {
        // Successful user creation
        if (response.status == 201) {
          setDebugInfo('Status is 201')
          let user_data = JSON.parse(response.data)
          window.localStorage.setItem('correlated_user_id', user_data.user_id)
          resolve(true)
        } else {
          resolve(false)
          setDebugInfo('Status is: ', + response.status)
        }
      },
      function (response) {
        resolve(false)
        setDebugInfo('Error in createNewUser: ', + response.code)
      },
    )
  })
  setDebugInfo('Bye from createNewUser')
}

/** The token is stored in local memory after generation. */
function storeNewDirectLoginToken(token) {
  setDebugInfo('Hello from storeNewDirectLoginToken')
  var storage = window.localStorage
  storage.setItem('direct_login_token', token)
  storage.setItem('date_token_saved', new Date().getTime())
  return token
  setDebugInfo('Hello bye storeNewDirectLoginToken')
}

/** This is used for the creation of a new token. */
async function createAndStoreNewToken(username, password) {
  setDebugInfo('Hello from createAndStoreNewToken')
  setDebugInfo('username is: ' + username)
  setDebugInfo('password is: ' + password)

  cordova.plugin.http.setDataSerializer('json')
  //Set the header parameter for the post request.
  //update value in direct login
  cordova.plugin.http.setHeader(
    'Authorization',
    'DirectLogin username="' +
      username +
      '", password="' +
      password +
      '",consumer_key="' +
      consumer_key +
      '"',
  )
  cordova.plugin.http.setHeader('Content-Type', 'application/json ')
  //Create the post request, leave the body and header section empty as it was defined above.
  setDebugInfo('Before call directlogin API in createAndStoreNewToken')
  return new Promise((resolve) => {
    cordova.plugin.http.post(
      `${OBP_API_HOST}/my/logins/direct`,
      {},
      {},
      function (response) {
        setDebugInfo('After call directlogin API in createAndStoreNewToken')
        //Convert JSON object to text format
        let res = JSON.parse(response.data)
        storeNewDirectLoginToken(res.token)
        resolve(true)
      },
      function (response) {
        resolve(false)
        setDebugInfo('Error in createAndStoreNewToken', + response.code)
      },
    )
  })
  setDebugInfo('Bye from createAndStoreNewToken')
}


function postUserAttribute(key, type, value) {
  setDebugInfo('Hello from postUserAttribute')
  setDebugInfo(`Value from parameters ${key}, ${type}, ${value}`)
  cordova.plugin.http.setDataSerializer('json')
  //Set the Header parameter for the Post request
  directLoginTokenHeader()
  cordova.plugin.http.post(
    `${OBP_API_HOST}/obp/v4.0.0/my/user/attributes`,
    { name: key, type: type, value: value },
    {},
    function (response) {
      //This is a successful response
      setDebugInfo(
        'postUserAttribute will return true. Response is: ' + JSON.stringify(response))
      return response
    },
    function (response) {
      //This is a error case
      setDebugInfo(
        'postUserAttribute will return false. Response is: ' + JSON.stringify(response),
      )
    },
  )
}

/** This function will get contact list from phone and pass as value in postUserAttribute function. */
async function getDeviceContactsCount() {
  let error_number = 0
  setDebugInfo('Hello from getDeviceContact')
  return new Promise((resolve) => {
  navigator.notification.confirm("Press OK to get contact from device", function(){
    try {
      navigator.contactsPhoneNumbers.list(function (contacts) {
        //navigator.notification.confirm("Press OK to get contact from device", function(){
        total_count = contacts.length
        resolve(total_count)
      })
    } catch (error) {
      setDebugInfo(error)
      resolve(error_number)
    }
  })
  })
}

/** This function will return the device battery level. */
async function getDeviceBatteryLevel() {
  setDebugInfo('Hello from getDeviceBatteryLevel')
  try {
    const battery_life = await navigator.getBattery()
    const battery_response = await battery_life.level
    return Math.round(battery_response * 100)
  } catch (error) {
    setDebugInfo(error)
    return 0
  }
}

/** This function is used to open the Sofit App with user ID. */
function openSofit(user_id) {
  setDebugInfo('Hello from openSofit')
  window.open = cordova.InAppBrowser.open(
    `${SOFIT_HOST}?correlated_user_id = ${user_id}`,
    '_blank',
    'location=no',
  )
  setDebugInfo('Bye from openSofit')
}

////how to clean up the function returned value before calling it again