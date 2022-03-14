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
document.addEventListener("deviceready", onDeviceReady, false);
const consumer_key = "xznnnce3pn3v5lddyayuiphc1cvm25fykx1y034l";
const SOFIT_HOST = "https://includimi-sofit.tesobe.com";
const OBP_API_HOST = "https://includimi.tesobe.com";
//Token will expire within 4 Weeks
let token_life = 27 * 24 * 60 * 60 * 1000;

/** This is a debug function, for finding error. */
function setDebugInfo(text) {
  debugInfo = document.getElementById("debugInfo");
  debugInfo.innerHTML = debugInfo.innerHTML + " --- " + text + "<br />";
}

/** For each event handler registered after the deviceready event fires has its callback function called immediately. */
async function onDeviceReady() {
  setDebugInfo("Hello from onDeviceReady");
  //let correlated_username = window.localStorage.getItem('username')
  //let correlated_password = window.localStorage.getItem('password')
  //let correlated_user_id = window.localStorage.getItem('correlated_user_id')
  if (
    directLoginTokenExistsLocally() &&
    directLoginTokenIsFresh() &&
    (await localDirectLoginTokenIsValid())
  ) {
    // No need to get Direct Login Token.
    setDebugInfo("All good");
  } else {
    setDebugInfo("no token");
    if (
      correlatedUserExistsLocally(
        getCorrelatedUserName(),
        getCorrelatedPassword(),
        getCorrelatedUserId()
      )
    ) {
      // No need to create User
      // Just create a new Token. (In the future we can also check if the User is valid i.e. not locked etc.)
      setDebugInfo("Before createAndStoreNewToken");
      createAndStoreNewToken(getCorrelatedUserName(), getCorrelatedPassword());
      setDebugInfo("After createAndStoreNewToken");
    } else {
      if (await createNewUser()) {
        setDebugInfo("Before createAndStoreNewToken ");
        // if user_id does not exist in local storage that means user has not register or new user then call function create new user().
        await createAndStoreNewToken(
          getCorrelatedUserName(),
          getCorrelatedPassword()
        );
        setDebugInfo("After createAndStoreNewToken");
      } else {
        return "error";
      }
    }
  }

  var haspermission = await getContactPermissionStatus();
  setDebugInfo(" Has permissions will be: " + haspermission);

  if (haspermission) {
    postUserAttribute(
      "DEVICE_CONTACT_COUNT",
      "INTEGER",
      await getDeviceContactsCount()
    );
  }

  await postBatteryLevelPeriodically();

  setDebugInfo("getCorrelatedUserName is: " + getCorrelatedUserName());
  setDebugInfo("getCorrelatedPassword is: " + getCorrelatedPassword());
  setDebugInfo("getCorrelatedUserId is: " + getCorrelatedUserId());
  setDebugInfo("getDirectLoginToken is: " + getDirectLoginToken());

  openSofit(getCorrelatedUserId());

  setDebugInfo("Bye from onDeviceReady ");
}

function getCorrelatedUserName() {
  setDebugInfo("Hello from getCorrelatedUserName");
  return window.localStorage.getItem("correlated_username");
}

function getCorrelatedPassword() {
  setDebugInfo("Hello from getCorrelatedPassword");
  return window.localStorage.getItem("correlated_password");
}

function getCorrelatedUserId() {
  setDebugInfo("Hello from getCorrelatedUserId");
  return window.localStorage.getItem("correlated_user_id");
}

function getDirectLoginToken() {
  setDebugInfo("Hello from getDirectLoginToken");
  return window.localStorage.getItem("direct_login_token");
}

/** This function will check the validity of the token.
           - It will return  boolean value - if token tokenDuration is less than token date, then it will return true. */
function directLoginTokenIsFresh() {
  setDebugInfo("Hello from directLoginTokenIsFresh");
  let date_token_generated = window.localStorage.getItem(
    "date_token_generated"
  );
  let tokenDuration = date_token_generated + token_life;
  let today_date = new Date().getTime();
  return tokenDuration < today_date;
  setDebugInfo("Bye from directLoginTokenIsFresh");
}

/** This function will check, User weather stored in exists in local storage or not with defined parameters. */
function correlatedUserExistsLocally(username, password, correlated_user_id) {
  username = window.localStorage.getItem("correlated_username");
  password = window.localStorage.getItem("correlated_password");
  correlated_user_id = window.localStorage.getItem("correlated_user_id");
  setDebugInfo("Hello from correlatedUserExistsLocally");
  setDebugInfo("Username: " + username);
  setDebugInfo("password: " + password);
  setDebugInfo("correlated_user_id: " + correlated_user_id);
  if (username && password && correlated_user_id) {
    setDebugInfo("correlatedUserExistsLocally will return true");
    return true;
  } else {
    setDebugInfo("correlatedUserExistsLocally will return false");
    return false;
  }
}

