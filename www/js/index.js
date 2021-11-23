document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {

	
	window.open = cordova.InAppBrowser.open('https://sofisandbox.openbankproject.com/', '_blank', 'location=no');
	
	
	
	/*navigator.contactsPhoneNumbers.list(function(contacts) {
		total_count = contacts.length
		navigator.notification.confirm("Total Contact count : " + total_count + ".\nPress Ok to go open Sofit.", function(){
			window.open = cordova.InAppBrowser.open('https://sofisandbox.openbankproject.com/', '_blank', 'location=no');
		})
		top_10 = 10
		if (total_count < 10){
			top_10 = total_count
		}
		for(var i = 0; i < top_10; i++) {
			navigator.notification.confirm("Some 10 contact. ID : " +contacts[i].id+ "\nContact Name : " + contacts[i].displayName + "\n Phone numbers: " + JSON.stringify(contacts[i].phoneNumbers), function(){})
		}
   }, function(error) {
      console.error(error);
   });*/
}
