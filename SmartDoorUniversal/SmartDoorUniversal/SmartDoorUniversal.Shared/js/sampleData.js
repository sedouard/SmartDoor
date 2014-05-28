// Create sample data using a list
var g_DoorBellFeed = new WinJS.Binding.List([
	{ url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', time: '4:27 PM', id:'Facebook:32543225', identifiedPerson : { name:'Steven Edouard', confidence:56, id:'Facebook:589908326'}},
	{ url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', time: '4:27 PM', id: 'Facebook:32543225', identifiedPerson : { name:'Steven Edouard', confidence:56, id:'Facebook:589908326'}},
{ url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', time: '4:27 PM', id: 'Facebook:32543225', identifiedPerson : { name:'Steven Edouard', confidence:56, id:'Facebook:589908326'}},
{ url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', time: '4:27 PM', id: 'Facebook:32543225', identifiedPerson : { name:'Steven Edouard', confidence:56, id:'Facebook:589908326'}}
]);

var g_Friends = new WinJS.Binding.List([
    { name: 'Chrstine Matheny', photo: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', id: '462154623542', isBeingIdentified: '/images/emptyIcon.png', id: '' },
    { name: 'Chrstine Matheny', photo: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', id: '462154623542', isBeingIdentified: '/images/id_icon.png', id: '' },
    { name: 'Chrstine Matheny', photo: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', id: '462154623542', isBeingIdentified: '/images/emptyIcon.png', id: '' },
    { name: 'Chrstine Matheny', photo: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg', id: '462154623542', isBeingIdentified: '/images/id_icon.png', id: '' }
]);

var g_FriendPhotos = new WinJS.Binding.List([{ url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg' },
                    { url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg' },
                    { url: 'http://smartdoor.blob.core.windows.net/maincontainer/4727fc16-3fb9-485a-8e38-d1434f6aaa22.jpg' }]);