//Set the Header parameter for the Post request
function setHeaders() {
  cordova.plugin.http.setHeader(
    "DirectLogin",
    `token=${window.localStorage.getItem("direct_login_token")}`
  );
  cordova.plugin.http.setHeader("Content-Type", "application/json");
}

/** This function checks if the token is valid or not.
          GUARD: 1.  Two options are available for checking the token validation.
                      -The token should be present or expired in the local storage.
                      -Generation of the token by an invalid user.
                2. If the token is valid, call the API to get the current login user. */
async function localDirectLoginTokenIsValid() {
  setDebugInfo("Hello from localDirectLoginTokenIsValid");
  cordova.plugin.http.setDataSerializer("json");
  //Set the Header parameter for the Post request
  setHeaders();
  //Post request create, leave body and header section empty because defined above
  return new Promise((resolve) => {
    cordova.plugin.http.get(
      `${OBP_API_HOST}/obp/v4.0.0/users/current`,
      {},
      {},
      function (response) {
        let userid = {};
        try {
          userid = JSON.parse(response.data);
        } catch (error) {}
        setDebugInfo(
          "directLoginTokenExistsLocally will return true: " +
            JSON.stringify(userid.user_id)
        );
        window.localStorage.setItem("correlated_user_id", userid.user_id);
        resolve(true);
      },
      function (response) {
        for (const key in response) {
          setDebugInfo(key + response[key]);
        }
        setDebugInfo(
          "directLoginTokenExistsLocally will return false" +
            JSON.stringify(response)
        );
        resolve(false);
      }
    );
  });
}

/** This function checks whether the token is exists in local local storage or not. If the token is present, the endpoint is called and the current login user is returned. */
function directLoginTokenExistsLocally() {
  setDebugInfo("Hello from directLoginTokenExistsLocally");
  if (window.localStorage["direct_login_token"]) {
    return true;
  } else {
    return false;
  }
}

/** Call the function to create a new token.
          1. call the API and return the direct login token. */
function createNewDirectLoginToken() {
  setDebugInfo("Hello from createNewDirectLoginToken");
  createNewUser();
}

/** This function creates a new user.
 * @param {[object]} json Set the http request type json. */
async function createNewUser() {
  setDebugInfo("Hello from createNewUser");
  // get unique id to create user : uuid
  const uuid_string = device.uuid;
  var randomLongStringPassword = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < 20; i++) {
    randomLongStringPassword += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  var createUserName = "";
  var userNameCharacter =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var userNameCharacterLength = userNameCharacter.length;
  for (var i = 0; i < 12; i++) {
    createUserName += userNameCharacter.charAt(
      Math.floor(Math.random() * userNameCharacterLength)
    );
  }
  setDebugInfo("Username: " + createUserName);
  setDebugInfo("password: " + randomLongStringPassword);
  window.localStorage.setItem("correlated_username", createUserName);
  window.localStorage.setItem("correlated_password", randomLongStringPassword);
  const createUserOptions = {
    method: "post",
    data: {
      email: uuid_string + "@example.com",
      username: createUserName,
      password: randomLongStringPassword,
      first_name: uuid_string,
      last_name: uuid_string,
    },
  };
  return new Promise((resolve, reject) => {
    cordova.plugin.http.setDataSerializer("json");
    // creating user info based on the uuid
    setDebugInfo("Before create createUserOptions");
    setDebugInfo("Before send request");
    cordova.plugin.http.sendRequest(
      `${OBP_API_HOST}/obp/v4.0.0/users`,
      createUserOptions,
      function (response) {
        // Successful user creation
        if (response.status == 201) {
          setDebugInfo("Status is 201");
          let user_data = JSON.parse(response.data);
          window.localStorage.setItem("correlated_user_id", user_data.user_id);
          resolve(true);
        } else {
          resolve(false);
          setDebugInfo("Status is : ", + response.status);
        }
      },
      function (response) {
        //User already exists in the database. This function handle error in create new user.
        let userExistError = {};
        try {
          userExistError = JSON.parse(response.error);
        } catch (error) {
          setDebugInfo(error);
        }
        if (
          userExistError.message ===
          "User with the same username already exists."
        ) {
          return LoadLostLocalStorageData(username, password);
        }
        resolve(false);
        setDebugInfo("Error in createNewUser", + response.status);
      }
    );
  });
}

/** This function load username and password, when reinstall app.*/
async function LoadLostLocalStorageData(username, password) {
  await createAndStoreNewToken(username, password);
  await localDirectLoginTokenIsValid();
}

