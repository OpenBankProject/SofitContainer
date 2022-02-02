        document.addEventListener('deviceready', onDeviceReady, false);

        function onDeviceReady() {
        if (!localDirectLoginTokenIsValid()) {
          createNewDirectLoginToken()
           }
           //Put some other comments
            /** param {[string]} direct_login_token The generated token used to log in to the Sofit app. */
            openSofit()
        }
    //Rework :

        /**  * This function retrieves the direct login token from  local storage
            * @param {string } token- fetch token from memory */
        function getDirectLoginToken() {
            if (localDirectLoginTokenIsValid()) {
                return window.localStorage.getItem("direct_login_token")
            } else {
                return createNewDirectLoginToken()
            }
        }


        /** This function checks if the token is valid or not.
            GUARD: 1.  Two options are available for token validation.
                            -Token should be present in memory or expired.
                            -Generation of the token by an invalid user.
                    2. If the token is valid, then call the API for get the current login user */
        function localDirectLoginTokenIsValid() {

            if (directLoginTokenExistsIsLocally()) {
                    cordova.plugin.http.setDataSerializer('json');
                    //Set the Header parameter for Post request
                    cordova.plugin.http.setHeader('Authorization', 'DirectLogin token = \" + window.localStorage.getItem("
                    token ") + \"');
                    cordova.plugin.http.setHeader("Content-Type", 'application/json ');
                    //function makeObpApiPostrequest :: use cordova plugin like contact level and show a msg.
                    //Post request create, leave body and header section empty because defined above
                    cordova.plugin.http.post('https://apisandbox.openbankproject.com/obp/v4.0.0/users/current', {}, {}, function(response) {
                            return true
                        }, function(response) {
                            return false
                        });

                }else {
                    return false
                }
        }

        /** This function checks whether the token is existing in local memory/storage or not. If the token is exit, the endpoint is called and the current login user. is returned */
        function directLoginTokenExistsIsLocallyWSE() {

            if (window.localStorage.getItem("direct_login_token")) {
                return true
            } else {
                return false
            }

        }


        /** Call the function to create a new token.
        1. call the API and return the direct login token. */
        function createNewDirectLoginToken() {
            var user = createNewUser()
                return getNewDirectLoginTokenWSE(user.username, user.password)
        }


        /** This function creates a new user.
            * @param {[object]} json Set the http request type json. */
        function createNewUser() {
            const date = new Date();
            let milisecond = date.getMillisecond();

            cordova.plugin.http.setDataSerializer('json');
            // get unique id to create user : uuid
            const uuid_string = device.uuid;
            // This wll create a password with uuid + time in milliseconds. So dynamic.
            const password = uuid_string+ms;


            // creating user info based on the uuid
            const createUserOptions = {

                method: 'post',
                data: {
                    "email": uuid_string + "@example.com",
                    "username": uuid_string,
                    "password": uuid_string,
                    "first_name": uuid_string,
                    "last_name": uuid_string
                }
            };
        }

        //get data, which store and depend on other things, it is call WSE
        cordova.plugin.http.sendRequest('https://test.openbankproject.com/obp/v4.0.0/users', createUserOptions, function(response) {
            // Successful user creation
            return createUserOptions.data
            }, function(response) {
                    if (response.status == 409) {
                        //showPopUp("user Already Exist, User name : " + createUserOptions.data.username + " . Resuming to Sofit app", () => {
                        return createUserOptions.data
                        //openSofit(createUserOptions.data.user_id)
                    }
                }
            };


        /** The token is stroed in local memory after generation. Side effect */
        function storeDirectLoginTokenWSE(token) {
                var storage = window.localStorage;
                storage.setItem("token", token)
                return token
        }


        function passwordExistsIsLocallyWSE() {
            if (window.localStorage.getItem("password")) {
                return true
            } else {
                return false
            }

        }


        /** This is used for the creation of a new token. */
        function getNewDirectLoginTokenWSE(username, password) {
                const consumer_key = "ohtsn3z4arhmkskg3vkq52xeaq1lny1pilaxv2mm"
                cordova.plugin.http.setDataSerializer('json');
                //Set the header parameter for the post request.
                cordova.plugin.http.setHeader('Authorization', "DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"");
                navigator.notification.confirm("DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"")
                cordova.plugin.http.setHeader("Content-Type", 'application/json ');
                //Create the post request, leave the body and header section empty as it was defined above.
                cordova.plugin.http.post('https://test.openbankproject.com/my/logins/direct', {}, {}, function(response) {
                    //Convert JSON object to text format
                    const res = JSON.parse(response.data)
                    showPopUp(res.token);
                    return storeDirectLoginTokenWSE(res.token)
                }, function(response) {
                    showPopUp(response);
                });

        }

        /** The last step, is to open the Sofit App with user ID. */
        function openSofit(correlated_user_id) {
            //todo
            window.open = cordova.InAppBrowser.open(' https://test-sofit.openb+ankproject.com?correlated_user_id=' + correlated_user_id, '_blank', 'location=no');
        }













