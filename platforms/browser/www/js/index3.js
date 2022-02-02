  /** Wait for the deviceready event before using any of Cordova's device APIs. The Deviceready event fires when Cordova is fully loaded*/
  document.addEventListener('deviceready', onDeviceReady, false);
  const consumer_key = "s0dk3jjlld5gnyihfsut1v4adxjq2cn5d5vtrqq1"

        /** Any event handler registered after the deviceready event fires has its callback function called immediately. */
        function onDeviceReady() {
            /** This function checks whether the token is valid or not. If the token is not valid, the function is called to create a new token. */
            if (!localDirectLoginTokenIsValid()) {
                      createNewDirectLoginToken()

                       }
        }

        /** This function checks if the token is valid or not. */
        function localDirectLoginTokenIsValid() {
                    if (directLoginTokenExistsIsLocallyWSE()) {
                          getUserDetail()
                        }else {
                            return false
                        }
                }

        /** This function checks whether the token is existing in local memory/storage or not. */
        function directLoginTokenExistsIsLocallyWSE() {
                            if (window.localStorage.getItem("direct_login_token")) {
                                return true
                            } else {
                                return false
                            }

                        }
        /** This function will to open the Sofit App with user ID. */
        function openSofit(correlated_user_id) {
                    window.open = cordova.InAppBrowser.open(' https://test-sofit.openbankproject.com?correlated_user_id=' + correlated_user_id, '_blank', 'location=no');
                }

        /** Call the function to create a new token. */
        function createNewDirectLoginToken() {
                    var user = createNewUser()
                }
        /** 1. This function creates a new user.
               - @param {[object]} json Set the http request type json.
            2. call the API and return the direct login token.*/
        function createNewUser() {
                    const date = new Date();
                    let milliseconds = date.getMilliseconds();
                    cordova.plugin.http.setDataSerializer('json');
                    // get unique id to create user : uuid
                    const uuid_string = device.uuid;
                    // This wll create a password with uuid + time in milliseconds. So dynamic.
                    const password = uuid_string+milliseconds;
                    // creating user info based on the uuid
                    const createUserOptions = {
                        method: 'post',
                        data: {
                            "email": uuid_string +"@example.com",
                            "username": uuid_string,
                            "password": password,
                            "first_name": uuid_string,
                            "last_name": uuid_string
                        }
                    };
                                    cordova.plugin.http.sendRequest('https://obp-apisandbox.bancohipotecario.com.sv/obp/v4.0.0/users', createUserOptions, function(response) {
                                        // Successful user creation
                                        return getNewDirectLoginTokenWSE(createUserOptions.data.username, createUserOptions.data.password)
                                        })
                                        };

        /** This is used for the creation of a new token. */
        function getNewDirectLoginTokenWSE(username, password) {
                        cordova.plugin.http.setDataSerializer('json');
                        //Set the header parameter for the post request.
                        cordova.plugin.http.setHeader('Authorization', "DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"");
                        navigator.notification.confirm("DirectLogin username=\"" + username + "\", password=\"" + password + "\",consumer_key=\"" + consumer_key + "\"")
                        cordova.plugin.http.setHeader("Content-Type", 'application/json ');
                        //Create the post request, leave the body and header section empty as it was defined above.
                        cordova.plugin.http.post('https://obp-apisandbox.bancohipotecario.com.sv/my/logins/direct', {}, {}, function(response) {
                            //Convert JSON object to text format
                             const res = JSON.parse(response.data)
                             var storage = window.localStorage;
                             storage.setItem("username", username)
                             storage.setItem("password", password)
                             storeDirectLoginTokenWSE(res.token)
                             getUserDetail()
                        });

                }

        /** The token is stroed in local memory after generation. */
        function storeDirectLoginTokenWSE(token) {
                        var storage = window.localStorage;
                        storage.setItem("direct_login_token", token)
                        return token
                }

        /** GUARD: 1.  Two options are available for token validation.
                       -Token should be present in memory or expired.
                       -Generation of the token by an invalid user.
                   2. If the token is valid, then call the API for get the current login user */
        function getUserDetail () {
             cordova.plugin.http.setDataSerializer('json');
                                        //Set the Header parameter for Post request
                                        cordova.plugin.http.setHeader('Authorization', 'DirectLogin token="' +  window.localStorage.getItem('direct_login_token') + '"');
                                        cordova.plugin.http.setHeader("Content-Type", 'application/json ');
                                        //Post request create, leave body and header section empty because defined above
                                        cordova.plugin.http.get('https://obp-apisandbox.bancohipotecario.com.sv/obp/v4.0.0/users/current', {}, {}, function(response) {
                                        if (response.status == 400) {
                                           getNewDirectLoginTokenWSE(window.localStorage.getItem("username"), window.localStorage.getItem("password"))
                                        }
                                        openSofit(JSON.parse(response.data).user_id)
                                            }, function(response){
                                            } )
        }