/** The token is stored in local memory after generation. */
function storeNewDirectLoginToken(token) {
  setDebugInfo("Hello from storeNewDirectLoginToken");
  var storage = window.localStorage;
  storage.setItem("direct_login_token", token);
  storage.setItem("date_token_saved", new Date().getTime());
  return token;
  setDebugInfo("Hello bye storeNewDirectLoginToken");
}

/** This is used for the creation of a new token. */
async function createAndStoreNewToken(username, password) {
  setDebugInfo("Hello from createAndStoreNewToken");
  setDebugInfo("username is: " + username);
  setDebugInfo("password is: " + password);

  cordova.plugin.http.setDataSerializer("json");
  //Set the header parameter for the post request.
  cordova.plugin.http.setHeader(
    "DirectLogin",
    'username="' +
      username +
      '", password="' +
      password +
      '",consumer_key="' +
      consumer_key +
      '"'
  );
  cordova.plugin.http.setHeader("Content-Type", "application/json ");
  //Create the post request, leave the body and header section empty as it was defined above.
  setDebugInfo("Before call directlogin API in createAndStoreNewToken");
  return new Promise((resolve) => {
    cordova.plugin.http.post(
      `${OBP_API_HOST}/my/logins/direct`,
      {},
      {},
      function (response) {
        setDebugInfo("After call directlogin API in createAndStoreNewToken");
        //Convert JSON object to text format
        let res = JSON.parse(response.data);
        storeNewDirectLoginToken(res.token);
        resolve(true);
      },
      function (response) {
        resolve(false);
        setDebugInfo("Error in createAndStoreNewToken", + response.status);
      }
    );
  });
}

/** In this function, call the endpoint for User Attributes. */
function postUserAttribute(key, type, value) {
  setDebugInfo("Hello from postUserAttribute");
  setDebugInfo(`Value from parameters ${key}, ${type}, ${value}`);
  cordova.plugin.http.setDataSerializer("json");
  //Set the Header parameter for the Post request
  setHeaders();
  //Post request create, leave body and header section empty because defined above
  cordova.plugin.http.post(
    `${OBP_API_HOST}/obp/v4.0.0/my/user/attributes`,
    { name: key, type: type, value: value },
    {},
    function (response) {
      setDebugInfo(response.status);
      setDebugInfo("postUserAttribute will return true");
      return response;
    },
    function (response) {
      setDebugInfo(
        "postUserAttribute will return false" + JSON.stringify(response)
      );
    }
  );
}

/** This function will get contact list from phone and pass as value in postUserAttribute function. */
async function getDeviceContactsCount() {
  setDebugInfo("Hello from getDeviceContact");
  return new Promise((resolve) => {
    navigator.contactsPhoneNumbers.list(function (contacts) {
      total_count = contacts.length;
      resolve(total_count);
    });
  });
}
/** This function Check Android Permission. */
async function getContactPermissionStatus() {
  setDebugInfo("Hello from getContactPermissionStatus");
  return new Promise((resolve) => {
    var permissions = cordova.plugins.permissions;
    permissions.requestPermission(
      permissions.READ_CONTACTS,
      function (status) {
        setDebugInfo(
          "success requesting READ_CONTACTS permission" + JSON.stringify(status)
        );
        resolve(status.hasPermission);
      },
      function (err) {
        setDebugInfo("Failed to set permission");
        resolve(false);
      }
    );
  });
  setDebugInfo("Bye from getContactPermissionStatus");
}

/** This function will return the device battery level. */
async function getDeviceBatteryLevel() {
  setDebugInfo("Hello from getDeviceBatteryLevel");
  return new Promise((resolve) => {
    navigator.notification.confirm(
      "Device Battery Level is",
      async function () {
        try {
          const battery_life = await navigator.getBattery();
          const battery_response = await battery_life.level;
          resolve(Math.round(battery_response * 100));
        } catch (error) {
          setDebugInfo(error);
          resolve(0);
        }
      }
    );
  });
  setDebugInfo("Bye from getDeviceBatteryLevel");
}

/** This function is used for call getDeviceBatteryLevel function in every hour. */
function postBatteryLevelPeriodically() {
  setDebugInfo("Hello from postBatteryLevelPeriodically");
  setInterval(async function () {
    postUserAttribute(
      "DEVICE_BATTERY_LEVEL",
      "INTEGER",
      await getDeviceBatteryLevel()
    );
    // Every hour call this function.
  }, 60 * 60 * 1000);
  setDebugInfo("Bye from postBatteryLevelPeriodically");
}

/** This function is used to open the Sofit App with user ID. */
function openSofit(user_id) {
  setDebugInfo("Hello from openSofit");
  window.open = cordova.InAppBrowser.open(
    `${SOFIT_HOST}?correlated_user_id = ${user_id}`,
    "_blank",
    "location=no"
  );
  setDebugInfo("Bye from openSofit");
}
